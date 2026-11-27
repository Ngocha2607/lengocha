import type { Metadata } from "next";
import "./globals.css";

/**
 * The 404 for a URL that matches no route at all (`/no/such/page`,
 * `/en/nope`). It exists because the site now has TWO root layouts — app/(vi)
 * and app/en, one per `<html lang>` — so there is no single layout left to
 * wrap Next's default 404, which then came out with no `lang` at all.
 *
 * Next renders this file on its own, without either layout (hence the CSS
 * import), and answers 404 with `noindex`. Bilingual, Vietnamese first like
 * the site, with a way back to each home page. `notFound()` thrown inside a
 * route (an unknown article slug) still renders inside that route's layout.
 *
 * Plain `<a>` on purpose: this page has no router to hand a `<Link>` to.
 */
export const metadata: Metadata = {
  title: "404 — Lê Ngọc Hà",
};

const LINK_CLASS =
  "rounded-full border border-white/25 px-3 py-[5px] text-[13px] leading-[18px] text-white/90 transition-colors hover:border-white/50 hover:bg-white/15";

export default function GlobalNotFound() {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="flex min-h-full items-center justify-center bg-[#1d2430] px-5 font-sans text-white">
        <main className="flex max-w-[360px] flex-col items-center gap-3 text-center">
          <h1 className="text-[48px] leading-[56px] font-bold tracking-[-1px]">404</h1>
          <p className="text-[15px] leading-[21px] text-white/85">Trang này không tồn tại.</p>
          <p lang="en" className="text-[15px] leading-[21px] text-white/60">
            This page does not exist.
          </p>
          <nav className="mt-3 flex flex-wrap justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see the note above */}
            <a href="/" className={LINK_CLASS}>
              Về trang chủ
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see the note above */}
            <a href="/en" lang="en" hrefLang="en" className={LINK_CLASS}>
              English home
            </a>
          </nav>
        </main>
      </body>
    </html>
  );
}
