/** Single source of truth for identity, SEO strings and navigation. */

export const SITE = {
  url: process.env.SITE_URL ?? "https://le-ngoc-ha.vercel.app",
  /** The hero wordmark and the footer wordmark both render this, uppercased. */
  name: "Lê Ngọc Hà",
  title: "Lê Ngọc Hà — Senior Frontend Engineer",
  role: "Senior Frontend Engineer · Frontend Tech Lead",
  description:
    "Lê Ngọc Hà is a frontend tech lead who builds fast, scalable web experiences with React, Next.js, and TypeScript.",
  /** The hero standfirst. Plain language, for a reader who is not an engineer. */
  tagline:
    "A frontend tech lead who owns the architecture of a learning platform used every day — and makes it measurably faster.",
  /** The line printed across the footer block. */
  motto:
    "Measure before you touch anything. Then write down what you chose not to do.",
  locale: "en",
  location: "Hanoi, Vietnam",
  timezone: "UTC+7",
  availability: "Available for remote",
  email: "ngocha2k0.ln@gmail.com",
} as const;

export const SOCIALS = [
  { name: "GitHub", href: "https://github.com/Ngocha2607" },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/ng%E1%BB%8Dc-h%C3%A0-l%C3%AA-886aa3228/",
  },
  { name: "Email", href: `mailto:${SITE.email}` },
] as const;

/**
 * In-page navigation. This is a single-page portfolio rather than the
 * template's five routes, so the header links are anchors and every section id
 * lives here.
 *
 * The order matches the order of the sections on the page, so the header reads
 * top to bottom. `#leading` was missing for a while: the section was on the
 * page but unreachable from the header, the mobile sheet or the footer, all
 * three of which render this list. If a section is added, add it here.
 */
export const NAV = [
  { name: "About", href: "#about" },
  { name: "Career", href: "#career" },
  { name: "Work", href: "#work" },
  { name: "Performance", href: "#performance" },
  { name: "Decisions", href: "#decisions" },
  { name: "Leading", href: "#leading" },
  { name: "Writing", href: "#writing" },
  { name: "Contact", href: "#contact" },
] as const;

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
