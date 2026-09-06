import { NextResponse } from "next/server";
import { renderMarkdown } from "@/lib/markdown";
import { getPostBySlug, getPublishedPosts, isNotionConfigured } from "@/lib/notion";

/**
 * One article, with its body already rendered to HTML.
 *
 * Rendering happens here rather than in the window for two reasons: the markdown
 * runtime never reaches the browser bundle, and `renderMarkdown` escapes raw HTML
 * from the Notion source — doing that on the server means the window can trust
 * what it is handed.
 *
 * The render is also handed a resolver that turns Notion URLs of OTHER published
 * posts into `/writing/<slug>` links. The articles cross-reference each other by
 * their Notion URLs (Notion is the source of truth and those links must work
 * there too); on this site they should navigate within the site instead.
 */
export const dynamic = "force-dynamic";

/** A Notion page id is 32 hex chars, with or without dashes, anywhere in the URL. */
const NOTION_HOST = /^https:\/\/([a-z0-9-]+\.)?(notion\.so|notion\.com|notion\.site)\//i;

export async function GET(
  _request: Request,
  // Next 15+ hands route params in as a promise.
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!isNotionConfigured()) {
    return NextResponse.json({ error: "Notion is not configured." }, { status: 503 });
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Already cached by the list memo — this does not add a Notion round trip.
  const published = await getPublishedPosts();
  const slugByPageId = new Map(
    published.map((p) => [p.id.replace(/-/g, "").toLowerCase(), p.slug]),
  );

  const resolveInternalLink = (href: string): string | null => {
    if (!NOTION_HOST.test(href)) return null;
    const id = href.replace(/-/g, "").match(/[0-9a-f]{32}/i)?.[0];
    return id ? (slugByPageId.get(id.toLowerCase()) ?? null) : null;
  };

  const { markdown, ...meta } = post;
  const { html, toc } = renderMarkdown(markdown, { resolveInternalLink });
  return NextResponse.json({ post: { ...meta, html, toc } });
}
