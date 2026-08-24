# Lê Ngọc Hà — Portfolio

Personal developer portfolio for **Lê Ngọc Hà** — Senior Frontend Engineer /
Frontend Tech Lead. Built with Astro 6 and Tailwind CSS v4, deployed on Vercel.

Laid out as a broadsheet front page rather than the usual hero-plus-sections:
a nameplate, a dateline, a numbered index, a lead story, then nine sections set
off by rules. The centrepiece is a **decision log** — seven engineering
decisions with the alternatives weighed and what each cost, two of which are a
deliberate no.

The page ships **no framework JavaScript**. Every interactive piece — the
performance slider, the workspace tree, the CI replay, the live Core Web Vitals
strip — is plain DOM work in an Astro `<script>`, because a site whose argument
is bundle size cannot ship a runtime to move a bar.

## Development

```bash
npm install
npm run dev      # http://localhost:4321
```

## Commands

```bash
npm run dev        # Dev server
npm run build      # Production build (Vercel adapter)
npm run typecheck  # astro check — TypeScript + .astro templates
npm run check      # typecheck + build
```

### Measuring performance locally

The dev server misreports paint timings, so the Web Vitals strip in the footer
is only meaningful against a production build. The Vercel adapter has no
preview server, so build against the Node adapter instead:

```bash
LOCAL_PROD=1 npm run build
HOST=127.0.0.1 PORT=4321 node ./dist/server/entry.mjs
```

## Rendering model

`output: "static"`, so pages are prerendered with no runtime cost. Two routes
opt out with `prerender = false` because their content comes from Notion:

- `/` — the Writing list
- `/writing/[slug]` — the articles

Those are cached by Vercel ISR for an hour (`isr.expiration: 3600`), so a newly
published post appears without a redeploy.

## Project Structure

```
src/
  pages/          # Routes: index, writing/[slug], 404, robots.txt, sitemap.xml
  layouts/        # Layout.astro — head, fonts, JSON-LD, skip link
  components/     # Masthead, SectionRule, the nine sections, Footer
  lib/notion.ts   # Notion "Writing" data layer
  lib/markdown.ts # Notion Markdown -> HTML (server-side, via marked)
  styles/         # global.css — brutalist design tokens
  assets/         # Project screenshots (optimized by astro:assets)
  consts.ts       # Identity, socials, SECTIONS spine, JSON-LD
public/
  seo/            # favicon.svg, apple-touch-icon.png, og.png, webmanifest
  resume.pdf      # Downloadable CV
```

`SECTIONS` in `src/consts.ts` drives the masthead index, the reading rail, the
scroll spy and the section numbering — adding a section means editing that
array and nothing else.

## The page

```
Masthead        nameplate · dateline · In this issue · contact strip
01 Lead         the short version
02 Decisions    the decision log
03 Performance  the LMS audit
04 Leading      how I run a team
05 Work         the record
06 Projects     the workspace explorer
07 Toolbox      what I use, and since when
08 Writing      Notion-backed posts
09 Hiring       working together + colophon
Footer          live Core Web Vitals
```

## Configuration

Copy `.env.example` and fill in the Notion credentials to drive the Writing
section. With no Notion config the site still builds and renders a hardcoded
fallback entry.

## Deployment

Deployed on [Vercel](https://vercel.com/). Pushing to `main` runs CI
(typecheck + build) via GitHub Actions.
