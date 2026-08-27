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
 * or a Notion outage leaves the window empty instead of breaking the desktop.
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

async function fetchPublishedPosts(): Promise<PostMeta[]> {
  if (!isNotionConfigured()) return [];
  try {
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
  } catch (error) {
    console.error("[notion] getPublishedPosts failed:", error);
    return [];
  }
}

/** All published posts, newest first. Empty when unconfigured or on error. */
export async function getPublishedPosts(): Promise<PostMeta[]> {
  if (cache && Date.now() - cache.at < LIST_TTL_MS) return cache.posts;

  // Share one round trip between concurrent callers rather than stampeding.
  inFlight ??= fetchPublishedPosts().finally(() => {
    inFlight = null;
  });

  const posts = await inFlight;
  cache = { at: Date.now(), posts };
  return posts;
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
  const meta = (await getPublishedPosts()).find((p) => p.slug === slug);
  if (!meta) return null;

  const n2m = new NotionToMarkdown({ notionClient: getClient() });
  const blocks = await n2m.pageToMarkdown(meta.id);
  const { parent } = n2m.toMarkdownString(blocks);

  return { ...meta, markdown: parent ?? "" };
}

/** A single published post with its Markdown body, or null if not found. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
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
    .catch((error) => {
      console.error(`[notion] getPostBySlug("${slug}") failed:`, error);
      return null;
    })
    .finally(() => {
      postInFlight.delete(slug);
    });

  postInFlight.set(slug, pending);
  return pending;
}
