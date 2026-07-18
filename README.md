# Lê Ngọc Hà — Portfolio

Personal developer portfolio for **Lê Ngọc Hà** — Senior Frontend Engineer /
Frontend Tech Lead. Built with Next.js 16 (App Router, React 19), Tailwind
CSS v4, and shadcn/ui.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm run check      # lint + typecheck + build
```

## Project Structure

```
src/
  app/           # Routes, root layout, global CSS
  components/    # Header, About, Experience, Projects, Footer, icons
    ui/          # shadcn/ui primitives
  lib/utils.ts   # cn() utility
public/
  images/        # Project screenshots and assets
  seo/           # Favicons, OG images
  resume.pdf     # Downloadable CV
```

## Deployment

Deployed on [Vercel](https://vercel.com/). Pushing to `master` runs CI
(lint + typecheck + build) via GitHub Actions.
