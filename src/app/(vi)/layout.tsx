import type { Metadata } from "next";
import { SiteDocument, siteMetadata } from "../_shared/document";

/**
 * Root layout for every Vietnamese page: the home page, the window pages, the
 * Writing list and every article. `<html lang="vi">`. The English pages under
 * /en have their own root layout (app/en/layout.tsx); both render the same
 * document from app/_shared/document.tsx.
 */
export const metadata: Metadata = siteMetadata("vi");

export default function VietnameseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteDocument locale="vi">{children}</SiteDocument>;
}
