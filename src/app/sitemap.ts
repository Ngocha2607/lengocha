import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/notion";
import { SECTION_PATHS } from "@/lib/sections";
import { HOME_URL, absoluteUrl } from "@/lib/site";

/**
 * Every page: home, one URL per content window, the Writing list, and one
 * entry per published article straight from Notion. `force-dynamic` for the
 * same reason as the API routes: baked at build time, the sitemap would
 * advertise whatever Notion held during `next build` forever. The 60s list memo
 * inside `getPublishedPosts` keeps crawler traffic off Notion.
 *
 * `lastModified`, per kind of page:
 *   - home and the window pages change only when the site is deployed, so they
 *     carry the build time (stamped in next.config.ts);
 *   - the Writing list changes when a post is added, so it carries the newest
 *     post's date;
 *   - an article carries its own date.
 */
export const dynamic = "force-dynamic";

const BUILT_AT = process.env.SITE_BUILT_AT ? new Date(process.env.SITE_BUILT_AT) : undefined;

/** Window pages, in the order a visitor meets them. Writing is listed separately. */
const SECTION_PRIORITY: Record<Exclude<keyof typeof SECTION_PATHS, "writing">, number> = {
  about: 0.9,
  experience: 0.8,
  projects: 0.8,
  decisions: 0.6,
  contact: 0.6,
  resume: 0.5,
  gallery: 0.4,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Empty when Notion is unconfigured — the fixed pages still list.
  const posts = await getPublishedPosts();
  const newestPost = posts.length > 0 ? new Date(posts[0].date) : BUILT_AT;

  return [
    // HOME_URL: the same form as the canonical and og:url.
    { url: HOME_URL, lastModified: BUILT_AT, changeFrequency: "monthly", priority: 1 },
    ...(Object.keys(SECTION_PRIORITY) as (keyof typeof SECTION_PRIORITY)[]).map((app) => ({
      url: absoluteUrl(SECTION_PATHS[app]),
      lastModified: BUILT_AT,
      changeFrequency: "monthly" as const,
      priority: SECTION_PRIORITY[app],
    })),
    {
      url: absoluteUrl(SECTION_PATHS.writing),
      lastModified: newestPost,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/writing/${post.slug}`),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
