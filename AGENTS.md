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
  components/       # React components (Header, About, Performance, Experience, Projects, Writing, Footer)
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

## Interactive sections

Two sections carry custom interaction instead of the stock list layout. Both are
deliberately dependency-free — no animation library — because the site's own
pitch is bundle size:

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
