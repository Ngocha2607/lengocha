import { cache } from "react";
import { Client, isFullPage } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

/**
 * Notion-backed "Writing" content.
 *
 * Setup (see .env.example):
 *   NOTION_TOKEN         — internal integration token (secret, server-only)
 *   NOTION_WRITING_DB_ID — id of the Writing database shared with the integration
 *
 * Expected database properties (names are matched case-sensitively):
 *   Title       (title)        — required; the article title
 *   Description (rich_text)    — short summary shown on the card
 *   Tags        (multi_select) — topic chips
 *   Published   (checkbox)     — only checked rows are shown (missing => shown)
 *   Date        (date)         — sort key + displayed date (missing => created time)
 *   Slug        (rich_text)    — URL slug (missing => derived from the title)
 *
 * Every function degrades gracefully: if the integration is not configured or
 * Notion errors, it returns empty/null so the site still builds and renders the
 * hardcoded fallback in WritingSection.
 */

export interface PostMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string; // ISO 8601
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
  if (!cachedClient) {
    cachedClient = new Client({ auth: NOTION_TOKEN });
  }
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
      const text = prop.title.map((t) => t.plain_text).join("").trim();
      if (text) return text;
    }
  }
  return "Untitled";
}

function readRichText(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name];
  if (prop?.type === "rich_text") {
    return prop.rich_text.map((t) => t.plain_text).join("").trim();
  }
  return "";
}

function readTags(page: PageObjectResponse, name: string): string[] {
  const prop = page.properties[name];
  if (prop?.type === "multi_select") {
    return prop.multi_select.map((option) => option.name);
  }
  return [];
}

function readDate(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name];
  if (prop?.type === "date" && prop.date?.start) {
    return prop.date.start;
  }
  return page.created_time;
}

function isPublished(page: PageObjectResponse, name: string): boolean {
  const prop = page.properties[name];
  // If there is no Published checkbox, treat everything shared as published.
  if (prop?.type === "checkbox") return prop.checkbox;
  return true;
}

function toMeta(page: PageObjectResponse): PostMeta {
  const title = readTitle(page);
  const slugSource = readRichText(page, "Slug") || title;
  const slug = slugify(slugSource) || page.id.replace(/-/g, "");
  return {
    id: page.id,
    slug,
    title,
    description: readRichText(page, "Description"),
    tags: readTags(page, "Tags"),
    date: readDate(page, "Date"),
  };
}

/**
 * All published posts, newest first. Empty when Notion is not configured or on
 * error. Wrapped in React `cache` so repeated calls within one request (e.g.
 * generateMetadata + the page body) hit Notion only once.
 */
export const getPublishedPosts = cache(async (): Promise<PostMeta[]> => {
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
        if (isFullPage(result) && isPublished(result, "Published")) {
          pages.push(result);
        }
      }
      cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
    } while (cursor);

    return pages
      .map(toMeta)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  } catch (error) {
    console.error("[notion] getPublishedPosts failed:", error);
    return [];
  }
});

/** A single published post with rendered Markdown, or null if not found. */
export const getPostBySlug = cache(
  async (slug: string): Promise<Post | null> => {
    if (!isNotionConfigured()) return null;
    try {
      const meta = (await getPublishedPosts()).find((p) => p.slug === slug);
      if (!meta) return null;

      const notion = getClient();
      const n2m = new NotionToMarkdown({ notionClient: notion });
      const blocks = await n2m.pageToMarkdown(meta.id);
      const { parent } = n2m.toMarkdownString(blocks);

      return { ...meta, markdown: parent ?? "" };
    } catch (error) {
      console.error(`[notion] getPostBySlug("${slug}") failed:`, error);
      return null;
    }
  },
);
