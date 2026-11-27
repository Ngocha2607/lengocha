import type { MetadataRoute } from "next";
import { LOCALES, localizedPath } from "@/i18n/locale";
import { getPublishedPosts } from "@/lib/notion";
import { SECTION_PATHS } from "@/lib/sections";
import { languageAlternates } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

/**
 * Every page: home, one URL per content window and the Writing list — each
 * in Vietnamese and English — and one entry per published article straight
 * from Notion.
 *
 * A page that exists in both languages is listed twice, once per URL, and
 * both entries carry the same `xhtml:link` alternates: `vi`, `en` (one of the
 * two is the entry itself) and `x-default`, which points at the Vietnamese
 * page. That is the same set the pages' own hreflang tags declare. Articles
 * are Vietnamese only and carry no alternates. `force-dynamic` for the
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

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * Both language versions of one page, from its Vietnamese path. The root maps
 * to HOME_URL through `absoluteUrl`: the same form as the canonical and og:url.
 */
function translatedPage(
  viPath: string,
  entry: Omit<SitemapEntry, "url" | "alternates">,
): SitemapEntry[] {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(viPath)).map(([lang, path]) => [lang, absoluteUrl(path)]),
  );
  return LOCALES.map((locale) => ({
    ...entry,
    url: absoluteUrl(localizedPath(viPath, locale)),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Empty when Notion is unconfigured — the fixed pages still list.
  const posts = await getPublishedPosts();
  const newestPost = posts.length > 0 ? new Date(posts[0].date) : BUILT_AT;

  return [
    ...translatedPage("/", { lastModified: BUILT_AT, changeFrequency: "monthly", priority: 1 }),
    ...(Object.keys(SECTION_PRIORITY) as (keyof typeof SECTION_PRIORITY)[]).flatMap((app) =>
      translatedPage(SECTION_PATHS[app], {
        lastModified: BUILT_AT,
        changeFrequency: "monthly",
        priority: SECTION_PRIORITY[app],
      }),
    ),
    ...translatedPage(SECTION_PATHS.writing, {
      lastModified: newestPost,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    ...posts.map((post) => ({
      url: absoluteUrl(`/writing/${post.slug}`),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
