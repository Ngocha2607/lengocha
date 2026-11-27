import { renderMarkdown, type TocEntry } from "@/lib/markdown";
import {
  getPostBySlugOrThrow,
  getPublishedPostsOrThrow,
  type PostMeta,
} from "@/lib/notion";

/**
 * One article, rendered: its metadata plus the body as HTML and a table of
 * contents. The single place this happens, shared by the JSON route the
 * Writing window fetches and by /writing/[slug], which puts the same HTML in
 * the server response so crawlers that run no JavaScript can read the article.
 *
 * SERVER ONLY — it reaches Notion through `@/lib/notion`.
 */
export interface RenderedPost extends PostMeta {
  html: string;
  toc: TocEntry[];
}

/** A Notion page id is 32 hex chars, with or without dashes, anywhere in the URL. */
const NOTION_HOST = /^https:\/\/([a-z0-9-]+\.)?(notion\.so|notion\.com|notion\.site)\//i;

/**
 * The rendered post, or null when there is no published post with that slug.
 * Throws when Notion fails, so a statically regenerated page keeps its last
 * good version instead of caching a 404.
 *
 * The render is handed a resolver that turns Notion URLs of OTHER published
 * posts into `/writing/<slug>` links. The articles cross-reference each other
 * by their Notion URLs (Notion is the source of truth and those links must work
 * there too); on this site they should navigate within the site instead.
 */
export async function getRenderedPost(slug: string): Promise<RenderedPost | null> {
  const post = await getPostBySlugOrThrow(slug);
  if (!post) return null;

  // Already cached by the list memo — this does not add a Notion round trip.
  const published = await getPublishedPostsOrThrow();
  const slugByPageId = new Map(
    published.map((p) => [p.id.replace(/-/g, "").toLowerCase(), p.slug]),
  );

  const resolveInternalLink = (href: string): string | null => {
    if (!NOTION_HOST.test(href)) return null;
    const id = href.replace(/-/g, "").match(/[0-9a-f]{32}/i)?.[0];
    return id ? (slugByPageId.get(id.toLowerCase()) ?? null) : null;
  };

  const { markdown, ...meta } = post;
  const { html, toc } = renderMarkdown(markdown, {
    resolveInternalLink,
    imageAltFallback: `Hình minh họa trong bài “${post.title}”`,
  });
  return { ...meta, html, toc };
}
