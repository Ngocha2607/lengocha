import type { APIRoute } from "astro";
import { SITE } from "../consts";
import { getPublishedPosts } from "../lib/notion";

/**
 * Hand-rolled rather than @astrojs/sitemap, because the two routes worth
 * indexing are both on-demand rendered (`prerender = false`) and the
 * integration only sees prerendered ones. This also lists the articles, which
 * the Next version's sitemap never did.
 */
export const prerender = false;

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const urls = [
    { loc: new URL("/", SITE.url).href, priority: "1.0", changefreq: "monthly" },
    ...posts.map((post) => ({
      loc: new URL(`/writing/${post.slug}`, SITE.url).href,
      lastmod: post.date.slice(0, 10),
      priority: "0.8",
      changefreq: "monthly",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>${"lastmod" in url && url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ""}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
};
