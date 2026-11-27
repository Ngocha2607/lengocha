# Portfolio — Lê Ngọc Hà

A personal portfolio that presents itself as a macOS desktop. There is a
wallpaper, a menu bar with a live clock, folder icons, a dock, and windows you
can open, focus, drag, minimise and maximise.

**Live:** https://lengocha.vercel.app

## The windows

| Window                 | Opened from               | What is in it                                           |
| ---------------------- | ------------------------- | ------------------------------------------------------- |
| About                  | `About` folder, dock      | Long-form intro with a sticky portrait and a timeline   |
| Experience             | `Experience` folder       | Long-form work history                                  |
| Projects               | `Projects` folder, Finder | Project cards, switchable between grid and list         |
| Writing                | Launchpad                 | Posts read live from Notion, with per-post detail pages |
| Highlights & Decisions | Notes                     | Selected decisions and what came of them                |
| Resume                 | Messages                  | The CV as an embedded PDF (Vietnamese or English)       |
| Gallery                | Photos                    | Image grid                                              |
| Contact                | Contacts                  | Contact details and links                               |
| Recycle Bin            | Trash                     | —                                                       |

A full-screen intro plays once on first paint, then collapses into the desktop.
It respects `prefers-reduced-motion`, where it leaves almost immediately
instead.

## Running it

Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command             | Does                       |
| ------------------- | -------------------------- |
| `npm run dev`       | Dev server                 |
| `npm run build`     | Production build           |
| `npm run start`     | Serve the production build |
| `npm run lint`      | ESLint                     |
| `npm run typecheck` | `tsc --noEmit`             |
| `npm run check`     | lint + typecheck + build   |
| `npm run cv:build`  | Rebuild the CV PDFs        |

The CV PDFs in `public/` are generated from `cv/`; see `cv/README.md` for how
to edit and rebuild them.

There is also a `Dockerfile` and a `docker-compose.yml` if you would rather not
install Node locally.

## Configuration

Copy `.env.example` to `.env.local` and fill it in. Both Notion variables are
optional — without them the Writing window falls back to a hardcoded entry, and
everything else works untouched.

| Variable               | Purpose                             |
| ---------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Absolute OG and canonical URLs      |
| `NOTION_TOKEN`         | Internal integration secret         |
| `NOTION_WRITING_DB_ID` | Database backing the Writing window |

`.env.example` documents the Notion database properties the integration expects.

## Layout

```
cv/                 # CV source: content per language, template, build script
src/
  app/
    api/writing/    # Notion-backed routes for the Writing window
    (vi)/           # Vietnamese pages at the root URLs (<html lang="vi">)
    en/             # English pages under /en (<html lang="en">)
    _shared/        # The document, fonts and pages both languages render
    globals.css     # Tailwind v4 theme + design tokens
  components/
    sites/portos-framer-website-67488b6b/root-8a5edab2/
                    # The desktop shell and every window, one file each
    ui/             # shadcn/ui primitives
  i18n/en.ts        # Every English string; Vietnamese stays in its component
  lib/              # cn(), Notion client, Notion-blocks-to-HTML, analytics, CV paths
  types/portos.ts   # Shared types and the PORTOS_ASSETS path constant
public/
  sites/portos-framer-website-67488b6b/root-8a5edab2/
    images/ fonts/ seo/
```

That long `sites/<site-key>/<page-key>/` path is a leftover of how the project
was first generated. `PORTOS_ASSETS` in `src/types/portos.ts` is the single
source of the prefix, so asset URLs are built from it rather than typed out.

## Notes for anyone editing this

The layout started as a 1:1 clone of a Framer template, so a lot of the numbers
in these components are **measured, not chosen** — breakpoints at `810px` and
`1200px`, a `78.59px` icon button, a `0.9` hover scale. Where a comment explains
why a value is what it is, keep it truthful if you change the value.

The design has since diverged from that reference on purpose, so matching it is
no longer a goal.

## Built with

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Notion API ·
deployed on Vercel.

Originally scaffolded from
[ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)
(MIT).

## License

MIT
