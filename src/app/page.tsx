import type { Metadata } from "next";
import { DesktopShell } from "@/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopShell";
import { pageMetadata } from "@/lib/seo";
import {
  HOME_URL,
  PERSON_ID,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  WEBSITE_ID,
  jsonLdScript,
  personJsonLd,
} from "@/lib/site";

/**
 * The bare desktop: no window open, the intro widget is the H1.
 *
 * The canonical is self-referencing and resolves to HOME_URL — the same
 * form the sitemap, og:url and JSON-LD use.
 */
export const metadata: Metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

/** Who the site is about, and the site itself, for search engines. */
const JSON_LD = jsonLdScript({
  "@context": "https://schema.org",
  "@graph": [
    personJsonLd(),
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: HOME_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "vi",
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
    },
  ],
});

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
      <DesktopShell />
    </>
  );
}
