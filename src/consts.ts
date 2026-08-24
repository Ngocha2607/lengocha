/** Single source of truth for identity, SEO strings and the page's spine. */

export const SITE = {
  url: process.env.SITE_URL ?? "https://le-ngoc-ha.vercel.app",
  name: "Lê Ngọc Hà",
  title: "Lê Ngọc Hà — Senior Frontend Engineer",
  role: "Senior Frontend Engineer · Frontend Tech Lead",
  stack: "React · Next.js · TypeScript",
  description:
    "Lê Ngọc Hà is a frontend tech lead who builds fast, scalable web experiences with React, Next.js, and TypeScript.",
  locale: "en",
  location: "Hanoi, Vietnam",
  timezone: "UTC+7",
  availability: "Available for remote",
  email: "ngocha2k0.ln@gmail.com",
  /** Where the front page's own claims come from. Shown in the colophon. */
  edition: "2026",
} as const;

export const SOCIAL = [
  { label: "GitHub", href: "https://github.com/Ngocha2607" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ng%E1%BB%8Dc-h%C3%A0-l%C3%AA-886aa3228/",
  },
  { label: "Email", href: `mailto:${SITE.email}` },
] as const;

/**
 * The page's spine, in render order. Drives the masthead index, the sticky
 * rail and the scroll spy, so adding a section here is the only place a
 * number has to change.
 *
 * `kicker` is the newspaper-style category above a section title; `label` is
 * what the index and the rail show.
 */
export const SECTIONS = [
  { id: "lead", label: "The short version", kicker: "Lead" },
  { id: "decisions", label: "Decision log", kicker: "Evidence" },
  { id: "performance", label: "Performance case", kicker: "Evidence" },
  { id: "leading", label: "How I run a team", kicker: "Practice" },
  { id: "work", label: "Where I've worked", kicker: "Record" },
  { id: "projects", label: "What I've shipped", kicker: "Record" },
  { id: "toolbox", label: "Toolbox", kicker: "Reference" },
  { id: "writing", label: "Writing", kicker: "Reference" },
  { id: "hiring", label: "Working together", kicker: "Contact" },
] as const;

/** Two-digit index for a section id, matching the masthead numbering. */
export function sectionIndex(id: string): string {
  const i = SECTIONS.findIndex((section) => section.id === id);
  return String(i + 1).padStart(2, "0");
}

export const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  jobTitle: "Senior Frontend Engineer",
  description: SITE.description,
  url: SITE.url,
  email: `mailto:${SITE.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hanoi",
    addressCountry: "VN",
  },
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
