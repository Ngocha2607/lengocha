import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const description =
  "Lê Ngọc Hà is a frontend tech lead who builds fast, scalable web experiences with React, Next.js, and TypeScript.";

// TODO: change this to your real deployed domain once live (used for absolute
// OG/Twitter image URLs).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://le-ngoc-ha.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Lê Ngọc Hà — Senior Frontend Engineer",
  description,
  authors: [{ name: "Lê Ngọc Hà", url: "https://github.com/Ngocha2607" }],
  keywords: [
    "Lê Ngọc Hà",
    "Frontend Engineer",
    "Frontend Tech Lead",
    "React",
    "Next.js",
    "TypeScript",
    "Portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lê Ngọc Hà — Senior Frontend Engineer",
    description,
    url: "/",
    siteName: "Lê Ngọc Hà",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lê Ngọc Hà — Senior Frontend Engineer",
    description,
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Lê Ngọc Hà",
  jobTitle: "Senior Frontend Engineer",
  description,
  url: siteUrl,
  sameAs: [
    "https://github.com/Ngocha2607",
    "https://www.linkedin.com/in/ng%E1%BB%8Dc-h%C3%A0-l%C3%AA-886aa3228/",
  ],
  knowsAbout: [
    "React",
    "Next.js",
    "TypeScript",
    "Spring Boot",
    "Frontend Architecture",
    "Web Performance",
    "Monorepo",
    "CI/CD",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Hanoi University of Science and Technology",
  },
  worksFor: { "@type": "Organization", name: "SAPP Academy" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body
        className="bg-slate-900 leading-relaxed text-slate-400 antialiased selection:bg-teal-300 selection:text-teal-900"
        suppressHydrationWarning
      >
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-teal-300 focus:px-4 focus:py-2 focus:font-semibold focus:text-teal-900"
        >
          Skip to Content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
