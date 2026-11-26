import { Client, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";

/**
 * Notion-backed "Writing" content — the same database that drives the Writing
 * section on lengocha.vercel.app, read directly rather than copied into this
 * repo. Editing a post in Notion updates this site too.
 *
 * SERVER ONLY. `NOTION_TOKEN` is a secret and must never reach the browser, so
 * nothing here may be imported from a `"use client"` component. The Writing
 * window talks to `/api/writing` instead.
 *
 * Setup (.env, already gitignored):
 *   NOTION_TOKEN         — internal integration token
 *   NOTION_WRITING_DB_ID — id of the Writing database shared with the integration
 *
 * Expected database properties (matched case-sensitively):
 *   Title       (title)        — required
 *   Description (rich_text)    — short summary shown on the card
 *   Tags        (multi_select) — topic chips
 *   Published   (checkbox)     — only checked rows show (missing => shown)
 *   Date        (date)         — sort key and displayed date (missing => created)
 *   Slug        (rich_text)    — URL slug (missing => derived from the title)
 *   Cover       (url | files)  — optional cover image
 *
 * A cover can hold two kinds of URL and they are NOT equivalent: `external` is a
 * pasted link that never expires, while `file` is uploaded into Notion and
 * arrives as a signed S3 URL that dies in about an hour. Both are accepted, but
 * only the first is reliable.
 *
 * Every function degrades to empty/null rather than throwing, so a missing token
 * or a Notion outage leaves the window empty instead of breaking the desktop —
 * except the `...OrThrow` pair, which the statically regenerated pages use so
 * that an outage keeps the last good page instead of caching an empty one.
 */

export interface PostMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  /** ISO 8601. */
  date: string;
  /** The page's Notion emoji icon, or "" when it has none or uses an image. */
  emoji: string;
  /** Cover image URL, or "" when the post has none. May be an expiring URL. */
  coverUrl: string;
  /**
   * Estimated minutes to read, measured from the markdown body. Only known once
   * the body has been fetched at least once this process — the list query never
   * fetches bodies — so it is absent until `warmPostCache` (or a reader) has
   * been past that post. The window renders the badge conditionally.
   */
  readingMinutes?: number;
}

export interface Post extends PostMeta {
  markdown: string;
}

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_WRITING_DB_ID = process.env.NOTION_WRITING_DB_ID;

export function isNotionConfigured(): boolean {
  return Boolean(NOTION_TOKEN && NOTION_WRITING_DB_ID);
}

let cachedClient: Client | null = null;
function getClient(): Client {
  cachedClient ??= new Client({ auth: NOTION_TOKEN });
  return cachedClient;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readTitle(page: PageObjectResponse): string {
  for (const prop of Object.values(page.properties)) {
    if (prop.type === "title") {
      const text = prop.title
        .map((t) => t.plain_text)
        .join("")
        .trim();
      if (text) return text;
    }
  }
  return "Untitled";
}

function readRichText(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name];
  if (prop?.type === "rich_text") {
    return prop.rich_text
      .map((t) => t.plain_text)
      .join("")
      .trim();
  }
  return "";
}

function readTags(page: PageObjectResponse, name: string): string[] {
  const prop = page.properties[name];
  return prop?.type === "multi_select" ? prop.multi_select.map((o) => o.name) : [];
}

function readDate(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name];
  if (prop?.type === "date" && prop.date?.start) return prop.date.start;
  return page.created_time;
}

/**
 * Only the emoji case is useful: the file cases are signed URLs that expire,
 * while an emoji is a character and cannot.
 */
function readEmoji(page: PageObjectResponse): string {
  return page.icon?.type === "emoji" ? page.icon.emoji : "";
}

/** An explicit `Cover` property wins over the page's own banner. */
function readCoverUrl(page: PageObjectResponse): string {
  const prop = page.properties["Cover"];

  if (prop?.type === "url" && prop.url) return prop.url;

  if (prop?.type === "files") {
    for (const file of prop.files) {
      if (file.type === "external") return file.external.url;
      if (file.type === "file") return file.file.url;
    }
  }

  const banner = page.cover;
  if (banner?.type === "external") return banner.external.url;
  if (banner?.type === "file") return banner.file.url;

  return "";
}

function isPublished(page: PageObjectResponse, name: string): boolean {
  const prop = page.properties[name];
  // No Published checkbox at all means everything shared is published.
  return prop?.type === "checkbox" ? prop.checkbox : true;
}

function toMeta(page: PageObjectResponse): PostMeta {
  const title = readTitle(page);
  const slugSource = readRichText(page, "Slug") || title;
  return {
    id: page.id,
    slug: slugify(slugSource) || page.id.replace(/-/g, ""),
    title,
    description: readRichText(page, "Description"),
    tags: readTags(page, "Tags"),
    date: readDate(page, "Date"),
    emoji: readEmoji(page),
    coverUrl: readCoverUrl(page),
  };
}

/**
 * Short-lived memo, and the TTL matters.
 *
 * The Astro original memoises for one render and lets ISR decide how long a page
 * is reused. There is no ISR here — these are route handlers in a long-running
 * server, so a plain module-level promise would never expire and a post edited in
 * Notion would never appear. 60 seconds collapses the burst of requests that one
 * window-open causes while keeping the window essentially live.
 */
const LIST_TTL_MS = 60_000;
let cache: { at: number; posts: PostMeta[] } | null = null;
let inFlight: Promise<PostMeta[]> | null = null;

/** Throws on any Notion failure; callers decide whether that is fatal. */
async function fetchPublishedPosts(): Promise<PostMeta[]> {
  if (!isNotionConfigured()) return [];
  const notion = getClient();
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: NOTION_WRITING_DB_ID as string,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const result of response.results) {
      if (isFullPage(result) && isPublished(result, "Published")) pages.push(result);
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages.map(toMeta).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * Reading times live OUTSIDE the list cache and are merged at return time: a
 * warm-up finishing between two list requests should show up in the second
 * response without waiting out the list TTL.
 */
const readingMinutesBySlug = new Map<string, number>();

/** ~200 wpm reading speed; whitespace-split is close enough for Vietnamese prose. */
function estimateReadingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function withReadingMinutes(posts: PostMeta[]): PostMeta[] {
  return posts.map((post) => {
    const readingMinutes = readingMinutesBySlug.get(post.slug);
    return readingMinutes === undefined ? post : { ...post, readingMinutes };
  });
}

/**
 * All published posts, newest first. Throws when Notion fails.
 *
 * The strict form is for pages that are statically regenerated (ISR): a throw
 * there keeps the last good page in the cache, where an empty list would bake
 * "no posts" — or a 404 for every article — into it until the next revalidate.
 * Only successful reads are memoised, so an outage is retried on the next call.
 */
export async function getPublishedPostsOrThrow(): Promise<PostMeta[]> {
  if (cache && Date.now() - cache.at < LIST_TTL_MS) {
    return withReadingMinutes(cache.posts);
  }

  // Share one round trip between concurrent callers rather than stampeding.
  inFlight ??= fetchPublishedPosts()
    .then((posts) => {
      cache = { at: Date.now(), posts };
      return posts;
    })
    .finally(() => {
      inFlight = null;
    });

  return withReadingMinutes(await inFlight);
}

/** All published posts, newest first. Empty when unconfigured or on error. */
export async function getPublishedPosts(): Promise<PostMeta[]> {
  try {
    return await getPublishedPostsOrThrow();
  } catch (error) {
    console.error("[notion] getPublishedPosts failed:", error);
    return [];
  }
}

/**
 * Article bodies are cached far longer than the list, and the reason is cost.
 *
 * `pageToMarkdown` walks the block tree with one API call per level of children,
 * so a post's latency scales with how nested it is, not how long it is. Measured
 * cold, end to end through the route: 1.1s for the simplest of the four posts and
 * 11.0s for the one with 27 sub-headings, 9 tables and 54 list items. That is
 * long enough to read as broken.
 *
 * Nothing about a published article changes minute to minute, so 10 minutes of
 * reuse turns every open after the first into an instant one. Four posts of
 * ~30KB markdown is a rounding error in memory.
 */
const POST_TTL_MS = 10 * 60_000;
const postCache = new Map<string, { at: number; post: Post }>();
/** Two clicks on the same slug share one walk instead of racing two. */
const postInFlight = new Map<string, Promise<Post | null>>();

async function fetchPost(slug: string): Promise<Post | null> {
  const meta = (await getPublishedPostsOrThrow()).find((p) => p.slug === slug);
  if (!meta) return null;

  const n2m = new NotionToMarkdown({ notionClient: getClient() });
  const blocks = await n2m.pageToMarkdown(meta.id);
  const { parent } = n2m.toMarkdownString(blocks);

  const markdown = parent ?? "";
  const readingMinutes = estimateReadingMinutes(markdown);
  readingMinutesBySlug.set(slug, readingMinutes);

  return { ...meta, readingMinutes, markdown };
}

/**
 * A single published post with its Markdown body, or null if there is no such
 * post. Throws when Notion fails — see `getPublishedPostsOrThrow` for why pages
 * want that — while `getPostBySlug` below keeps the old forgiving contract.
 */
export async function getPostBySlugOrThrow(slug: string): Promise<Post | null> {
  if (!isNotionConfigured()) return null;

  const hit = postCache.get(slug);
  if (hit && Date.now() - hit.at < POST_TTL_MS) return hit.post;

  const existing = postInFlight.get(slug);
  if (existing) return existing;

  const pending = fetchPost(slug)
    .then((post) => {
      if (post) postCache.set(slug, { at: Date.now(), post });
      return post;
    })
    .finally(() => {
      postInFlight.delete(slug);
    });

  postInFlight.set(slug, pending);
  return pending;
}

/** A single published post with its Markdown body, or null if not found or on error. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    return await getPostBySlugOrThrow(slug);
  } catch (error) {
    console.error(`[notion] getPostBySlug("${slug}") failed:`, error);
    return null;
  }
}

/**
 * Renders every published body into the post cache, in the background.
 *
 * A cold article costs one Notion request per level of block nesting — measured
 * at 1-11s across these posts — and the hover prefetch only helps the article
 * being hovered. Kicking this after a list request means that by the time a
 * visitor has scanned the cards, most bodies answer from cache. Sequential on
 * purpose: ten parallel block-tree walks is how one visitor becomes a Notion
 * rate-limit incident.
 *
 * Re-arms itself at the post cache's own TTL so entries are re-rendered about
 * as often as they expire, instead of on every list request.
 */
let warmStartedAt = 0;

export function warmPostCache(): void {
  if (!isNotionConfigured()) return;
  const now = Date.now();
  if (now - warmStartedAt < POST_TTL_MS) return;
  warmStartedAt = now;

  void (async () => {
    const posts = await getPublishedPosts();
    for (const post of posts) {
      await getPostBySlug(post.slug);
    }
  })().catch((error) => {
    console.error("[notion] warmPostCache failed:", error);
  });
}
