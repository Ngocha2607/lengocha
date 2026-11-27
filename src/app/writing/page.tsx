import type { Metadata } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { DesktopShell } from "@/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopShell";
import { getPublishedPostsOrThrow } from "@/lib/notion";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

/**
 * The Writing list as a real URL: the desktop with the Writing window already
 * open. Exists for three callers — someone trimming a /writing/<slug> link back
 * to its folder, the sitemap and RSS feed which need a home for "all posts",
 * and anyone who wants to share the list rather than one article.
 *
 * The list is read on the server and rendered into the HTML, every card a link
 * to its article — that is how a crawler finds the articles at all. The window
 * still refreshes it client-side once it mounts.
 *
 * Statically regenerated (ISR) rather than rendered per request: the page is
 * served from cache and rebuilt in the background at most every five minutes.
 * A Notion failure during a rebuild throws, which keeps the last good page
 * instead of caching an empty list.
 */
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: `Writing — ${SITE_NAME}`,
  description:
    "Bài viết về frontend và các dự án tôi đã làm: SAPP LMS & OPS, TravelTech, kiến trúc monorepo, editor tự dựng, AppSec.",
  path: "/writing",
});

/**
 * Strict at runtime, forgiving at build time: a Notion hiccup during `next
 * build` should not fail the deploy. The build then bakes an empty list, which
 * the first revalidation five minutes later replaces.
 */
async function readPosts() {
  try {
    return await getPublishedPostsOrThrow();
  } catch (error) {
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw error;
    console.error("[writing] Notion unavailable during build; prerendering an empty list:", error);
    return [];
  }
}

export default async function WritingIndexPage() {
  const posts = await readPosts();
  return <DesktopShell initialApp="writing" initialPosts={posts} />;
}
