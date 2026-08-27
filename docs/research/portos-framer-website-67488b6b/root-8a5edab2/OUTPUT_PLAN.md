# Output Plan — portos.framer.website

## Target

| Field | Value |
| --- | --- |
| Source URL | `https://portos.framer.website/` |
| Normalized origin | `https://portos.framer.website` |
| Normalized pathname | `/` |
| `<app-root>` | `.` (repository root) |
| `<site-key>` | `portos-framer-website-67488b6b` (sha256 of origin, first 8 hex = `67488b6b`) |
| `<page-key>` | `root-8a5edab2` (sha256 of `/`, first 8 hex = `8a5edab2`) |
| Destination route | `/` → `src/app/page.tsx` |

## Roots

- Artifacts: `docs/research/portos-framer-website-67488b6b/root-8a5edab2/`
- Screenshots: `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/`
- Components: `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/`
- Assets: `public/sites/portos-framer-website-67488b6b/root-8a5edab2/`
- Downloader: `scripts/download-assets-portos-framer-website-67488b6b-root-8a5edab2.mjs`

## Pre-flight findings

- Repository is the **untouched template scaffold**. The only route is `src/app/page.tsx`, whose body is the
  "Clone target not yet built" placeholder. Per skill routing defaults, this first single-URL clone replaces
  that scaffold so the clone is served at `/`.
- No existing cloned or user-authored routes, site component namespaces, research artifacts, screenshots,
  or public asset namespaces. `public/{images,videos,seo}` contain only `.gitkeep`.
- No collisions with any planned output path.
- `npm run build` on the untouched scaffold: **passes** (exit 0).
- Single origin → no multi-origin layout decision needed. Shared foundation (fonts, globals.css, metadata)
  is safe to own outright.

## Shared foundation files that will change

| File | Change |
| --- | --- |
| `src/app/layout.tsx` | Register SF Pro (local woff2) + Inspiration (Google) fonts; site metadata; `<body>` background |
| `src/app/globals.css` | Merge PortOS design tokens; no existing route tokens to preserve |
| `src/app/page.tsx` | Replace scaffold placeholder with the PortOS desktop shell |
| `src/types/portos.ts` | New — content interfaces |

## Build decomposition

Shell components (`src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/`):

1. `PreLoader.tsx` — full-screen intro overlay + per-letter reveal + ellipse exit
2. `MenuBar.tsx` — top macOS menu bar (live clock)
3. `DesktopIcons.tsx` — three desktop folder icons
4. `Dock.tsx` — bottom dock, 9 apps + divider + trash
5. `WindowFrame.tsx` — reusable window chrome: traffic lights, title bar, drag, open/close animation
6. `DesktopShell.tsx` — window manager (which windows are open, z-order, positions)

Window content components:

7. `AboutWindow.tsx` — "Our work with Norma"
8. `ProjectsWindow.tsx` — "Overview of the Project" (Masonry/Grid toggle)
9. `JournalWindow.tsx` — "Journal"
10. `ContactWindow.tsx` — "Contact" (form)
11. `ResumeWindow.tsx` — "Resume"
12. `GalleryWindow.tsx` — "Gallery"
13. `RecycleBinWindow.tsx` — "Recycle Bin"
14. `WallpaperWindow.tsx` — "Wallpaper" (carousel)

## Out of scope

Per skill defaults: no real backend, no form submission target, no auth. The Framer
"Made in Framer" attribution badge is Framer's own injected watermark, not part of the
template's design, and is deliberately not reproduced.

## Customization

The clone started as pure emulation. Two behavioural changes have since been requested by the
project owner: **green maximises** the window and **yellow minimises** it to the bottom-left,
instead of both closing (on the live site all three lights close). Only red still closes.
Recorded under "Requested divergences" in `ARTIFACT_MANIFEST.md`.
