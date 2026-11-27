import { NextResponse } from "next/server";
import { isNotionConfigured } from "@/lib/notion";
import { getRenderedPost } from "@/lib/posts";

/**
 * One article, with its body already rendered to HTML.
 *
 * Rendering happens on the server rather than in the window for two reasons:
 * the markdown runtime never reaches the browser bundle, and `renderMarkdown`
 * escapes raw HTML from the Notion source — doing that on the server means the
 * window can trust what it is handed. The rendering itself lives in
 * `lib/posts.ts`, shared with /writing/[slug], which server-renders the same
 * HTML into the page.
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

  let post;
  try {
    post = await getRenderedPost(slug);
  } catch (error) {
    console.error(`[api/writing] "${slug}" failed:`, error);
    return NextResponse.json({ error: "Notion is unavailable." }, { status: 502 });
  }

  if (!post) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ post });
}
