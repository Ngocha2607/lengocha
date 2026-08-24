# Lê Ngọc Hà — Personal Portfolio

A single-page developer portfolio built with Astro, styled after
[heshify/monolume](https://github.com/heshify/monolume) (MIT) — mono display
type, a near-white ground, an acid-green accent used as a surface, dashed
hairline outlines, pill buttons and rounded cards.

Why that template: the original site was a near-copy of `bchiang7/v4` (8.3k
stars, 4.2k forks), so a reviewer had almost certainly seen it before. Monolume
has 26 stars, which is the point.

**Match the template's visual language.** It has rounded corners, dashed
outlines and enormous uppercase headings. An earlier pass ported the *palette*
but kept a generic stack-of-sections structure with `border-radius: 0` forced
globally — that read as neither the template nor anything else. Do not
reintroduce a global radius reset, hard offset shadows, or solid 2px borders.

## Heads-up: Astro 6

This project runs Astro 6 with Tailwind CSS v4. Both are newer than most
training data. When unsure about an API, check the installed types under
`node_modules/astro/` before writing code — that is how the `Font` component
(exported from `astro:assets`, **not** `astro:components`) and the ISR config
shape were pinned down.

Node **>= 22.12.0** is required by Astro 6; `.nvmrc` pins it.

## Zero framework JavaScript

The site's own argument is bundle size, so it ships none. There is no React, no
animation library, and no client framework of any kind. The only runtime
dependency that reaches the browser is `web-vitals` (~9KB), for the live strip
above the footer. Everything else is plain DOM work in an Astro `<script>` or
pure CSS:

- the marquee bands — CSS keyframes
- the performance slider, the pipeline replay, the decision filter, the mobile
  menu, the cursor circle, the contact form — hand-written vanilla
- the decision log's expansion — native `<details>`

Measured on a production build: **1 external JS file at 9.4KB**, 14 requests,
LCP 205ms, CLS 0.00, Lighthouse a11y/best-practices/SEO/agentic 100 with 0
failed audits, desktop and mobile.

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

### Custom classes must be `@utility`, not `@layer components`

Tailwind v4 only lets `@apply` reach real utilities. `.section-title { @apply
heading … }` fails the build with "Cannot apply unknown utility class" when
`heading` is a plain component class. Every custom class in `global.css` is
declared with `@utility` so they compose.

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

The Node adapter does not compress responses, so HTML and CSS transfer sizes
read far larger locally than in production — compress by hand before quoting a
number. Vercel serves brotli.

## Rendering model

Static by default. Two routes opt out with `prerender = false` because their
content comes from Notion — `/` (the Posts list) and `/writing/[slug]` — plus
`sitemap.xml`. Vercel ISR caches them for an hour (`isr.expiration: 3600`), so a
newly published post appears without a redeploy.

`Astro.rewrite("/404")` does **not** work from those routes: the 404 page is
prerendered, so there is no server component to rewrite into and the attempt
throws a 500. `/writing/[slug]` instead renders the shared `NotFound.astro` and
sets `Astro.response.status = 404`.

## Page structure

The template's own sections carry Hà's material; five sections have no
counterpart in it and were built in the same language.

```
Header          fixed, "L." mark + anchor nav + hamburger      (template)
Hero            giant wordmark, standfirst, two pill buttons   (template)
About me        numbers panel + prose + skill pills            (template)
Career          roles, dashed rows                             NEW
Work            marquee + project cards with screenshots       (template)
Decisions       the decision log                               NEW
Performance     the LMS audit, slider, pipeline replay         NEW
How I lead      six practices + mentoring + artifacts          NEW
Posts           marquee + Notion-backed writing                (template)
Get in touch    pitch, socials, mail-composing form            (template)
Live vitals     Core Web Vitals for the page you are on        NEW
Footer          acid block, wordmark, four link columns        (template)
```

`NAV` and `SOCIALS` in `src/consts.ts` drive the header, the mobile sheet and
the footer, so a section's anchor is defined in one place.

### Things the template does that must be kept

- **Marquee containment.** The word runs are far wider than the viewport
  (~1550px at 390px wide) and are held by `overflow-hidden` on the wrapper. Any
  full-bleed trick here puts a horizontal scrollbar on the whole document,
  which is exactly what an earlier build shipped.
- **The cursor circle** on Work cards attaches only where `(pointer: fine)`
  matches and `prefers-reduced-motion` does not — a touch device has no cursor
  to trail.
- **Text on the acid fill is always black.** The accent is a surface colour;
  #27FF0B behind white type is about 1.4:1.

### The contact form has no backend

The site is static plus ISR and there is no form service. Submitting composes a
draft in the visitor's own mail client via `mailto:`, and the form says so.
The address is printed next to it, so the form is a convenience rather than the
only route. `encodeURIComponent` is not optional — an ampersand or newline in
the message would truncate the URL.

## Code Style

- TypeScript strict, no `any`
- `.astro` components, PascalCase filenames, camelCase utils
- Tailwind utility classes; custom classes declared with `@utility`
- 2-space indentation, mobile-first

### Vietnamese needs looser leading at display sizes

`LÊ NGỌC HÀ` stacks diacritics above the cap height, so the hero and the footer
wordmark both set `leading-[1.06]`–`leading-[1.08]`. At the template's default
the Ê and the Ọ collide with the line above. Both font families were checked for
the `vietnamese` subset before being chosen.

### Accessible names must contain the visible text

WCAG 2.5.3, and this has now been broken three different ways:

1. An `aria-label` that rephrased a link ("Frontend Tech Lead **at** SAPP" over
   visible "Frontend Tech Lead **·** SAPP").
2. An `aria-label` that replaced it ("Email Lê Ngọc Hà…" over "Let's talk").
3. An `aria-label` on a **card link** holding only the title, while the visible
   text inside the anchor was the title, period, description, tags and a cue
   line.

For a card-sized link, do not set `aria-label` at all — the content is the
name. Append new-tab warnings as `sr-only` text inside the anchor instead.

### `<dl>` has a content model, and Lighthouse checks it

A `<div>` inside a `<dl>` must contain its `<dt>` first and its `<dd>` after,
and a `<dt>` may not contain heading content. Getting this wrong cost 6 points
of accessibility and broke the agentic-browsing tree. Where a group needs a real
heading, it is a list, not a description list.

## Project Structure

```
src/
  pages/          # index, writing/[slug], 404, robots.txt.ts, sitemap.xml.ts
  layouts/        # Layout.astro — head, fonts, JSON-LD, skip link
  components/
    Header.astro          # fixed nav + hamburger
    Hero.astro
    AboutSection.astro
    CareerSection.astro           NEW
    Marquee.astro                 # the scrolling word band
    ProjectCard.astro             # Work row + cursor circle
    WorkSection.astro
    DecisionsSection.astro        NEW
    PerformanceSection.astro + PerformanceCase + PipelineTerminal   NEW
    LeadingSection.astro          NEW
    PostsSection.astro
    ContactSection.astro
    WebVitals.astro               NEW
    Footer.astro
    NotFound.astro
  lib/notion.ts   # Notion "Writing" data layer
  lib/markdown.ts # Notion Markdown -> HTML
  styles/         # global.css — tokens and @utility classes
  assets/         # Project screenshots, optimized by astro:assets
  consts.ts       # Identity, socials, NAV, Person JSON-LD
public/
  seo/            # favicon.svg, apple-touch-icon.png, og.png, webmanifest
  resume.pdf      # Downloadable CV
```

## Design system

Tokens live in `@theme` in `src/styles/global.css`, using the template's names:
`background`, `foreground`, `secondary`, `primary`.

- `--color-primary` (#27FF0B) is a **surface** colour, never a text colour.
- Data colours (`--color-pass` / `--color-fail` / `--color-warn`) are darker
  than the usual teal/rose so they clear 4.5:1 — they are the only place on the
  page where colour carries meaning.
- Two font weights per family (400/700) and nothing else. Three weights per
  family fetched 12 faces instead of 9.
- Only preload the faces that paint above the fold. Preloading every declared
  face pulled 24 files and ~250KB ahead of first paint and pushed FCP past four
  seconds.
- `.label` uppercases. Never put a filesystem path, a route, or a unit like
  `15.2s` in it without `normal-case` — that shipped as `/COURSES` and `15.2S`.

## Two audiences per section

The page is read by engineers who will probe the claims and by recruiters and
hiring managers who will not. Every section opens with a plain-language
standfirst under its heading, before any depth.

- Anything collapsed must still say something collapsed. Every decision log
  entry carries an `upshot` line that survives without opening it.
- Jargon gets a plain-English gloss rather than being removed: metric acronyms
  carry a `plain` label (`FIELD_METRICS` in `PerformanceSection` and `METRICS`
  in `WebVitals` must keep the same wording, since the two strips are read as a
  pair), the Lighthouse donuts explain the 0–100 banding, and the unshipped-fix
  callout opens with an "In plain terms" line. Glosses have a reserved two-line
  height (`min-h-8`) so values stay aligned across the row.
- Skills are indexed by **first-used year, never a self-scored bar** — a year
  is derivable from the Career section, so a reviewer can line the two up.
- The page must not say the same thing three times. About used to repeat
  Career, and Career used to repeat the decisions; both were trimmed.

## Interactive pieces

- `DecisionsSection` — native `<details>` for expansion, so all seven entries
  stay in the DOM, crawlable and keyboard-operable; the only script is the
  outcome filter, which also collapses what it hides. **Two of seven are a "no"
  (one `held`, one `reverted`) and they stay:** a log with no rejections is a
  brag sheet. The chosen option is marked and the rejected ones struck through.
- `PerformanceCase` + `PerformanceSection` — the LMS pass. Sourced from the
  internal Confluence page "[FE] Cam nang Performance & Toi uu cho LMS (Next.js
  14 App Router)", the source of truth for every number, with one known
  correction: the page attributes the weakest student route to `/`, but `/` only
  redirects and the measurements were taken on `/courses`. So `/courses` went
  15.2s -> 6.1s with Lighthouse Performance 29 -> 65; the student route group
  went 49 -> 67 across 8 routes and the teacher group 72 -> 89 across 7. Lab
  numbers are desktop, cold cache, against `next build && next start` (the LMS's
  own build, not this site's); field Core Web Vitals are P75 desktop on UAT,
  taken before the pass. Do not add a number that is in neither source.
- `PipelineTerminal` — replays the Gitleaks / Trivy / Semgrep / ZAP gate.
  Results stay qualitative and the caption states it is not a live scan. The
  replay only starts once the block scrolls into view.
- `WebVitals` — live LCP/FCP/TTFB/INP/CLS for the page the visitor is on,
  rendered locally; nothing is sent anywhere. Unmeasured metrics show `—`, never
  a placeholder number, and every state occupies the same number of lines so
  filling in cannot cause the layout shift the widget reports on. Headless
  Chromium sometimes records no paint entries at all, in which case `—` is
  correct and not a bug.
- `ProjectCard` images are `loading="lazy"` with `widths={[480, 800]}`. Vercel
  only serves widths declared in `imagesConfig.sizes` and silently snaps
  anything else, so that list must stay in step with what the layout requests.

## Claims discipline

Everything on the page must be traceable to the Confluence audit, a published
Writing post, or the CV. This matters most in the decision log, which states
alternatives, costs and reversals — exactly what a reviewer will probe.

Notably NOT true as of the last update, so do not write it: server-side data
fetching in the LMS (roadmap P2 — `lms-pro` is still ~270 `'use client'` files)
and the `revalidate = 0` removal (measured, then deliberately left unshipped —
decision 02 in the log). The Tiptap package has replaced TinyMCE across the
whole monorepo, so the audit page's TinyMCE entries are stale.

Two places assert something not derivable from a source, both marked in their
component comments so the site's owner can check rather than inherit them:

- `ContactSection` — the three situations framing "where I'm most useful".
- `LeadingSection` — the six practices are framed from the CV, but the wording
  is editorial.

The "This site" card in `WorkSection` and the "This site" column in the footer
both describe **this** repo: they currently claim Astro, zero framework
JavaScript, and Notion-to-HTML hourly. Keep them honest if the stack moves.

## Content: Writing (Notion)

The Posts section and `/writing/[slug]` pages are driven by a Notion database
via the official API, rendered to Markdown (`notion-to-md`) and then to HTML
with `marked` on the server.

- Config: `NOTION_TOKEN` + `NOTION_WRITING_DB_ID` (see `.env.example`). Secrets
  go in `.env.local` locally and Vercel env vars in production — never in the
  committed `.env`.
- `SITE_URL` is read through `process.env` in `src/consts.ts`, which
  `astro.config.mjs` imports, so it must be a real environment variable. A value
  in `.env.local` is not picked up at config time and the build falls back to
  the default URL.
- Graceful fallback: with no env configured, `src/lib/notion.ts` returns empty
  and `PostsSection` renders a hardcoded entry, so the build never breaks.
- `src/lib/markdown.ts` escapes raw HTML rather than passing it through, keeping
  the posture react-markdown had before the port, and opens absolute links in a
  new tab.
- Notion image URLs are signed and expire (~1h); embedded images may 404 near
  the revalidation boundary. Text/tables/code are unaffected.
