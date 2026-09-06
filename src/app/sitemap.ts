import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/notion";
import { SITE_URL } from "@/lib/site";

/**
 * One entry per published article, straight from Notion. `force-dynamic` for
 * the same reason as the API routes: baked at build time, the sitemap would
 * advertise whatever Notion held during `next build` forever. The 60s list memo
 * inside `getPublishedPosts` keeps crawler traffic off Notion.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Empty when Notion is unconfigured — the two fixed pages still list.
  const posts = await getPublishedPosts();

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/writing`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/writing/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
