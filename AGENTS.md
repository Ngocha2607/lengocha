# Lê Ngọc Hà — Personal Portfolio

A single-page developer portfolio built with Astro, re-skinned after the
**Nichol** portfolio template — a violet accent, a warm yellow second accent, a
near-white ground, rounded cards with hairline borders and a soft shadow, a
dark header bar that stays dark in both themes, and sentence-case headings at a
readable size.

### Lineage, so nobody re-litigates it

Three passes, each with a reason:

1. A near-copy of `bchiang7/v4` (8.3k stars) — a reviewer had almost certainly
   seen it before.
2. A port of [heshify/monolume](https://github.com/heshify/monolume) (MIT) —
   mono display type, acid green, dashed hairlines, enormous uppercase
   headings. Distinctive, and obscure enough not to be recognised.
3. The current Nichol re-skin, chosen by the site's owner for warmth and
   legibility.

**Nichol is a commercial marketplace theme, so the recognisability problem that
drove pass 1 → 2 is back.** That was raised and the owner decided anyway. Do not
"fix" it by reverting; if it ever matters, the answer is to diverge further from
Nichol, not to go back to monolume.

**What was deliberately not taken from Nichol**, because it will look like an
oversight otherwise:

- Its stack. Nichol is a client-rendered Vue SPA: 738 bytes of HTML, an empty
  `<div id="app">`, 149KB of JS, 3.2MB over 39 requests. Every performance
  claim on this page would become false.
- Its Skills section — self-scored percentage bars, every skill at 90% — and
  its award badges. See "Two audiences per section" for what this page does
  instead.
- Services, Testimonials and the client/project counters. Freelance-designer
  furniture; there is no honest data here to fill them with.
- Its alternating two-sided Education & Experience timeline: 1955px for six
  entries, ambiguous reading order, right-ragged text in the left column. The
  rail-plus-cards pattern in `CareerSection` is better and stays.
- Its font. See "Sora cannot be used here" below.

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

- the performance slider, the pipeline replay, the decision filter, the mobile
  menu, the cursor circle, the contact form, the theme toggle — hand-written
  vanilla
- the decision log's expansion — native `<details>`
- the theme's no-flash boot — a blocking `is:inline` script in `<head>`, which
  Astro does not bundle, so it costs no request

Measured on a production build after the Nichol re-skin: **1 external JS file
at 9,648 bytes**, LCP 214ms, CLS 0.00, Lighthouse a11y/best-practices/SEO/
agentic 100 with 0 failed audits, desktop and mobile, and 0 contrast failures
across every text-bearing element in both themes.

## Tech Stack

- **Framework:** Astro 6 (`output: "static"`, per-route `prerender = false`)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`, oklch design tokens
- **Content:** Notion API → Markdown → HTML (`marked`, server-side)
- **Fonts:** Astro fonts API (Plus Jakarta Sans + IBM Plex Mono, self-hosted)
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

Restart the server after every rebuild. `node entry.mjs` holds the old modules
in memory, so a rebuilt `dist/` is not picked up and you will screenshot the
previous version and think a change did nothing.

**Check both themes, and check them by reloading rather than by flipping.**
Setting `data-theme` from the console triggers the stalled-transition bug
described in the design system, so a live flip measures colours that a real
visitor would never see. Set `localStorage.theme` and reload instead.

The contrast sweep that has to stay green: walk every element that renders its
own text, resolve its colour and nearest opaque background through a canvas
(computed values come back as `oklch()`, which needs converting), and assert
4.5:1, or 3:1 where the text is >=24px or >=18.66px bold. The last run was
**0 failures in both themes**.

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

Every section but the hero and the footer opens with the same header: a
`SectionHeading` carrying a kicker pill, a centred title and a plain-language
lead.

```
Header          dark bar, "L." mark, anchor nav, theme toggle
Hero            wordmark + pitch left, portrait on a gradient right
About me        numbers panel + prose + skill pills
Career          milestone rail + detail cards
Work            project cards with screenshots
Performance     the LMS audit, slider, pipeline replay
Decisions       the decision log
How I lead      six practices + mentoring + artifacts
Posts           Notion-backed writing
Get in touch    pitch, socials, mail-composing form
Live vitals     Core Web Vitals for the page you are on
Footer          dark, CTA banner + four link columns
```

The order is a narrative: who I am, the trajectory, then the evidence.

**Career sits third, not late.** It used to sit after How I lead, which put
about 78% of the page's copy — including the 8.5k-character decision log — in
front of the one section a recruiter opens the page looking for, and its rail is
built to be scanned in three seconds. Moving it up costs an engineer very little
because the rail is compact. Do not push it back down without a reason that
beats that.

What the order must keep: Performance directly after the Work card that makes
its claims, and both above Decisions, because two decision entries link up at
`#performance` and `#work`. The evidence run — Work, Performance, Decisions,
How I lead — stays contiguous rather than alternating with reference material.

`NAV` and `SOCIALS` in `src/consts.ts` drive the header, the mobile sheet and
the footer, so a section's anchor is defined in one place. **`NAV` must list
every section**, in page order: `#leading` was missing for a while, so How I
lead was on the page but unreachable from any of the three. At eight items the
inline nav no longer fits at `md`, so `Header` switches to it at `lg` and the
mobile sheet covers 768–1023px.

### Rules that survived the re-skin

- **Text on the accent fill is always black.** The rule outlived the colour it
  was written for: acid green behind white type was about 1.4:1, and yellow is
  1.59:1. Black on `--color-accent` measures 13.17:1.
- **The cursor circle** on Work cards attaches only where `(pointer: fine)`
  matches and `prefers-reduced-motion` does not — a touch device has no cursor
  to trail. Its arrow is `currentColor` on the violet fill, so it needs
  `text-white`.
- **The marquee is gone.** The scrolling word band was the most
  monolume-specific element on the page and fought Nichol's calmer rhythm.
  Work and Posts now use `SectionHeading` like every other section, which also
  gives them a real `<h2>` instead of an `sr-only` one inside the band. If a
  full-bleed element ever comes back, remember why that one needed
  `overflow-hidden`: its runs were ~1550px wide at a 390px viewport, and an
  earlier build shipped a horizontal scrollbar on the whole document.

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
  layouts/        # Layout.astro — head, fonts, JSON-LD, skip link, theme boot
  components/
    Header.astro          # dark bar, nav, hamburger, theme toggle
    SectionHeading.astro  # kicker pill + centred title + lead slot
    icons.ts              # inline SVG bodies, 24x24 grid
    Hero.astro            # split hero, portrait on a gradient block
    AboutSection.astro
    CareerSection.astro   # milestone rail + detail timeline
    ProjectCard.astro     # Work row + cursor circle
    WorkSection.astro
    DecisionsSection.astro
    PerformanceSection.astro + PerformanceCase + PipelineTerminal
    LeadingSection.astro
    PostsSection.astro
    ContactSection.astro
    WebVitals.astro
    Footer.astro
    NotFound.astro
  lib/notion.ts   # Notion "Writing" data layer
  lib/markdown.ts # Notion Markdown -> HTML
  styles/         # global.css — tokens, dark palette, @utility classes
  assets/         # le-ngoc-ha.jpg + project screenshots, via astro:assets
  consts.ts       # Identity, socials, NAV, Person JSON-LD
public/
  seo/            # favicon.svg, apple-touch-icon.png, og.png, webmanifest
  Le-Ngoc-Ha-Senior-Frontend-Developer.pdf
```

## Design system

Tokens live in `@theme` in `src/styles/global.css`. **Every colour was solved
against a contrast target, not picked by eye** — the helper is a few lines of
sRGB → luminance maths, and there is a full-page sweep in the verification
steps below. Do not nudge one without re-running it.

| Token | Light | Dark | Contract |
|---|---|---|---|
| `primary` | `#964BF1` | same | Surface. White on it = **4.60:1**. |
| `primary-ink` | `#8637DE` | `#AD66FF` | The violet *as text*. **5.50:1** on the ground. |
| `accent` | `#FFC41F` | same | Surface, **black text only** (13.17:1; white is 1.59:1). |
| `background` | `#F8F9FA` | `#0B1020` | The page. |
| `surface` | `#FFFFFF` | `#151B2E` | Cards, sitting above the ground. |
| `foreground` | `#0D1220` | `#EEF2F8` | Body ink. |
| `secondary` | `#565F78` | `#9BA7C0` | Muted ink, **6.03:1 / 7.83:1**. |
| `border` | `#D6DBE5` | `#242C42` | Hairlines. |
| `header`, `header-ink`, `header-muted` | fixed | fixed | The bar. See below. |

Why violet needs two tokens: `#994FF5` straight off Nichol is 4.38:1 under
white and 4.16:1 as text on the ground — it fails AA in **both** directions. The
darkened `primary` fixes the first, `primary-ink` the second.

### Dark mode is a token swap, not a variant

Tailwind v4 compiles utilities to `var(--color-*)` and declares the tokens at
`:root`, so overriding those variables under a more specific selector re-themes
the whole page. **There is not one `dark:` class in the markup**, and new
markup should not add any — use the tokens.

The palette is declared twice: a `prefers-color-scheme` block guarded with
`:not([data-theme="light"])`, and a `:root[data-theme="dark"]` block. The first
serves someone who has never touched the toggle (including with JavaScript off,
where no attribute is ever written); the second serves an explicit choice and
must beat the system preference in both directions.

Three traps, all of them paid for once already:

1. **Do not put a re-themable value in `@theme`.** A `--shadow-*` theme key
   makes Tailwind resolve `shadow-panel` to a literal at build time, and a
   literal cannot be overridden. `--shadow-panel` is therefore a plain custom
   property on `:root`.
2. **Never let a theme flip run through a transition.** An element carrying
   `transition` whose colour changes while it is *outside the viewport* stalls
   at its start value and never resolves — scrolling to it later does not
   repaint it. Toggling to dark at the top of the page left every `.link` and
   `.btn` below the fold permanently in the light palette. The toggle sets
   `data-theme-switching` on `<html>`, which kills all transitions, and clears
   it on the next frame *and* on a 120ms timeout, because rAF is throttled in a
   background tab.
3. **The header and the footer stay dark in both themes**, so they run on
   `--color-header*`, which do not appear in the dark blocks. Anything using
   `foreground`/`background` there would invert. `.link` is banned in the footer
   for the same reason: it hovers to `primary-ink`, the *dark* violet in light
   mode, which is about 2:1 on that bar.

### Type

- **Plus Jakarta Sans** for everything, **IBM Plex Mono** for data only —
  `.label`, tabular figures, the pipeline replay, the vitals strip. The re-skin
  took mono off the headings.
- **Sora cannot be used here**, even though Nichol uses it everywhere. Its
  `latin-ext` covers `U+1E00-1E9F` and `U+1EF2-1EFF` and skips `U+1EA0-1EF1`
  entirely, and it ships no `vietnamese` subset — so the `Ọ` (U+1ECC) in
  `LÊ NGỌC HÀ` falls back to another family in the middle of the largest word on
  the page. Verified alternatives that do ship the subset: Plus Jakarta Sans,
  Be Vietnam Pro, Manrope, Space Grotesk.
- Two font weights per family (400/700) and nothing else. Three weights per
  family fetched 12 faces instead of 9.
- Only preload the faces that paint above the fold. Preloading every declared
  face pulled 24 files and ~250KB ahead of first paint and pushed FCP past four
  seconds.
- `.label` uppercases. Never put a filesystem path, a route, or a unit like
  `15.2s` in it without `normal-case` — that shipped as `/COURSES` and `15.2S`.

### Icons

- Section icons are **inline SVG stroke paths on a 24x24 grid**, in
  `components/icons.ts`, drawn by `SectionHeading.astro` inside the kicker
  pill. Never ship them as raster files: the portfolio that pattern came from
  serves 9 icons for 4.8MB, one of them a 1295x1214 PNG rendered at 34px, on a
  page that makes no claims about weight. All eight here cost under 2KB of HTML
  and zero requests.
- They are decoration — `aria-hidden`, `focusable="false"` — and the section
  keeps its heading as its accessible name. `UI_ICONS` is kept separate because
  those are picked by code, not by an author.

### Custom class names

`panel`, `pill`, `label`, `heading`, `link`, `btn-*` kept their names through
the re-skin even though every one of them changed visually — `panel` is still a
panel whether its outline is dashed or hairline, and renaming would have meant
touching ~180 call sites for nothing. Only `rule-dashed` became `rule`, because
that name asserted something no longer true.

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
  is derivable from the Career section, so a reviewer can line the two up. This
  is the clearest place the page departs from Nichol, which shows Figma 90% /
  Sketch 90% / Photoshop 90% / Illustrator 90% / Adobe XD 90%. Do not
  reintroduce percentage bars, star ratings or award badges.
- The page must not say the same thing three times. About used to repeat
  Career, and Career used to repeat the decisions; both were trimmed.

## Interactive pieces

- `Header` — the theme toggle. Icon-only, so `aria-label` carries the whole
  accessible name and JS keeps it in step with the current theme. Both the sun
  and the moon ship and **CSS** picks which shows, so the right one is there on
  the first paint rather than after hydration. The three-state logic — stored
  choice, else OS — lives in `currentTheme()`; with no stored choice the
  attribute is deliberately left off so the page keeps following the OS live.

- `CareerSection` — two tiers, no script. A **rail** of milestones
  (`career-rail`) you can scan in three seconds, each one a native `#career-N`
  jump link into a **detail card** below (`career-timeline`). The rail runs
  oldest to newest because a trajectory reads left to right; the cards run
  newest first because that is what a reviewer wants. Both connectors are drawn
  per item with `::after` and suppressed on `:last-child`, so each run stops
  exactly at the next marker rather than guessing an inset from the last card's
  height — and the marker is `relative` so the absolutely positioned hairline
  cannot paint across its face. The rail rotates from a horizontal row to a
  vertical spine at the `md` breakpoint from the same markup. Highlights sit in
  a two-column grid so four bullets read as two rows instead of a wall.

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
Writing post, or the CV — `public/Le-Ngoc-Ha-Senior-Frontend-Developer.pdf`,
which the site's owner has named the source of truth for anything CV-shaped:
employers, titles, date ranges, and the numbers it states.

Reconciled against the CV once already, so do not re-loosen these:

- Date ranges in the CV are month-precise (`03/2025`, `10/2021 — 02/2023`).
  `Role.period` is years for the rail, `Role.periodExact` is the CV range for
  the detail card. Do not widen `periodExact` to whole years.
- The CV says nearly five years, not five.
- The CV says the Tweet World mobile Lighthouse was held **at** 85, not above
  it. This matters most in the decision log, which states
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
