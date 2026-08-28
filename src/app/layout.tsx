import type { Metadata } from "next";
import { Inspiration } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// `next/font/local` statically analyses these calls at build time, so every `path`
// must be a literal string — a template literal or shared constant will not resolve.

/** SF Pro Display — used for the menu bar name, window titles and display headings. */
const sfProDisplay = localFont({
  variable: "--font-sf-display",
  display: "swap",
  src: [
    {
      path: "../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProDisplay-Bold.woff2",
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
      path: "../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProText-Thin.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProText-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/sites/portos-framer-website-67488b6b/root-8a5edab2/fonts/SFProText-Semibold.woff2",
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

const SITE_TITLE = "Lê Ngọc Hà — Senior Frontend Engineer";
const SITE_DESCRIPTION =
  "Frontend Tech Lead at SAPP Academy. I build fast, scalable web systems with React, Next.js and TypeScript — explore this portfolio like a Mac.";
/**
 * Overridable so a preview deployment can advertise its own origin instead of
 * the production one. Read at build time in a server component, so it needs no
 * NEXT_PUBLIC_ prefix — that is only for values the browser bundle must see.
 */
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lengocha.vercel.app";

/**
 * Metadata, favicon, apple-touch icon and OG image are all the owner's.
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
export const metadata: Metadata = {
  metadataBase: new URL(NEXT_PUBLIC_SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: `${ASSETS}/seo/favicon.svg`,
    apple: `${ASSETS}/seo/apple-touch-icon.png`,
  },
  openGraph: {
    type: "website",
    url: NEXT_PUBLIC_SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${ASSETS}/seo/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${ASSETS}/seo/og-image.png`],
  },
  robots: { "max-image-preview": "large" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sfProDisplay.variable} ${sfProText.variable} ${inspiration.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
