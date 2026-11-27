import type { Metadata } from "next";
import { DesktopShell } from "@/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopShell";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { HTML_LANG, localizedPath, type Locale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import {
  PERSON_ID,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  WEBSITE_ID,
  absoluteUrl,
  jsonLdScript,
  personJsonLd,
} from "@/lib/site";
import { siteDescription } from "./document";

/**
 * The bare desktop, at `/` and `/en`: no window open, the intro widget is the
 * H1.
 *
 * The canonical is self-referencing: `/` resolves to HOME_URL — the same form
 * the sitemap, og:url and JSON-LD use — and `/en` to HOME_URL + "/en". Both
 * carry the same hreflang set (vi, en, x-default → `/`).
 */
export function homeMetadata(locale: Locale): Metadata {
  return pageMetadata({
    title: SITE_TITLE,
    description: siteDescription(locale),
    path: localizedPath("/", locale),
    locale,
    translationOf: "/",
  });
}

/**
 * Who the site is about, and the site itself, for search engines. The WebSite
 * node is the same on both home pages; the English one adds a WebPage for
 * itself, in English, that belongs to it.
 */
function homeJsonLd(locale: Locale): string {
  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: [HTML_LANG.vi, HTML_LANG.en],
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
  const graph: object[] = [personJsonLd(), website];
  if (locale === "en") {
    graph.push({
      "@type": "WebPage",
      url: absoluteUrl(localizedPath("/", "en")),
      name: SITE_TITLE,
      description: siteDescription("en"),
      inLanguage: HTML_LANG.en,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
    });
  }
  return jsonLdScript({ "@context": "https://schema.org", "@graph": graph });
}

export function HomePage({ locale }: { locale: Locale }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: homeJsonLd(locale) }} />
      <LocaleProvider locale={locale}>
        <DesktopShell />
      </LocaleProvider>
    </>
  );
}
