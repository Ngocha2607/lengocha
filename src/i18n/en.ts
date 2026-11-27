import type {
  AboutCopy,
  ContactCopy,
  DecisionsCopy,
  DesktopIntroCopy,
  MenuBarCopy,
  MetaCopy,
  ProjectCopy,
  ProjectId,
  ResumeCopy,
  RoleCopy,
  TestimonialsCopy,
  WritingCopy,
} from "./types";

/**
 * EVERY English string on the site, in one file, so it can be reviewed and
 * edited without reading components. The Vietnamese originals stay in the
 * component that shows them; each block below says where.
 *
 * Translation rules (from the brief, keep them when editing):
 *   - Plain English, short sentences, active voice.
 *   - Every number, unit and before → after exactly as in Vietnamese. Only the
 *     number FORMAT changes: Vietnamese "~1.000" is "~1,000" here and "2,5"
 *     is "2.5" — the same values.
 *   - No claim, adjective or result that the Vietnamese does not make. No hype
 *     words (passionate, rockstar, seamless, cutting-edge, leverage).
 *   - Headline title "Fullstack Developer"; current role "Frontend Tech Lead
 *     at SAPP Academy".
 *   - Nothing may say or imply fluent or native English.
 *
 * The one thing the English pages say that the Vietnamese ones do not is
 * which content is still Vietnamese: the CV PDF and the articles.
 *
 * Article titles and summaries for /en/writing are in src/data/writing-en.ts.
 * A readable copy of all of it is in docs/english-copy.md.
 */

/** <title>s are the window titles ("About", …), the same in both languages. */
export const EN_META: MetaCopy = {
  // VI: SITE_DESCRIPTION in lib/site.ts.
  siteDescription:
    "Fullstack Developer, Frontend Tech Lead at SAPP Academy: React, Next.js, TypeScript on the frontend; NestJS and cloud on the backend. Explore it like a Mac.",
  // VI: SECTION_PAGES in lib/sections.ts.
  sections: {
    about:
      "Lê Ngọc Hà, Fullstack Developer, Frontend Tech Lead at SAPP Academy. Almost 5 years of EdTech and TravelTech web: React, Next.js, NestJS, Spring Boot and cloud.",
    experience:
      "Lê Ngọc Hà's Fullstack experience: Frontend Tech Lead at SAPP Academy (Payoo POS on NestJS, AWS to CMC Cloud move), Tweet World Travel, Minastik.",
    projects:
      "Projects by Lê Ngọc Hà: SAPP Academy's LMS and operations system; Tweet World Travel's admin platform, B2B website and newsletter; EVN Hanoi modules.",
    contact:
      "Contact Lê Ngọc Hà by email, GitHub or LinkedIn. Available for remote work, currently in Hanoi, Vietnam (UTC+7).",
    resume:
      "Lê Ngọc Hà's CV: read it in the browser or download the PDF. The CV is in Vietnamese.",
    decisions:
      "How Lê Ngọc Hà leads a team and makes technical decisions: leading with data, engineering standards, mentoring, a monorepo and an in-house Tiptap editor.",
    gallery:
      "Screenshots of six projects by Lê Ngọc Hà: LMS Platform, Operations, Subscriber Platform, Website B2B, Newsletter System and EVN Hanoi.",
  },
  // VI: WRITING_DESCRIPTION_VI in app/_shared/writing-list.tsx.
  writing:
    "Articles in Vietnamese about frontend work and my projects: SAPP LMS & OPS, TravelTech, monorepo architecture, an in-house editor, AppSec.",
};

export const EN_MENU_BAR: MenuBarCopy = {
  languageLabel: "Language",
};

/** VI: DesktopIntro.tsx. The H1 ("Lê Ngọc Hà — Fullstack Developer") is the same. */
export const EN_DESKTOP_INTRO: DesktopIntroCopy = {
  closeLabel: "Close the introduction",
  tagline: "Frontend Tech Lead at SAPP Academy. React, Next.js, TypeScript, NestJS on the backend, and cloud.",
  navLabel: "Sections",
};

/**
 * VI: AboutWindow.tsx (greeting, paragraphs, counters) and AboutDetails.tsx
 * (timeline). Expertise, Stack and the block headings are already English.
 */
export const EN_ABOUT: AboutCopy = {
  greeting: "Hi, I'm Hà.",
  paragraphs: [
    "Fullstack Developer, currently Frontend Tech Lead at SAPP Academy. Almost 5 years building web systems for EdTech and TravelTech, from React/Next.js interfaces to NestJS and Spring Boot backends and cloud infrastructure.",
    "Strongest on the frontend: monorepo architecture, performance and engineering process for the team. At SAPP I also work on the backend and infrastructure: I integrated the Payoo POS payment gateway on NestJS, and I led the move of the dev servers, GitLab and the production database from AWS to CMC Cloud without renting extra machines. Each piece of work has before and after measurements, recorded in Writing.",
  ],
  counters: [
    { label: "• Experience", value: "5 years", target: 5, suffix: " years" },
    { label: "• Page load time cut", value: "60%", target: 60, suffix: "%" },
    { label: "• Juniors mentored", value: "5", target: 5, suffix: "" },
    { label: "• Productivity gain", value: "30%", target: 30, suffix: "%" },
  ],
  timeline: [
    { dates: "2018 – 2022", company: "HUST", role: "Bachelor, Electronics & Telecom (Advanced Program)" },
    { dates: "2021", company: "FPT Software", role: "Intern" },
    { dates: "2021 – 2023", company: "Minastik", role: "Frontend Developer" },
    { dates: "2023 – 2025", company: "Tweet World Travel", role: "Fullstack Developer" },
    { dates: "2025 – Present", company: "SAPP Academy", role: "Frontend Tech Lead" },
  ],
};

/**
 * VI: AboutTestimonials.tsx and data/testimonials.ts. The quotes there are
 * SAMPLES, shown only outside production; these are their translations.
 * When a real testimonial replaces a sample, replace or delete its entry
 * here too — a translation of someone's words must be one they would sign.
 */
export const EN_TESTIMONIALS: TestimonialsCopy = {
  heading: "Testimonials",
  sampleBadge: "SAMPLE",
  sampleTitle: "Sample testimonial, not a real quote yet",
  sourceLink: "Source ↗",
  translations: {
    "sapp-manager": {
      quote:
        "Hà measures before fixing anything. The LMS page went from 15.2s to 6.1s, and every decision has its reasons written down.",
      relation: "Direct manager",
    },
    "sapp-colleague": {
      quote:
        "Hà took the Payoo integration from the start to sign-off, including the reconciliation with accounting.",
      relation: "Colleague",
    },
    "sapp-junior": {
      quote: "Hà reviews carefully but does not do the work for you. I learned how to find solutions myself.",
      relation: "Junior Frontend developer, mentored",
    },
    "twt-pm": {
      quote: "Our site went from 3.2s to 1.1s after Hà optimised the SSR.",
      relation: "PM",
    },
  },
};

/** VI: ROLES in ExperienceWindow.tsx. Newest first. */
export const EN_EXPERIENCE: readonly RoleCopy[] = [
  {
    period: "03/2025 — Present",
    title: "Frontend Tech Lead",
    org: "SAPP Academy",
    url: "https://sapp.edu.vn",
    highlights: [
      "Lead the LMS + Ops frontend, review 100% of Merge Requests and mentor 2 Junior Frontend developers.",
      "Designed a monorepo with pnpm Workspace + Turborepo, brought 4 frontends into it and standardised the shared packages.",
      "Owned the backend integration of the Payoo POS payment gateway on NestJS (ops, payment-service, background-job-service): create, cancel and look up orders, IPN handling, a reconciliation cron, HubSpot and SAP sync, 174 test cases.",
      "Led the move of the dev server (16 NestJS apps), GitLab and the e-contract production database from AWS to CMC Cloud in 7 weeks, without renting extra machines; the production database was down for only about 2.5 minutes.",
      "Upgraded the LMS from Next.js 12 → 14 App Router and optimised performance: page load time down 60% (15.2s → 6.1s), Lighthouse 29 → 65+.",
      "Replaced a commercial editor with Tiptap, built as a shared private package, which reduced vendor dependence and license costs.",
      "Added Gitleaks, Trivy, Semgrep and OWASP ZAP to CI/CD and built an AI Workflow: productivity up 30%, ~10 hours/week saved.",
    ],
  },
  {
    period: "03/2023 — 02/2025",
    title: "Fullstack Developer",
    org: "Tweet World Travel Group",
    url: "https://tweetworldtravel.com",
    highlights: [
      "Built 5 B2B TravelTech platforms serving ~1,000 users/month, plus a multilingual internal admin system.",
      "Built and maintained backend services with Spring Boot / microservices in a monorepo.",
      "Optimised SSR and frontend assets: page load 3.2s → 1.1s (-66%), Lighthouse kept at 85.",
      "Mentored 3 Junior Frontend developers and reviewed Pull Requests before they were merged into Staging.",
      "Restructured and standardised the codebase to make it easier to extend and reuse.",
    ],
  },
  {
    period: "10/2021 — 02/2023",
    title: "Frontend Developer",
    org: "Minastik JSC",
    url: "https://www.minastik.com",
    note: "Onsite at 3S Intersoft JSC",
    highlights: [
      "Built and maintained several web applications with React.js, with responsive interfaces and a consistent user experience across platforms.",
      "Worked with the backend team to integrate RESTful APIs, ship new features and fix bugs during development.",
      "Worked in Agile/Scrum, closely with the rest of the team, to keep the project on schedule.",
    ],
  },
  {
    period: "2021",
    title: "Software Engineer Intern",
    org: "FPT Software",
    url: "https://www.fpt-software.com",
    summary: "Built an employee management application in C++.",
    highlights: [],
  },
  {
    period: "2018 — 2022",
    title: "Bachelor of Electronics and Telecommunications",
    org: "Hanoi University of Science and Technology",
    url: "https://hust.edu.vn",
    summary: "Research paper — REV ECIT 2021 conference proceedings.",
    highlights: [],
  },
];

/** VI: PROJECTS in ProjectsWindow.tsx. Titles, tags and alt text are already English. */
export const EN_PROJECTS: Record<ProjectId, ProjectCopy> = {
  lms: {
    period: "2025 — Present",
    description: "Online learning management system; technical lead for the frontend.",
  },
  ops: {
    period: "2025 — Present",
    description: "18 operations modules: classes, grading, attendance.",
  },
  subscriber: {
    period: "2023 — 2025",
    description: "Management platform for a travel business",
  },
  b2b: {
    period: "2023 — 2024",
    description:
      "Multilingual travel e-commerce platform serving ~1,000 users/month; page load 3.2s → 1.1s, Lighthouse 85.",
  },
  newsletter: {
    period: "2023 — 2024",
    description: "Drag-and-drop email builder and subscriber management system.",
  },
  evn: {
    period: "2022 — 2023",
    description: "UI/UX for power utility management modules.",
  },
};

/** VI: ContactWindow.tsx. The form labels and placeholders are already English. */
export const EN_CONTACT: ContactCopy = {
  availability: "Available for remote · Hanoi, Vietnam",
  location: "Hanoi, Vietnam · UTC+7",
  sent: "Sent — I will reply as soon as I can.",
  failedBefore: "Sending failed. Please email me directly at",
  failedAfter: ".",
};

/** The Resume window is already English; the CV inside it is not. */
export const EN_RESUME: ResumeCopy = {
  languageNote: "The CV is in Vietnamese",
};

/** VI: DecisionsWindow.tsx. Group and section labels are already English. */
export const EN_DECISIONS: DecisionsCopy = {
  statusLabels: {
    Shipped: "Shipped",
    Held: "Measured, not shipped",
    Reverted: "Removed",
  },
  highlights: [
    {
      kind: "highlight",
      id: "h-metrics",
      title: "Leading with data",
      period: "2025",
      org: "LMS · SAPP Academy",
      detail:
        "Prioritised optimisation work on real measurements across 15 pages: page load time down 60% (15.2s → 6.1s), Lighthouse 49 → 67 for the learner pages and 72 → 89 for the instructor pages.",
    },
    {
      kind: "highlight",
      id: "h-standards",
      title: "Setting engineering standards for the team",
      period: "2026",
      org: "CI/CD pipeline · SAPP Academy",
      detail:
        "Set code and security standards, automated the checks in CI/CD and personally review 100% of Merge Requests — so machines catch the repeated mistakes and people focus on architecture and quality.",
    },
    {
      kind: "highlight",
      id: "h-mentor",
      title: "Mentoring and growing junior engineers",
      period: "2023 — 2025",
      org: "SAPP Academy · Tweet World Travel",
      detail:
        "Mentored 5 Junior Frontend developers directly, teaching them how to analyse a problem and find the solution themselves instead of handing them the answer.",
    },
  ],
  decisions: [
    {
      kind: "decision",
      id: "d-ttfb",
      status: "Held",
      year: "2026",
      title: "User-facing performance over server metrics",
      upshot:
        "The server metrics improved clearly, but what users actually experienced did not change, so it is not shipped yet.",
      context:
        "One change cut server response time from 60ms → 3ms on 20 pages. But real measurements showed that users barely noticed the improvement.",
      options: [
        "Ship it — the mechanism is proven to work",
        "Ship it behind a flag on a few low-risk routes",
        "Hold it until the client boundary is pushed down to the leaves",
      ],
      chosen: 2,
      decision:
        "I decided not to ship it and moved the effort to the bottleneck that does affect the real experience. The change stays in the working tree, with its measurements next to it.",
      consequences: [
        "Twenty routes can be statically generated, and server response time on the main routes drops from ~60ms to 3ms when measured locally.",
        "But a hook that reads search params sits at the top of the provider tree, so everything bails out to client rendering and the real content still arrives after hydration. The server metric changed; what users wait for did not.",
        "A good change in the wrong order. It will ship once the client boundary is pushed down to the leaves — otherwise it is a 15x improvement on a number no user can feel.",
      ],
    },
    {
      kind: "decision",
      id: "d-monorepo",
      status: "Shipped",
      year: "2025",
      title: "Merging 4 products into one shared platform",
      upshot:
        "Less repeated work, consistent quality, and new products inherit the engineering and security standards straight away.",
      context:
        "The four products used to live in four separate repositories, so shared features had to be built again in each one.",
      options: [
        "Separate repos with a published component package",
        "One monorepo with a task graph over a shared layer",
        "A single application with per-customer feature flags",
      ],
      chosen: 1,
      decision:
        "I decided to move to a monorepo with pnpm Workspace + Turborepo, and to centralise the shared UI, editor and styles.",
      consequences: [
        "A new app inherits the shared layer and every security gate from day one, instead of negotiating both later.",
        "Unchanged packages are restored from cache, so the pipeline stays usable as the number of apps grows.",
        "The shared layer becomes the place where code-splitting decisions have to be made, because that is where the heaviest things live.",
      ],
    },
    {
      kind: "decision",
      id: "d-editor",
      status: "Shipped",
      year: "2025",
      title: "Replacing a paid editor with an in-house one built on Tiptap",
      upshot: "A cost that grew with the number of learners became a one-time engineering investment.",
      context: "The old editor was priced per user, so its cost grew with the number of learners.",
      options: [
        "Renew, and negotiate the seat count every year",
        "Limit the editor to fewer roles to keep the seat count low",
        "Build our own on open source (Tiptap / ProseMirror)",
      ],
      chosen: 2,
      decision:
        "I decided to move to Tiptap, and to build it and package it as a shared package in the monorepo.",
      consequences: [
        "A variable license cost became a fixed engineering cost, and monthly spending went down with it.",
        "The monorepo no longer loads TinyMCE anywhere.",
        "The trade-off: the team owns all development and maintenance of the editor; in return it depends less on a vendor and has better control of long-term cost.",
      ],
    },
  ],
};

export const EN_WRITING: WritingCopy = {
  languageLabel: "In Vietnamese",
};
