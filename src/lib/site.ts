import { PORTOS_ASSETS, PORTOS_PROFILES } from "@/types/portos";

/**
 * The canonical origin, shared by everything that writes absolute URLs:
 * layout metadata, the sitemap, robots.txt, the RSS feed and every JSON-LD
 * block. Overridable so a preview deployment can advertise its own origin.
 * Read at build/request time in server code only — no NEXT_PUBLIC_ value ever
 * needs to reach the browser bundle for this.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lengocha.vercel.app";

export const SITE_NAME = "Lê Ngọc Hà";

/**
 * The home page's <title>, H1 and social-card title. "Fullstack Developer" is
 * the owner's headline title as of 2026-11-26. The About and Experience
 * windows still carry the CV's own wording ("Senior Frontend Engineer —
 * Frontend Tech Lead"); bringing those in line is a separate content change.
 */
export const SITE_TITLE = "Lê Ngọc Hà — Fullstack Developer";

/**
 * The home page's meta description, at most 160 characters — the length search
 * results show before truncating (the old one was 166 and lost its last word).
 * Frontend first, then backend and cloud, then the current role.
 */
export const SITE_DESCRIPTION =
  "Fullstack Developer, Frontend Tech Lead tại SAPP Academy: frontend React, Next.js, TypeScript; backend NestJS và cloud. Khám phá portfolio như một chiếc Mac.";

/** Every page falls back to this 1200x630 card when it has no image of its own. */
export const DEFAULT_OG_IMAGE = `${PORTOS_ASSETS}/seo/og-image.png`;

/**
 * The home URL in the ONE form every surface uses: canonical, og:url, sitemap
 * and JSON-LD. Without a trailing slash, because that is how Next renders a
 * `canonical: "/"` (it emits the bare origin for the root path unless the
 * whole site opts into `trailingSlash`). Surfaces disagreeing on a slash read
 * as two URLs to a crawler, so everything else follows Next here.
 */
export const HOME_URL = SITE_URL;

/** Absolute URL for a site path. The root maps to HOME_URL. */
export function absoluteUrl(path: string): string {
  return path === "/" ? HOME_URL : `${SITE_URL}${path}`;
}

/** Stable JSON-LD node ids, so pages can point at the same Person and WebSite. */
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * The Person every page is about, as schema.org: the headline title (see
 * SITE_TITLE), the employer the About and Experience windows name, the
 * portrait, and the two public profiles.
 */
export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_NAME,
    alternateName: "Le Ngoc Ha",
    jobTitle: "Fullstack Developer",
    worksFor: {
      "@type": "Organization",
      name: "SAPP Academy",
      url: "https://sapp.edu.vn",
    },
    url: HOME_URL,
    image: `${SITE_URL}${PORTOS_ASSETS}/images/Le_Ngoc_Ha.jpg`,
    sameAs: [PORTOS_PROFILES.github, PORTOS_PROFILES.linkedin],
  };
}

/** Serialises JSON-LD for a <script> tag; `<` is escaped so content can never close it. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
