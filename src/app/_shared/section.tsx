import type { Metadata } from "next";
import { DesktopShell } from "@/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopShell";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { HTML_LANG, localizedPath, type Locale } from "@/i18n/locale";
import {
  SECTION_PAGES,
  SECTION_PATHS,
  sectionDescription,
  type SectionPageApp,
} from "@/lib/sections";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, absoluteUrl, jsonLdScript, personJsonLd } from "@/lib/site";

/**
 * One URL per content window — /about, /experience, /projects, /contact,
 * /resume, /decisions, /gallery, and the same under /en — each the same
 * desktop booted with that window open, so its content is in the server HTML
 * under its own title, description and canonical. Before these existed every
 * one of them 404'd, and the windows were reachable only by clicking.
 *
 * Writing is not here: it reads Notion and has its own routes. A static
 * `writing` folder outranks the dynamic segment anyway.
 *
 * Shared by app/(vi)/[section] and app/en/[section]; both are fully static,
 * with `dynamicParams = false` so any other single segment is a 404.
 */
export function sectionStaticParams() {
  return Object.keys(SECTION_PAGES).map((section) => ({ section }));
}

export function sectionMetadata(app: SectionPageApp, locale: Locale): Metadata {
  const viPath = SECTION_PATHS[app];
  return pageMetadata({
    title: `${SECTION_PAGES[app].title} — ${SITE_NAME}`,
    description: sectionDescription(app, locale),
    path: localizedPath(viPath, locale),
    type: app === "about" ? "profile" : "website",
    locale,
    translationOf: viPath,
  });
}

export function SectionPage({ app, locale }: { app: SectionPageApp; locale: Locale }) {
  // The About window is a profile page in schema.org's sense: a page whose
  // main subject is one person.
  const jsonLd =
    app === "about"
      ? jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl(localizedPath(SECTION_PATHS.about, locale)),
          name: `${SECTION_PAGES.about.title} — ${SITE_NAME}`,
          inLanguage: HTML_LANG[locale],
          mainEntity: personJsonLd(),
        })
      : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      ) : null}
      <LocaleProvider locale={locale}>
        <DesktopShell initialApp={app} />
      </LocaleProvider>
    </>
  );
}
