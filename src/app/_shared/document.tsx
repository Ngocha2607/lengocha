import type { Metadata } from "next";
import { Inspiration } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { EN_META } from "@/i18n/en";
import { HTML_LANG, OG_LOCALE, type Locale } from "@/i18n/locale";
import { DEFAULT_OG_CARD, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

/**
 * The `<html>` document both root layouts share — app/(vi)/layout.tsx and
 * app/en/layout.tsx. There are two root layouts because `<html lang>` has to
 * be right in the SERVER HTML (search engines and screen readers read it
 * there), and a root layout is the only thing that renders `<html>`. Moving
 * between the two is a full page load, which is what the VI | EN switch does
 * anyway.
 *
 * In a private `_shared` folder, so nothing here becomes a route.
 */

// `next/font/local` statically analyses these calls at build time, so every `path`
// must be a literal string — a template literal or shared constant will not resolve.

/** SF Pro Display — used for the menu bar name, window titles and display headings. */
const sfProDisplay = localFont({
  variable: "--font-sf-display",
  display: "swap",
  src: [
    {
      path: "../../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

/** SF Pro Text — used for body copy, labels and the pre-loader kicker. */
const sfProText = localFont({
  variable: "--font-sf-text",
  display: "swap",
  src: [
    {
      path: "../../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProText-Thin.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProText-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProText-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
});

/** Inspiration — the handwritten "Hà" signature inside the About window. */
const inspiration = Inspiration({
  variable: "--font-signature",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const ASSETS = "/sites/portos-framer-website-67488b6b/root-8a5edab2";

/** The home page's meta description in each language. */
export function siteDescription(locale: Locale): string {
  return locale === "en" ? EN_META.siteDescription : SITE_DESCRIPTION;
}

/**
 * Site-wide defaults. Every route sets its own title, description, canonical
 * and social cards through `pageMetadata` (lib/seo.ts); this is what a page
 * that sets nothing — the 404 — falls back to.
 *
 * No `openGraph.url` here on purpose. It used to be the home URL, which every
 * page that did not override it then advertised as its own address.
 *
 * `favicon.svg` replaces the template's `favicon.png`: an SVG favicon scales to
 * every tab size from one file, and Safari falls back to `apple-touch-icon.png`
 * anyway. The old PNG has since been deleted.
 *
 * `src/app/favicon.ico` had to go too, and that one is easy to miss: in the App
 * Router, file convention beats configuration, so while it existed Next.js
 * emitted `<link rel="icon" href="/favicon.ico">` and ignored the value below
 * entirely. `/favicon.ico` now 404s, which is harmless — browsers follow the tag.
 */
export function siteMetadata(locale: Locale): Metadata {
  const description = siteDescription(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_TITLE,
    description,
    alternates: {
      // Advertises the Writing feed; readers auto-discover it.
      types: { "application/rss+xml": "/feed.xml" },
    },
    icons: {
      icon: `${ASSETS}/seo/favicon.svg`,
      apple: `${ASSETS}/seo/apple-touch-icon.png`,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      title: SITE_TITLE,
      description,
      images: [DEFAULT_OG_CARD],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description,
      images: [DEFAULT_OG_CARD],
    },
    robots: { "max-image-preview": "large" },
  };
}

export function SiteDocument({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    // The page's language, in the server HTML: Vietnamese for every page
    // outside /en (the JSON-LD and the RSS feed say so too), English under it.
    // Search engines and screen readers both pick their language from this.
    <html
      lang={HTML_LANG[locale]}
      className={`${sfProDisplay.variable} ${sfProText.variable} ${inspiration.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Analytics />
        {/* Cloudflare, Umami and GA4, each only when configured — see lib/analytics.ts. */}
        <AnalyticsScripts />
        <SpeedInsights />
      </body>
    </html>
  );
}
