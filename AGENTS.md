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
  components/       # React components (Header, About, Experience, Projects, Writing, Footer)
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
