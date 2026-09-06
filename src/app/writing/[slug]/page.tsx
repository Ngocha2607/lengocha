import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesktopShell } from "@/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopShell";
import { getPublishedPosts, isNotionConfigured, type PostMeta } from "@/lib/notion";

/**
 * Deep link to one article: renders the SAME desktop, with the Writing window
 * already open on the post. Before this route existed the articles were only
 * reachable by clicking around inside the desktop, which meant no article could
 * be linked from a CV, a LinkedIn post or another article.
 *
 * The shell keeps the address bar in sync from here on (see DesktopShell), so
 * whatever the visitor navigates to next is what they would copy.
 *
 * `force-dynamic` for the same reason as the API routes: the slug list lives in
 * Notion and must not be frozen at build time.
 */
export const dynamic = "force-dynamic";

const SITE_NAME = "Lê Ngọc Hà";

async function findPost(slug: string): Promise<PostMeta | null> {
  if (!isNotionConfigured()) return null;
  const posts = await getPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  // Unknown slug 404s in the page component; the layout metadata covers that.
  if (!post) return {};

  const title = `${post.title} — ${SITE_NAME}`;
  // Covers are pasted external URLs (see lib/notion.ts) so they are stable
  // enough to advertise; a post without one falls back to the site OG image
  // by simply omitting the field.
  const images = post.coverUrl ? [post.coverUrl] : undefined;

  return {
    title,
    description: post.description || undefined,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/writing/${post.slug}`,
      title,
      description: post.description || undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description || undefined,
      images,
    },
  };
}

export default async function WritingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Only 404 when Notion is reachable and genuinely has no such post. When the
  // integration is unconfigured (local dev without .env), render the desktop
  // anyway — the window explains the empty state better than an error page.
  if (isNotionConfigured()) {
    const post = await findPost(slug);
    if (!post) notFound();
  }

  return <DesktopShell initialWritingSlug={slug} />;
}
