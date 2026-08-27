import { NextResponse } from "next/server";
import { renderMarkdown } from "@/lib/markdown";
import { getPostBySlug, isNotionConfigured } from "@/lib/notion";

/**
 * One article, with its body already rendered to HTML.
 *
 * Rendering happens here rather than in the window for two reasons: the markdown
 * runtime never reaches the browser bundle, and `renderMarkdown` escapes raw HTML
 * from the Notion source — doing that on the server means the window can trust
 * what it is handed.
 */
export const dynamic = "force-dynamic";

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

  const { markdown, ...meta } = post;
  return NextResponse.json({ post: { ...meta, html: renderMarkdown(markdown) } });
}
