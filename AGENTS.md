# Lê Ngọc Hà — Personal Portfolio

A single-page developer portfolio built with Astro. (Originally a Next.js site
scaffolded from a website-clone template; ported to Astro with a brutalist
redesign, because the previous layout was a near-copy of `bchiang7/v4` — 8.3k
stars and 4.2k forks, so a reviewer had almost certainly seen it before.)

## Heads-up: Astro 6

This project runs Astro 6 with Tailwind CSS v4. Both are newer than most
training data. When unsure about an API or convention, check the installed
types and docs under `node_modules/astro/` before writing code — that is how
the `Font` component (exported from `astro:assets`, **not** `astro:components`)
and the ISR config shape were pinned down.

Node **>= 22.12.0** is required by Astro 6; `.nvmrc` pins it.

## Zero framework JavaScript

The site's own argument is bundle size, so it ships none. There is no React, no
animation library, and no client framework of any kind: every interactive block
is plain DOM work inside an Astro `<script>`. The only runtime dependency that
reaches the browser is `web-vitals` (~9KB), for the live strip in the footer.

Measured on a production build: **1 external JS file, 9.4KB total**, 14
requests, LCP 320ms, CLS 0.00, Lighthouse a11y/best-practices/SEO 100.

Do not reach for a UI framework or an animation library here. If a block needs
interactivity, write the script. A React island would put ~45KB of runtime on a
page that spends three sections arguing about exactly that.

## Tech Stack

- **Framework:** Astro 6 (`output: "static"`, per-route `prerender = false`)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`, oklch design tokens
- **Content:** Notion API → Markdown → HTML (`marked`, server-side)
- **Fonts:** Astro fonts API (IBM Plex Mono + Geist, self-hosted at build)
- **Deployment:** Vercel (`@astrojs/vercel`, ISR)

### The Vite override is load-bearing

`package.json` pins `overrides.vite`. Astro 6 wants Vite ^7 but
`@tailwindcss/vite` resolves Vite 8 at the root, giving two copies; the Tailwind
plugin then hands Vite 8 rolldown options to Astro's Vite 7 instance and the CSS
build dies with `Missing field tsconfigPaths`. Do not remove the override
without checking `npm ls vite` shows a single version.

## Commands

- `npm run dev` — Dev server (port 4321)
- `npm run build` — Production build
- `npm run typecheck` — `astro check` (TypeScript + `.astro` templates)
- `npm run check` — typecheck + build

There is no ESLint any more; `astro check` replaced it.

### Measuring anything

The dev server misreports paint timings, so never quote a number from it. The
Vercel adapter has no preview server, so build against the Node adapter:

```bash
LOCAL_PROD=1 npm run build
HOST=127.0.0.1 PORT=4321 node ./dist/server/entry.mjs
```

Note the Node adapter does not compress responses, so CSS/HTML transfer sizes
read far larger locally than in production. Vercel compresses both.

## Rendering model

Static by default. Two routes opt out with `prerender = false` because their
content comes from Notion — `/` (the Writing list) and `/writing/[slug]` — plus
`sitemap.xml`, which lists the posts. Vercel ISR caches them for an hour
(`isr.expiration: 3600`), which is the contract the Next build had via
`revalidate = 3600`, so a newly published post still appears without a redeploy.

`Astro.rewrite("/404")` does **not** work from those routes: the 404 page is
prerendered, so there is no server component to rewrite into and the attempt
throws a 500. `/writing/[slug]` instead renders the shared `NotFound.astro` and
sets `Astro.response.status = 404`.

## Code Style

- TypeScript strict, no `any`
- `.astro` components, PascalCase filenames, camelCase utils
- Tailwind utility classes; the only inline `style` is the hard offset shadow
- 2-space indentation, mobile-first

## Project Structure

```
src/
  pages/          # index, writing/[slug], 404, robots.txt.ts, sitemap.xml.ts
  layouts/        # Layout.astro — head, fonts, JSON-LD, skip link
  components/     # Header, SectionHeading, sections, interactive blocks
  lib/notion.ts   # Notion "Writing" data layer
  lib/markdown.ts # Notion Markdown -> HTML
  styles/         # global.css — design tokens and component classes
  assets/         # Project screenshots, optimized by astro:assets
  consts.ts       # Identity, socials, section list, Person JSON-LD
public/
  seo/            # favicon.svg, apple-touch-icon.png, og.png, webmanifest
  resume.pdf      # Downloadable CV
```

## Design system: brutalist

Tokens live in `@theme` in `src/styles/global.css`.

- Paper-white ground, black ink, hard 2px rules, **zero border radius**
  (enforced globally), offset shadows instead of blur, mono for anything
  structural.
- `--color-acid` (#27FF0B) is a **surface** colour, never a text colour. On
  white it is about 1.4:1. It fills blocks that carry black text.
- Data colours (`--color-pass` / `--color-fail` / `--color-warn`) are darker
  than the usual teal/rose so they clear 4.5:1. Check contrast against
  `--color-hush`, not just `--color-paper` — `--color-ink-3` passed on paper
  and failed on hush, which is what Lighthouse caught.
- Two font weights per family (400/700) and nothing else. Adding a weight adds
  font files; three weights per family fetched 12 faces instead of 8.
- `.label` uppercases. Never put a filesystem path, a route, or a unit like
  `15.2s` in it without `normal-case` — that shipped as `/COURSES` and `15.2S`.
- Only preload the faces that paint above the fold (bold mono, regular sans).
  Preloading every declared face pulled 24 files and ~250KB ahead of first
  paint and pushed FCP past four seconds.

## Two audiences per section

The page is read by engineers who will probe the claims and by recruiters and
hiring managers who will not. Every section therefore carries a visible title
and a plain-language lead before any depth, via `SectionHeading`:

- Each section renders exactly one `SectionHeading` with a two-digit index, and
  points its `aria-labelledby` at the `${id}-title` heading — no `aria-label`,
  no second copy of the section name.
- Section headings are visible at every breakpoint. An earlier version hid them
  with `lg:sr-only`, which left the desktop content column with no titles at
  all — do not reintroduce that.
- Jargon gets a plain-English gloss next to it rather than being removed: metric
  acronyms carry a `plain` label (`FIELD_METRICS` in `PerformanceSection` and
  `METRICS` in `WebVitals` must keep the same wording, since the two strips are
  read as a pair), the Lighthouse donuts explain the 0–100 banding, and the
  unshipped-fix callout opens with an "In plain terms" line before the detail.
  Glosses have a reserved two-line height (`min-h-8`) so the values below them
  stay aligned across the row.

### Accessible names must contain the visible text

WCAG 2.5.3. Two links failed this after the port because their `aria-label`
rephrased the link ("Frontend Tech Lead **at** SAPP Academy" over visible
"Frontend Tech Lead **·** SAPP Academy"; "Email Lê Ngọc Hà…" over visible
"Let's talk"). Build the label from the visible string, don't rewrite it.

## Interactive sections

Four blocks carry custom interaction instead of the stock list layout. All of
them respect `prefers-reduced-motion`.

- `PerformanceCase` + `PerformanceSection` — the LMS performance pass. Sourced
  from the internal Confluence page "[FE] Cam nang Performance & Toi uu cho LMS
  (Next.js 14 App Router)", which is the source of truth for every number in
  this section, with one known correction: the page attributes the weakest
  student route to `/`, but `/` only redirects, and the measurements were taken
  on `/courses`. So `/courses` went 15.2s -> 6.1s with Lighthouse Performance
  29 -> 65; the student route group went 49 -> 67 across 8 routes and the
  teacher group 72 -> 89 across 7. Lab numbers are desktop, cold cache, against
  `next build && next start` (that is the LMS's own build, not this site's);
  field Core Web Vitals are P75 desktop on UAT, taken before the pass. Do not
  add a number here that is in neither source.
- `PipelineTerminal` — replays the Gitleaks / Trivy / Semgrep / ZAP gate.
  Results stay qualitative and the caption states it is not a live scan. The
  replay only starts once the block scrolls into view.
- `WorkspaceExplorer` (Projects) — a workspace-style tree over every project,
  built on the ARIA tablist pattern with roving tabindex and arrow-key
  navigation. Folder names mirror the real SAPP monorepo, which is called
  `lms-fe`: `apps/` (`lms-pro`, `lms-test`, `lms-finhub`), `libs/` (`ui`,
  `editor`, `styles`), `features/`, with Turborepo running the task graph.
  `lms-fe` is the repo, NOT an app. Every panel's copy stays in the DOM
  (`hidden`) so it remains crawlable; images are `loading="lazy"`, so a hidden
  panel does not fetch its screenshot — verified as 1 of 6 requests on first
  paint.
- `WebVitals` (in the Footer) — live LCP/FCP/TTFB/INP/CLS for the page the
  visitor is on, measured with `web-vitals` and rendered locally; nothing is
  sent anywhere. It mirrors the five metrics the Performance section quotes as
  lab data, so the two strips read as a pair. Unmeasured metrics show `—`, never
  a placeholder number, and every state occupies the same number of lines so
  filling in cannot cause the layout shift the widget is reporting on. Headless
  Chromium sometimes records no paint entries at all, in which case `—` is
  correct and not a bug.

### Claims discipline

The portfolio states engineering claims a reviewer can probe, so anything on the
page must be traceable to the Confluence audit, a published Writing post, or the
CV. Notably NOT true as of the last update, so do not write it: server-side data
fetching in the LMS (roadmap P2 — `lms-pro` is still ~270 `'use client'` files)
and the `revalidate = 0` removal (measured, then deliberately left unshipped —
see the callout in `PerformanceSection`). The Tiptap package has replaced
TinyMCE across the whole monorepo, so the audit page's TinyMCE entries are stale
— it was last edited before that landed.

The `portfolio` node in `WorkspaceExplorer` describes **this** site, so it has
to track this repo: it currently claims Astro, zero framework JavaScript, and
Notion-to-HTML with a hardcoded fallback. Keep it honest if the stack moves.

## Content: Writing (Notion)

The Writing section and `/writing/[slug]` pages are driven by a Notion database
via the official API, rendered to Markdown (`notion-to-md`) and then to HTML
with `marked` on the server. Content refreshes via ISR, so new published posts
appear within an hour — no redeploy needed.

- Config: `NOTION_TOKEN` + `NOTION_WRITING_DB_ID` (see `.env.example`). Secrets
  go in `.env.local` locally and Vercel env vars in production — never in the
  committed `.env`.
- `SITE_URL` is read through `process.env` in `src/consts.ts`, which
  `astro.config.mjs` imports, so it must be a real environment variable. A value
  in `.env.local` is not picked up at config time and the build falls back to
  the default URL.
- Graceful fallback: with no env configured, `src/lib/notion.ts` returns empty
  and `WritingSection` renders a hardcoded entry, so the build never breaks.
- `src/lib/markdown.ts` escapes raw HTML rather than passing it through, keeping
  the posture react-markdown had before the port, and opens absolute links in a
  new tab.
- Notion image URLs are signed and expire (~1h); embedded images may 404 near
  the revalidation boundary. Text/tables/code are unaffected.
