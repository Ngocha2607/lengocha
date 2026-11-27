import type { Locale } from "@/i18n/locale";

/**
 * The CV PDFs, one per language, served from `public/`. They are build
 * output: the source is in `cv/` (content files, template, styles) and
 * `npm run cv:build` regenerates both — see cv/README.md.
 *
 * The CV's URL used to be /Le-Ngoc-Ha-Senior-Frontend-Developer.pdf, and that
 * link went out in job applications; next.config.ts redirects it to the
 * Vietnamese file here. Rename these and that redirect has to follow.
 */
export const CV_PDF: Record<Locale, { href: string; filename: string }> = {
  vi: {
    href: "/Le-Ngoc-Ha-Fullstack-Developer.pdf",
    filename: "Le-Ngoc-Ha-Fullstack-Developer.pdf",
  },
  en: {
    href: "/Le-Ngoc-Ha-Fullstack-Developer-EN.pdf",
    filename: "Le-Ngoc-Ha-Fullstack-Developer-EN.pdf",
  },
};
