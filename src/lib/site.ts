/**
 * The canonical origin, shared by everything that writes absolute URLs:
 * layout metadata, the sitemap, robots.txt, the RSS feed and per-article
 * JSON-LD. Overridable so a preview deployment can advertise its own origin.
 * Read at build/request time in server code only — no NEXT_PUBLIC_ value ever
 * needs to reach the browser bundle for this.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lengocha.vercel.app";

export const SITE_NAME = "Lê Ngọc Hà";
