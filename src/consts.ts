/** Single source of truth for identity and SEO strings. */

export const SITE = {
  url: process.env.SITE_URL ?? "https://le-ngoc-ha.vercel.app",
  name: "Lê Ngọc Hà",
  title: "Lê Ngọc Hà — Senior Frontend Engineer",
  role: "Senior Frontend Engineer | Frontend Tech Lead",
  stack: "React • Next.js • TypeScript",
  description:
    "Lê Ngọc Hà is a frontend tech lead who builds fast, scalable web experiences with React, Next.js, and TypeScript.",
  locale: "en",
  location: "Hanoi, Vietnam",
  availability: "Available for Remote",
  email: "ngocha2k0.ln@gmail.com",
} as const;

export const SOCIAL = [
  { label: "GitHub", href: "https://github.com/Ngocha2607" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ng%E1%BB%8Dc-h%C3%A0-l%C3%AA-886aa3228/",
  },
  { label: "Email", href: `mailto:${SITE.email}` },
] as const;

/** In-page sections, in render order. Drives the header nav and the scroll spy. */
export const SECTIONS = [
  { id: "about", label: "About" },
  { id: "performance", label: "Performance" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "writing", label: "Writing" },
] as const;

export const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  jobTitle: "Senior Frontend Engineer",
  description: SITE.description,
  url: SITE.url,
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
