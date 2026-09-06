import { getPublishedPosts } from "@/lib/notion";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * RSS 2.0 feed of the Writing database. Hand-assembled XML rather than a feed
 * library: ten items of five fields does not earn a dependency.
 *
 * `force-dynamic` so the feed follows Notion rather than the last deploy; the
 * Cache-Control header is what actually protects the server, since feed readers
 * poll on schedules.
 */
export const dynamic = "force-dynamic";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  // Empty when Notion is unconfigured — an empty channel is still a valid feed.
  const posts = await getPublishedPosts();

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/writing/${post.slug}`;
      const categories = post.tags
        .map((tag) => `<category>${escapeXml(tag)}</category>`)
        .join("");
      return (
        `<item>` +
        `<title>${escapeXml(post.title)}</title>` +
        `<link>${url}</link>` +
        `<guid isPermaLink="true">${url}</guid>` +
        `<pubDate>${new Date(post.date).toUTCString()}</pubDate>` +
        (post.description ? `<description>${escapeXml(post.description)}</description>` : "") +
        categories +
        `</item>`
      );
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">` +
    `<channel>` +
    `<title>${escapeXml(`${SITE_NAME} — Writing`)}</title>` +
    `<link>${SITE_URL}/writing</link>` +
    `<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>` +
    `<description>${escapeXml(
      "Bài viết về frontend và các dự án của Lê Ngọc Hà.",
    )}</description>` +
    `<language>vi</language>` +
    items +
    `</channel>` +
    `</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // An hour of CDN reuse; feed readers poll far more often than posts land.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
