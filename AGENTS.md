<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio — Lê Ngọc Hà

## What This Is
A personal portfolio that presents itself as a macOS desktop: a wallpaper, a
menu bar, folder icons, a dock, and draggable windows for About, Experience,
Projects, Writing, Resume, Gallery, Contact and Highlights & Decisions.

It began life as a clone of a Framer template and was matched to it 1:1 first;
it has since diverged deliberately. The build is now in its **maintenance and
customisation phase** — changes are made on their own merit, and no longer need
to match any reference site.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Tailwind CSS v4, `cn()` utility), Base UI primitives
- **Icons:** Lucide React, plus SVGs served from `public/sites/.../images/`
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Content:** Notion drives the Writing window via `@notionhq/client` — see `.env.example`
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

## Working On This Codebase
- Many values here are **measured from the original site**, not chosen. Where a
  comment explains why a number is what it is, keep the comment truthful if you
  change the number.
- The breakpoints are `810px` and `1200px`, expressed as arbitrary variants
  (`min-[810px]:`, `max-[809px]:`) because Tailwind's defaults do not line up.
- Verify visually before claiming a UI change works. `npm run check` proves it
  compiles, not that it looks right.

## Project Structure
```
src/
  app/
    (vi)/           # Vietnamese pages, at the root URLs — own root layout, <html lang="vi">
      [section]/    # /about, /experience, ... — the desktop booted with that window open
      writing/      # /writing and /writing/[slug], server-rendered from Notion (ISR)
      page.tsx      # / — the desktop shell, no window open
    en/             # English pages under /en — own root layout, <html lang="en">
                    # (/en, /en/[section], /en/writing; articles stay Vietnamese-only)
    _shared/        # What both languages render: the <html> document, fonts, home,
                    # window pages, Writing list (private folder, not a route)
    api/writing/    # Notion-backed routes for the Writing window
    global-not-found.tsx  # 404 for unmatched URLs (two root layouts, so no shared one)
    globals.css     # Tailwind v4 theme + design tokens
  components/
    sites/portos-framer-website-67488b6b/root-8a5edab2/
                    # The desktop shell and every window, one file each
    ui/             # shadcn/ui primitives
  i18n/
    en.ts           # EVERY English string (Vietnamese stays in its component)
    locale.ts       # vi/en, /en URL mapping
    types.ts        # Copy shapes shared by both languages
  data/
    writing-en.ts   # English titles/summaries for /en/writing, keyed by slug
  lib/
    analytics.ts    # trackEvent() and the analytics ids (Vercel, Umami, Cloudflare, GA4)
    utils.ts        # cn() utility (shadcn)
    notion.ts       # Notion client and query helpers
    markdown.ts     # Notion blocks -> HTML
    posts.ts        # One rendered article, shared by the API route and the page
    sections.ts     # Which windows are pages, their URLs (per language) and search copy
    seo.ts          # Per-page metadata builder (canonical, hreflang), meta-description overrides
    site.ts         # Origin, site title/description, Person JSON-LD
  types/
    portos.ts       # Shared types and the PORTOS_ASSETS path constant
public/
  sites/portos-framer-website-67488b6b/root-8a5edab2/
    images/         # Wallpapers, dock and folder artwork
    fonts/          # Self-hosted SF Pro faces
    seo/            # Favicons, OG images, webmanifest
```

The long `sites/<site-key>/<page-key>/` path is a leftover of how this project
was generated. `PORTOS_ASSETS` in `src/types/portos.ts` is the single source of
that prefix — asset URLs are built from it rather than written out by hand.
