# English copy — lengocha.vercel.app/en

Every English string on the English pages, grouped by page, for review without reading code.

- **Source of truth:** `src/i18n/en.ts` (pages) and `src/data/writing-en.ts` (article titles and summaries). This file is generated from them; edit those files, not this one.
- **Vietnamese originals** stay in the component that shows them; each section below names it.
- **Rules:** plain English, short sentences, active voice. Every number, unit and before → after as in the Vietnamese; only the number *format* changes ("~1.000" → "~1,000", "2,5" → "2.5"). No claim, adjective or result the Vietnamese does not make. No hype words. Headline title "Fullstack Developer"; current role "Frontend Tech Lead at SAPP Academy". Nothing says or implies fluent or native English.
- **Only English-page additions:** labels saying which content is still Vietnamese ("In Vietnamese" on articles), and the contact email subject says it came from the English page.

## Page titles and meta descriptions

Titles are the window titles and are the same in both languages: “Lê Ngọc Hà — Fullstack Developer” (home), “About — Lê Ngọc Hà”, “Experience — Lê Ngọc Hà”, “Projects — Lê Ngọc Hà”, “Writing — Lê Ngọc Hà”, “Contact — Lê Ngọc Hà”, “Resume — Lê Ngọc Hà”, “Leadership & Technical Decisions — Lê Ngọc Hà”, “Gallery — Lê Ngọc Hà”.

| Page | Meta description (characters) |
|---|---|
| `/en` | Fullstack Developer, Frontend Tech Lead at SAPP Academy: React, Next.js, TypeScript on the frontend; NestJS and cloud on the backend. Explore it like a Mac. (156) |
| `/en/about` | Fullstack Developer and Frontend Tech Lead at SAPP Academy. Almost 5 years building EdTech and TravelTech web systems with React, Next.js, NestJS and cloud. (156) |
| `/en/experience` | Lê Ngọc Hà's Fullstack experience: Frontend Tech Lead at SAPP Academy (Payoo POS on NestJS, AWS to CMC Cloud move), Tweet World Travel, Minastik. (145) |
| `/en/projects` | Projects by Lê Ngọc Hà: SAPP Academy's LMS and operations system; Tweet World Travel's admin platform, B2B website and newsletter; EVN Hanoi modules. (149) |
| `/en/contact` | Contact Lê Ngọc Hà by email, GitHub or LinkedIn. Available for remote work, currently in Hanoi, Vietnam (UTC+7). (112) |
| `/en/resume` | Lê Ngọc Hà's CV: read it in the browser or download the PDF. (60) |
| `/en/decisions` | How Lê Ngọc Hà leads a team and makes technical decisions: leading with data, engineering standards, mentoring, a monorepo and an in-house Tiptap editor. (153) |
| `/en/gallery` | Screenshots of six projects by Lê Ngọc Hà: LMS Platform, Operations, Subscriber Platform, Website B2B, Newsletter System and EVN Hanoi. (135) |
| `/en/writing` | Articles in Vietnamese about frontend work and my projects: SAPP LMS & OPS, TravelTech, monorepo architecture, an in-house editor, AppSec. (138) |

Vietnamese originals: `SITE_DESCRIPTION` in `src/lib/site.ts`, `SECTION_PAGES` in `src/lib/sections.ts`, `src/app/_shared/writing-list.tsx`.

## Menu bar (every page)

- Language switch: “VI | EN”; accessible name “Language”; links named “Tiếng Việt” and “English”.

## Home — /en (intro widget)

Vietnamese original: `DesktopIntro.tsx`.

- Heading (H1): “Lê Ngọc Hà — Fullstack Developer”
- Line: “Frontend Tech Lead at SAPP Academy. React, Next.js and TypeScript on the frontend; NestJS and cloud on the backend.”
- Close button label: “Close the introduction”
- Links label: “Sections”; links: About, Experience, Projects, Writing, Contact

## About — /en/about

Vietnamese originals: `AboutWindow.tsx` (greeting, paragraphs, counters), `AboutDetails.tsx` (timeline), `AboutTestimonials.tsx` and `src/data/testimonials.ts`. Expertise and Stack were already English and are unchanged.

### Intro

- Greeting: “Hi, I'm Hà.”
- Paragraph 1: “Fullstack Developer, currently Frontend Tech Lead at SAPP Academy. Almost 5 years building web systems for EdTech and TravelTech, from React/Next.js interfaces to NestJS and Spring Boot backends and cloud infrastructure.”
- Paragraph 2: “Strongest on the frontend: monorepo architecture, performance and engineering process for the team. At SAPP I also work on the backend and infrastructure: I integrated the Payoo POS payment gateway on NestJS, and I led the move of the dev servers, GitLab and the production database from AWS to CMC Cloud without renting extra machines.”

### Counters

| Label | Value |
|---|---|
| • Experience | 5 years |
| • Page load time cut | 60% |
| • Juniors mentored | 5 |
| • Productivity gain | 30% |

### Experience timeline

| Dates | Company | Role |
|---|---|---|
| 2018 – 2022 | HUST | Bachelor, Electronics & Telecom (Advanced Program) |
| 2021 | FPT Software | Intern |
| 2021 – 2023 | Minastik | Frontend Developer |
| 2023 – 2025 | Tweet World Travel | Fullstack Developer |
| 2025 – Present | SAPP Academy | Frontend Tech Lead |

### Testimonials (preview deployments only; production hides samples)

- Heading: “Testimonials”; badge: “SAMPLE” (tooltip “Sample testimonial, not a real quote yet”); source link: “Source ↗”
- `sapp-manager` — “Hà measures before fixing anything. The LMS page went from 15.2s to 6.1s, and every decision has its reasons written down.” — Direct manager
- `sapp-colleague` — “Hà took the Payoo integration from the start to sign-off, including the reconciliation with accounting.” — Colleague
- `sapp-junior` — “Hà reviews carefully but does not do the work for you. I learned how to find solutions myself.” — Junior Frontend developer, mentored
- `twt-pm` — “Our site went from 3.2s to 1.1s after Hà optimised the SSR.” — PM

## Experience — /en/experience

Vietnamese original: `ROLES` in `ExperienceWindow.tsx`.

### SAPP Academy — Frontend Tech Lead

- Period: 03/2025 — Present
- Lead the LMS + Ops frontend, review 100% of Merge Requests and mentor 2 Junior Frontend developers.
- Designed a monorepo with pnpm Workspace + Turborepo, brought 4 frontends into it and standardised the shared packages.
- Owned the backend integration of the Payoo POS payment gateway on NestJS (ops, payment-service, background-job-service): create, cancel and look up orders, IPN handling, a reconciliation cron, HubSpot and SAP sync, 174 test cases.
- Led the move of the dev server (16 NestJS apps), GitLab and the e-contract production database from AWS to CMC Cloud in 7 weeks, without renting extra machines; the production database was down for only about 2.5 minutes.
- Upgraded the LMS from Next.js 12 → 14 App Router and optimised performance: page load time down 60% (15.2s → 6.1s), Lighthouse 29 → 65+.
- Replaced a commercial editor with Tiptap, built as a shared private package, which reduced vendor dependence and licence costs.
- Added Gitleaks, Trivy, Semgrep and OWASP ZAP to CI/CD and built an AI Workflow: productivity up 30%, ~10 hours/week saved.

### Tweet World Travel Group — Fullstack Developer

- Period: 03/2023 — 02/2025
- Built 5 B2B TravelTech platforms serving ~1,000 users/month, plus a multilingual internal admin system.
- Built and maintained backend services with Spring Boot / microservices in a monorepo.
- Optimised SSR and frontend assets: page load 3.2s → 1.1s (-66%), Lighthouse kept at 85.
- Mentored 3 Junior Frontend developers and reviewed Pull Requests before they were merged into Staging.
- Restructured and standardised the codebase to make it easier to extend and reuse.

### Minastik JSC — Frontend Developer

- Period: 10/2021 — 02/2023
- Note: Onsite at 3S Intersoft JSC
- Built and maintained several web applications with React.js, with responsive interfaces and a consistent user experience across platforms.
- Worked with the backend team to integrate RESTful APIs, ship new features and fix bugs during development.
- Worked in Agile/Scrum, closely with the rest of the team, to keep the project on schedule.

### FPT Software — Software Engineer Intern

- Period: 2021
- Summary: “Built an employee management application in C++.”

### Hanoi University of Science and Technology — Bachelor of Electronics and Telecommunications

- Period: 2018 — 2022
- Summary: “Research paper — REV ECIT 2021 conference proceedings.”

## Projects — /en/projects

Vietnamese original: `PROJECTS` in `ProjectsWindow.tsx`. Titles, tags and image alt text were already English and are unchanged. The same text appears in Spotlight (⌘K).

| Card | Period | Description |
|---|---|---|
| LMS Platform · SAPP Academy | 2025 — Present | Online learning management system; technical lead for the frontend. |
| Operations · SAPP Academy | 2025 — Present | 18 operations modules: classes, grading, attendance. |
| Subscriber Platform · Tweet World Travel | 2023 — 2025 | Management platform for a travel business. |
| Website B2B · Tweet World Travel | 2023 — 2024 | Multilingual travel e-commerce platform serving ~1,000 users/month; page load 3.2s → 1.1s, Lighthouse 85. |
| Newsletter System · Tweet World Travel | 2023 — 2024 | Drag-and-drop email builder and subscriber management system. |
| EVN Hanoi Power Company | 2022 — 2023 | UI/UX for power utility management modules. |

## Contact — /en/contact

Vietnamese original: `ContactWindow.tsx`. The heading (“Let's talk”), field labels, placeholders, the button and “Available for remote work” were already English and are unchanged.

- Under the heading: “Available for remote · Hanoi, Vietnam”
- Location: “Hanoi, Vietnam · UTC+7”
- After a successful send: “Sent — I will reply as soon as I can.”
- After a failed send: “Sending failed. Please email me directly at ngocha2k0.ln@gmail.com.”
- Email subject the owner receives: “Portfolio contact (English page) — lengocha.vercel.app”

## Resume — /en/resume

The window text (“Résumé”, “Mobile browsers cannot display a PDF inline. Open it in a new tab or save it.”, “Open ↗”, “Download ↓”) is English on both sites. On `/en/resume` the window shows the English CV, `Le-Ngoc-Ha-Fullstack-Developer-EN.pdf`. The CV's text is not in `src/i18n/en.ts`: it is in `cv/content.en.json`, which `npm run cv:build` turns into the PDF (see `cv/README.md`).

## Leadership & Technical Decisions — /en/decisions

Vietnamese original: `DecisionsWindow.tsx`. Group labels (Leadership, Technical Decisions) and section labels (CONTEXT, OPTIONS, DECISION, CONSEQUENCES) were already English.

- Status labels: Shipped → “Shipped”; Held → “Measured, not shipped”; Reverted → “Removed”

### Leadership

**Leading with data** — 2025 · LMS · SAPP Academy

Prioritised optimisation work on real measurements across 15 pages: page load time down 60% (15.2s → 6.1s), Lighthouse 49 → 67 for the learner pages and 72 → 89 for the instructor pages.

**Setting engineering standards for the team** — 2026 · CI/CD pipeline · SAPP Academy

Set code and security standards, automated the checks in CI/CD and personally review 100% of Merge Requests — so machines catch the repeated mistakes and people focus on architecture and quality.

**Mentoring and growing junior engineers** — 2023 — 2025 · SAPP Academy · Tweet World Travel

Mentored 5 Junior Frontend developers directly, teaching them how to analyse a problem and find the solution themselves instead of handing them the answer.

### Technical Decisions

**User-facing performance over server metrics** — Measured, not shipped · 2026

The server metrics improved clearly, but what users actually experienced did not change, so it is not shipped yet.

*Context:* One change cut server response time from 60ms → 3ms on 20 pages. But real measurements showed that users barely noticed the improvement.

*Options:*
- Ship it — the mechanism is proven to work
- Ship it behind a flag on a few low-risk routes
- → (chosen) Hold it until the client boundary is pushed down to the leaves

*Decision:* I decided not to ship it and moved the effort to the bottleneck that does affect the real experience. The change stays in the working tree, with its measurements next to it.

*Consequences:*
- Twenty routes can be statically generated, and server response time on the main routes drops from ~60ms to 3ms when measured locally.
- But a hook that reads search params sits at the top of the provider tree, so everything bails out to client rendering and the real content still arrives after hydration. The server metric changed; what users wait for did not.
- A good change in the wrong order. It will ship once the client boundary is pushed down to the leaves — otherwise it is a 15x improvement on a number no user can feel.

**Merging 4 products into one shared platform** — Shipped · 2025

Less repeated work, consistent quality, and new products inherit the engineering and security standards straight away.

*Context:* The four products used to live in four separate repositories, so shared features had to be built again in each one.

*Options:*
- Separate repos with a published component package
- → (chosen) One monorepo with a task graph over a shared layer
- A single application with per-customer feature flags

*Decision:* I decided to move to a monorepo with pnpm Workspace + Turborepo, and to centralise the shared UI, editor and styles.

*Consequences:*
- A new app inherits the shared layer and every security gate from day one, instead of negotiating both later.
- Unchanged packages are restored from cache, so the pipeline stays usable as the number of apps grows.
- The shared layer becomes the place where code-splitting decisions have to be made, because that is where the heaviest things live.

**Replacing a paid editor with an in-house one built on Tiptap** — Shipped · 2025

A cost that grew with the number of learners became a one-time engineering investment.

*Context:* The old editor was priced per user, so its cost grew with the number of learners.

*Options:*
- Renew, and negotiate the seat count every year
- Limit the editor to fewer roles to keep the seat count low
- → (chosen) Build our own on open source (Tiptap / ProseMirror)

*Decision:* I decided to move to Tiptap, and to build it and package it as a shared package in the monorepo.

*Consequences:*
- A variable licence cost became a fixed engineering cost, and monthly spending went down with it.
- The monorepo no longer loads TinyMCE anywhere.
- The trade-off: the team owns all development and maintenance of the editor; in return it depends less on a vendor and has better control of long-term cost.

## Writing — /en/writing

Every card links to the Vietnamese article at `/writing/<slug>` and carries the label “In Vietnamese”; so does an article opened from this list. A post published later with no entry here shows its Vietnamese title and description (marked `lang="vi"`) with the same label. Window text (topic filter, “All”, “min read”, “Back”, “Copy link”, “CONTENTS”) was already English.

### Website B2B: A multilingual tour sales website on Next.js

`website-b2b-website-ban-tour-da-ngon-ngu-tren-next-js`

Tweet World Travel's public site: a catalogue of tours and cruises, and the entry point for B2B agents. Page load went from 3.2s to 1.1s, Lighthouse 85. The site is still live.

### EVN Hanoi: A customer service portal and power utility management modules

`evn-ha-noi-cong-cskh-va-cac-module-quan-ly-dien-luc`

A customer service portal and power utility management modules for EVNHANOI, 2022–2023. React, Redux Toolkit and Ant Design on a .NET Core API, onsite at 3S Intersoft.

### SAPP OPS: A training operations system with 18 business modules

`sapp-ops-he-van-hanh-dao-tao-voi-18-module-nghiep-vu`

SAPP's back office: classes, a question bank, AI-assisted grading, scheduling, attendance resync, orders and money. 19 feature packages, 18 modules plugged into one registry.

### SAPP LMS: A learning and exam-prep platform for ACCA, CFA and CMA

`sapp-lms-nen-tang-hoc-va-luyen-thi-acca-cfa-cma`

SAPP LMS seen from the code: 4 Next.js apps in one monorepo, an in-house Storyline player, more than 8 question types and an exam-room toolkit. My part of the work since 3/2025.

### TKG Platform: A management platform for a wholesale tour operator

`tkg-platform-nen-tang-quan-tri-hang-tour-ban-si`

The management platform of Tweet World Travel, a wholesale tour operator: CRM, catalogue, booking and purchase orders, split into three portals for operations, suppliers and agents. My frontend part of it.

### Newsletter System: A drag-and-drop email marketing tool with automation

`newsletter-system-cong-cu-email-marketing-keo-tha-va-automation`

An in-house email marketing tool for Tweet World Travel: a GrapeJS drag-and-drop builder, subscriber management, scheduled campaigns and an automation feed that pulls tour content from an API. I built the frontend, 2023–2024.

### When the editor is priced per learner: building on Tiptap to replace TinyMCE

`khi-editor-tinh-tien-theo-so-hoc-vien-tu-dung-tiptap-thay-tinymce`

Why SAPP dropped TinyMCE and I rebuilt the editor on Tiptap as a shared package: 7 custom extensions, 17 months of old HTML that still had to render, and the debts that remain.

### SAPP LMS & OPS: Two frontends of one training operations system

`sapp-lms-ops-hai-frontend-cua-mot-he-van-hanh-dao-tao`

SAPP runs on two frontends: the LMS for learners and OPS for operations. An overview of both systems, how one class session passes through both, and my part in each.

### Selling the LMS by module: A plugin architecture in a Next.js monorepo

`ban-lms-theo-module-kien-truc-plugin-trong-monorepo-next-js`

One codebase that builds a separate version for each customer: an AppModule registry, a Slot/ExtensionRegistry layer, and a gen script that removes the features a customer has not bought before the build. Plus what I would do differently.

### An AppSec handbook for the frontend: Gitleaks, Trivy, Semgrep

`so-tay-appsec-cho-frontend-gitleaks-trivy-semgrep`

Frontend security needs three layers of automated checks: Gitleaks to catch secrets (pre-commit, and it blocks the merge), Trivy to scan library vulnerabilities (CI only, warns) and Semgrep to catch dangerous code patterns (pre-commit and CI, warns).

### Moving infrastructure from AWS to CMC Cloud without renting extra machines

`chuyen-ha-tang-tu-aws-sang-cmc-cloud-ma-khong-thue-them-may`

How I moved SAPP's dev server (16 NestJS apps), GitLab and the e-contract production database from AWS to CMC Cloud in 7 weeks: rehearsals with real data, cutovers with about 2.5 minutes of production downtime, and the AWS clean-up.

## Already English, unchanged in both languages

Window titles; desktop folder labels; dock tooltips; the logo menu; Spotlight; the Gallery window; the pre-loader (“Hey, I'm Hà! Welcome to my Portfolio”, “Explore it like a Mac.”); Expertise and Stack in About; the Writing window's controls and messages.

