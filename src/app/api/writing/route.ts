import { NextResponse } from "next/server";
import { getPublishedPosts, isNotionConfigured } from "@/lib/notion";

/**
 * The Writing list, straight from Notion.
 *
 * This exists so the Writing window never has to touch `NOTION_TOKEN`. The
 * window is a client component; anything it imports ends up in the browser
 * bundle, so the Notion client stays behind this route and the window only ever
 * sees the shaped result.
 *
 * `force-dynamic` because a route handler that reads nothing off the request can
 * otherwise be statically evaluated at build time — which would freeze the list
 * at whatever Notion held during `next build`. The 60s memo inside `getPublishedPosts`
 * is what actually keeps Notion from being hit on every open.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isNotionConfigured()) {
    return NextResponse.json(
      { posts: [], configured: false },
      // 200, not an error: an unconfigured integration is a deployment state,
      // not a failure, and the window renders an explanatory empty state.
      { status: 200 },
    );
  }

  const posts = await getPublishedPosts();
  return NextResponse.json({ posts, configured: true });
}
