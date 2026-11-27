/**
 * The site's two languages and how their URLs relate.
 *
 * Vietnamese is the original and stays at the root (`/`, `/about`, …).
 * English lives under `/en` (`/en`, `/en/about`, …). There is no redirect by
 * Accept-Language or IP: a URL always serves the language it names, and the
 * VI | EN switch in the menu bar is how a visitor changes it.
 *
 * Articles (`/writing/<slug>`) are Vietnamese only and have no English twin.
 *
 * Imports nothing, so both the server (routes, metadata, sitemap) and the
 * client (links, the switch) can use it.
 */

export type Locale = "vi" | "en";

export const LOCALES: readonly Locale[] = ["vi", "en"];

export const DEFAULT_LOCALE: Locale = "vi";

/** What `<html lang>` and `inLanguage` say. */
export const HTML_LANG: Record<Locale, string> = { vi: "vi", en: "en" };

/** `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = { vi: "vi_VN", en: "en_US" };

/** The prefix English paths carry. */
const EN_PREFIX = "/en";

/**
 * A Vietnamese path in the given language: `/about` → `/en/about`, `/` → `/en`.
 * Pass Vietnamese (unprefixed) paths only.
 */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === "vi") return path;
  return path === "/" ? EN_PREFIX : `${EN_PREFIX}${path}`;
}
