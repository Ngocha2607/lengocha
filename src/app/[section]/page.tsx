import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesktopShell } from "@/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopShell";
import { SECTION_PAGES, SECTION_PATHS, sectionPageFromParam } from "@/lib/sections";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, absoluteUrl, jsonLdScript, personJsonLd } from "@/lib/site";

/**
 * One URL per content window — /about, /experience, /projects, /contact,
 * /resume, /decisions, /gallery — each the same desktop booted with that
 * window open, so its content is in the server HTML under its own title,
 * description and canonical. Before these existed every one of them 404'd,
 * and the windows were reachable only by clicking.
 *
 * Writing is not here: it reads Notion and has its own routes (app/writing).
 * A static `writing` folder outranks this dynamic segment anyway.
 *
 * Fully static. `dynamicParams = false` makes any other single-segment path a
 * 404 rather than an attempt to render it.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SECTION_PAGES).map((section) => ({ section }));
}

type Params = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const app = sectionPageFromParam((await params).section);
  if (!app) return {};
  const page = SECTION_PAGES[app];
  return pageMetadata({
    title: `${page.title} — ${SITE_NAME}`,
    description: page.description,
    path: SECTION_PATHS[app],
    type: app === "about" ? "profile" : "website",
  });
}

export default async function SectionPage({ params }: Params) {
  const app = sectionPageFromParam((await params).section);
  if (!app) notFound();

  // The About window is a profile page in schema.org's sense: a page whose
  // main subject is one person.
  const jsonLd =
    app === "about"
      ? jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl(SECTION_PATHS.about),
          name: `${SECTION_PAGES.about.title} — ${SITE_NAME}`,
          inLanguage: "vi",
          mainEntity: personJsonLd(),
        })
      : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      ) : null}
      <DesktopShell initialApp={app} />
    </>
  );
}
