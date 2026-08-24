# Lê Ngọc Hà — Portfolio

Personal developer portfolio for **Lê Ngọc Hà** — Senior Frontend Engineer /
Frontend Tech Lead. Built with Astro 6 and Tailwind CSS v4, deployed on Vercel.

Styled after [Mono Lume](https://github.com/heshify/monolume) (MIT) — mono
display type, an acid-green accent, dashed hairline outlines and rounded cards.
Five sections have no counterpart in that template and were built in the same
language: **Career**, a **decision log**, a **performance case study**, **how I
lead**, and a live **Core Web Vitals** strip.

The decision log is the centrepiece: seven engineering decisions with the
alternatives weighed and what each cost, two of which are a deliberate no — one
change measured, proved out and kept out of production, and one shipped then
undone.

The page ships **no framework JavaScript**. Every interactive piece — the
performance slider, the CI replay, the marquee bands, the cursor circle, the
live vitals strip — is plain DOM work in an Astro `<script>` or pure CSS,
because a site whose argument is bundle size cannot ship a runtime to move a
bar. Measured on a production build: one 9.4KB script, 14 requests, LCP 205ms,
CLS 0.00, Lighthouse accessibility / best practices / SEO all 100.

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
  components/     # Header, Hero, the section components, Footer
  lib/notion.ts   # Notion "Writing" data layer
  lib/markdown.ts # Notion Markdown -> HTML (server-side, via marked)
  styles/         # global.css — design tokens and @utility classes
  assets/         # Project screenshots (optimized by astro:assets)
  consts.ts       # Identity, socials, NAV, JSON-LD
public/
  seo/            # favicon.svg, apple-touch-icon.png, og.png, webmanifest
  resume.pdf      # Downloadable CV
```

`NAV` and `SOCIALS` in `src/consts.ts` drive the header, the mobile sheet and
the footer, so a section's anchor is defined in one place.

## The page

Sections marked *new* have no counterpart in the template.

```
Header          fixed, "L." mark + anchor nav + hamburger
Hero            giant wordmark, standfirst, two pill buttons
About me        numbers panel + prose + skill pills
Career          roles, dashed rows                             new
Work            marquee + project cards with screenshots
Decisions       the decision log                               new
Performance     the LMS audit, slider, pipeline replay         new
How I lead      six practices + mentoring + artifacts          new
Posts           marquee + Notion-backed writing
Get in touch    pitch, socials, mail-composing form
Live vitals     Core Web Vitals for the page you are on        new
Footer          acid block, wordmark, four link columns
```

## Credits

Design adapted from [Mono Lume](https://github.com/heshify/monolume) by heshify,
MIT licensed.

## Configuration

Copy `.env.example` and fill in the Notion credentials to drive the Writing
section. With no Notion config the site still builds and renders a hardcoded
fallback entry.

## Deployment

Deployed on [Vercel](https://vercel.com/). Pushing to `main` runs CI
(typecheck + build) via GitHub Actions.
