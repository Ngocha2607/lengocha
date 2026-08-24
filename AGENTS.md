# Lê Ngọc Hà — Personal Portfolio

A single-page developer portfolio built with Next.js. (Originally scaffolded
from a website-clone template; now a standalone personal site.)

## Heads-up: Next.js 16

This project runs Next.js 16 with the App Router and React 19, which have
breaking changes compared to older versions and to most training data. When
unsure about an API or convention, check the docs bundled in
`node_modules/next/dist/docs/` before writing code.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Inline SVG React components in `src/components/icons.tsx`
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Vercel

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style

- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Project Structure

```
src/
  app/              # Next.js routes, root layout, global CSS
    writing/[slug]/ # Notion-backed article pages (ISR)
  components/       # React components (Header, SectionHeading, About, Performance, Experience, Projects, Writing, Footer)
    ui/             # shadcn/ui primitives
    icons.tsx       # SVG icons as React components
  lib/utils.ts      # cn() utility
  lib/notion.ts     # Notion "Writing" data layer (getPublishedPosts, getPostBySlug)
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Images and project screenshots
  seo/              # Favicons, OG images, webmanifest
  resume.pdf        # Downloadable CV
```

## Two audiences per section

The page is read by engineers who will probe the claims and by recruiters and
hiring managers who will not. Every section therefore carries a visible title
and a plain-language lead before any depth, via `SectionHeading`:

- Each section renders exactly one `SectionHeading` and points its
  `aria-labelledby` at the `${id}-title` heading — no `aria-label`, no second
  copy of the section name. The eyebrow is `aria-hidden`, since the `<h2>`
  underneath already names the section.
- `SectionHeading` returns a **fragment** on purpose. `position: sticky` is
  bounded by its containing block, so the mobile wayfinder has to be a direct
  child of the `<section>` to stay pinned for the section's full height.
- The bar uses negative margins to reach full-bleed, never `w-screen`: `100vw`
  includes the scrollbar and gives the whole page a horizontal scroll.
- Section headings are visible at every breakpoint. Earlier versions hid them
  with `lg:sr-only`, which left the desktop content column with no titles at
  all — do not reintroduce that.
- Jargon gets a plain-English gloss next to it rather than being removed: metric
  acronyms carry a `plain` label (`FIELD_METRICS` and `WebVitalsMonitor`'s
  `METRICS` must keep the same wording, since the two strips are read as a
  pair), the Lighthouse donuts explain the 0–100 banding, and the unshipped-fix
  callout opens with an "In plain terms" line before the detail. Glosses have a
  reserved two-line height (`min-h-7`) so the values below them stay aligned
  across the row.

## Interactive sections

Three components carry custom interaction instead of the stock list layout. The
only runtime dependency any of them adds is `web-vitals` (~2KB, no transitive
deps) — there is deliberately no animation library, because the site's own pitch
is bundle size:

- `PerformanceCase` + `PerformanceSection` — the LMS performance pass. Sourced
  from the internal Confluence page "[FE] Cam nang Performance & Toi uu cho LMS
  (Next.js 14 App Router)", which is the source of truth for every number in
  this section, with one known correction: the page attributes the weakest
  student route to `/`, but `/` only redirects, and the measurements were taken
  on `/courses`. So `/courses` went 15.2s -> 6.1s with Lighthouse Performance
  29 -> 65; the student route group went 49 -> 67 across 8 routes and the
  teacher group 72 -> 89 across 7. Lab numbers are desktop, cold cache, against
  `next build && next start`; field Core Web Vitals are P75 desktop on UAT,
  taken before the pass. Do not add a number here that is in neither source.
- `PipelineTerminal` — replays the Gitleaks / Trivy / Semgrep / ZAP gate.
  Results stay qualitative and the caption states it is not a live scan.
- `WorkspaceExplorer` (Projects) — a workspace-style tree over every project,
  built on the ARIA tablist pattern with roving tabindex and arrow-key
  navigation. Folder names mirror the real SAPP monorepo, which is called
  `lms-fe`: `apps/` (`lms-pro`, `lms-test`, `lms-finhub`), `libs/` (`ui`,
  `editor`, `styles`), `features/`, with Turborepo running the task graph.
  `lms-fe` is the repo, NOT an app. Every panel's copy stays in the DOM
  (`hidden`) so it remains crawlable; only the selected panel mounts its
  `<Image>`.

- `WebVitalsMonitor` (in the Footer) — live LCP/FCP/TTFB/INP/CLS for the page
  the visitor is on, measured with `web-vitals` and rendered locally; nothing is
  sent anywhere. It mirrors the five metrics the Performance section quotes as
  lab data, so the two strips read as a pair. Unmeasured metrics show `—`, never
  a placeholder number, and both states occupy one line so filling in cannot
  cause the layout shift the widget is reporting on. Measure it against
  `next build && next start`: the dev server reports a wildly inflated FCP.

All of it respects `prefers-reduced-motion`.

### Claims discipline

The portfolio states engineering claims a reviewer can probe, so anything on the
page must be traceable to the Confluence audit, a published Writing post, or the
CV. Notably NOT true as of the last update, so do not write it: server-side data
fetching (roadmap P2 — `lms-pro` is still ~270 `'use client'` files) and the
`revalidate = 0` removal (measured, then deliberately left unshipped — see the
callout in `PerformanceSection`). The Tiptap package has replaced TinyMCE across
the whole monorepo, so the audit page's TinyMCE entries are stale — it was last
edited before that landed.

## Content: Writing (Notion)

The Writing section and `/writing/[slug]` pages are driven by a Notion database
via the official API, rendered to Markdown (`notion-to-md`) and displayed with
`react-markdown` + `remark-gfm`. Content refreshes via ISR (`revalidate = 3600`),
so new published posts appear within an hour — no redeploy needed.

- Config: `NOTION_TOKEN` + `NOTION_WRITING_DB_ID` (see `.env.example`). Secrets
  go in `.env.local` locally and Vercel env vars in production — never in the
  committed `.env`.
- Graceful fallback: with no env configured, `src/lib/notion.ts` returns empty
  and `WritingSection` renders a hardcoded entry, so the build never breaks.
- Notion image URLs are signed and expire (~1h); embedded images may 404 near
  the revalidation boundary. Text/tables/code are unaffected.
