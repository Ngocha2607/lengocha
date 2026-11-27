import type { Metadata } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { DesktopShell } from "@/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopShell";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { EN_META } from "@/i18n/en";
import { localizedPath, type Locale } from "@/i18n/locale";
import { getPublishedPostsOrThrow } from "@/lib/notion";
import { SECTION_PATHS } from "@/lib/sections";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

/**
 * The Writing list as a real URL — /writing, and /en/writing — the desktop
 * with the Writing window already open. Exists for three callers — someone
 * trimming a /writing/<slug> link back to its folder, the sitemap and RSS feed
 * which need a home for "all posts", and anyone who wants to share the list
 * rather than one article.
 *
 * The list is read on the server and rendered into the HTML, every card a link
 * to its article — that is how a crawler finds the articles at all. The window
 * still refreshes it client-side once it mounts.
 *
 * On /en/writing the cards carry English titles and summaries
 * (src/data/writing-en.ts) and link to the same Vietnamese articles, each
 * labelled "In Vietnamese". The articles have no English twin.
 *
 * Both routes export `revalidate = 300` (a route segment option has to be a
 * literal in the route file itself): statically regenerated (ISR) rather than
 * rendered per request, served from cache and rebuilt in the background at
 * most every five minutes. A Notion failure during a rebuild throws, which
 * keeps the last good page instead of caching an empty list.
 */

/** Vietnamese, like the posts. The English one is in src/i18n/en.ts. */
const WRITING_DESCRIPTION_VI =
  "Bài viết về frontend và các dự án tôi đã làm: SAPP LMS & OPS, TravelTech, kiến trúc monorepo, editor tự dựng, AppSec.";

export function writingListMetadata(locale: Locale): Metadata {
  return pageMetadata({
    title: `Writing — ${SITE_NAME}`,
    description: locale === "en" ? EN_META.writing : WRITING_DESCRIPTION_VI,
    path: localizedPath(SECTION_PATHS.writing, locale),
    locale,
    translationOf: SECTION_PATHS.writing,
  });
}

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

export async function WritingListPage({ locale }: { locale: Locale }) {
  const posts = await readPosts();
  return (
    <LocaleProvider locale={locale}>
      <DesktopShell initialApp="writing" initialPosts={posts} />
    </LocaleProvider>
  );
}
