import type { Metadata } from "next";
import { SiteDocument, siteMetadata } from "../_shared/document";

/**
 * Root layout for the English pages under /en: `<html lang="en">`. The
 * Vietnamese pages have their own (app/(vi)/layout.tsx); both render the same
 * document from app/_shared/document.tsx.
 */
export const metadata: Metadata = siteMetadata("en");

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
