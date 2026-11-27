import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DesktopShell } from "@/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopShell";
import { isNotionConfigured } from "@/lib/notion";
import { getRenderedPost } from "@/lib/posts";
import { pageMetadata, postMetaDescription, staticCoverImage } from "@/lib/seo";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl, jsonLdScript, personJsonLd } from "@/lib/site";

/**
 * Deep link to one article: the SAME desktop, with the Writing window already
 * open on the post — and the post itself (title, date, tags, contents, body)
 * rendered into the server HTML. It used to arrive only after JavaScript
 * fetched it, so a crawler that runs none saw the desktop chrome and ~60 words.
 *
 * The shell keeps the address bar in sync from here on (see DesktopShell), so
 * whatever the visitor navigates to next is what they would copy.
 *
 * Statically regenerated (ISR) instead of rendered per request, because the
 * render is now on the critical path: a cold article walks Notion's block tree
 * at one request per nesting level, measured at 1-11s. Pages are built on first
 * visit (the empty `generateStaticParams` — nothing is fetched at build time),
 * cached, and rebuilt in the background at most every ten minutes, the same
 * lifetime the in-memory post cache uses. A slug published later simply renders
 * on its first visit.
 *
 * `getRenderedPost` throws when Notion fails, and that matters here: a throw
 * keeps the last good page, where a null would cache a 404 for the article.
 */
export const revalidate = 600;

export async function generateStaticParams() {
  return [];
}

/** One Notion read per request, shared by the metadata and the page. */
const loadPost = cache(async (slug: string) =>
  isNotionConfigured() ? getRenderedPost(slug) : null,
);

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  // Unknown slug 404s in the page component; the layout metadata covers that.
  if (!post) return {};

  return pageMetadata({
    title: `${post.title} — ${SITE_NAME}`,
    description: postMetaDescription(post.slug, post.description),
    path: `/writing/${post.slug}`,
    type: "article",
    // Covers are pasted external URLs (see lib/notion.ts), stable enough to
    // advertise — but not an animated GIF; those fall back to the site card.
    image: staticCoverImage(post.coverUrl),
    publishedTime: post.date,
    tags: post.tags,
  });
}

export default async function WritingPostPage({ params }: Params) {
  const { slug } = await params;

  // Only 404 when Notion is reachable and genuinely has no such post. When the
  // integration is unconfigured (local dev without .env), render the desktop
  // anyway — the window explains the empty state better than an error page.
  const post = await loadPost(slug);
  if (isNotionConfigured() && !post) notFound();

  // Article schema for crawlers.
  const jsonLd = post
    ? jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: postMetaDescription(post.slug, post.description),
        datePublished: post.date,
        inLanguage: "vi",
        image: staticCoverImage(post.coverUrl) ?? `${SITE_URL}${DEFAULT_OG_IMAGE}`,
        keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
        author: personJsonLd(),
        mainEntityOfPage: absoluteUrl(`/writing/${post.slug}`),
      })
    : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      ) : null}
      <DesktopShell initialApp="writing" initialWritingSlug={slug} initialPost={post} />
    </>
  );
}
