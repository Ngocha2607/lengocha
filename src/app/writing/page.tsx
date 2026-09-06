import type { Metadata } from "next";
import { DesktopShell } from "@/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopShell";
import { SITE_NAME } from "@/lib/site";

/**
 * The Writing list as a real URL: the desktop with the Writing window already
 * open. Exists for three callers — someone trimming a /writing/<slug> link back
 * to its folder, the sitemap and RSS feed which need a home for "all posts",
 * and anyone who wants to share the list rather than one article.
 *
 * Static on purpose: the list itself is fetched client-side by the window, so
 * this page reads nothing from Notion.
 */
export const metadata: Metadata = {
  title: `Writing — ${SITE_NAME}`,
  description:
    "Bài viết về frontend và các dự án tôi đã làm: SAPP LMS & OPS, TravelTech, kiến trúc monorepo, editor tự dựng, AppSec.",
  alternates: { canonical: "/writing" },
  openGraph: {
    type: "website",
    url: "/writing",
    title: `Writing — ${SITE_NAME}`,
    description:
      "Bài viết về frontend và các dự án tôi đã làm: SAPP LMS & OPS, TravelTech, kiến trúc monorepo, editor tự dựng, AppSec.",
  },
};

export default function WritingIndexPage() {
  return <DesktopShell initialWritingOpen />;
}
