# ResumeWindow Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/ResumeWindow.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/window-resume-full.png`
- **Interaction model: STATIC.** Verified — the "Open" pills are **not links and not buttons**
  (`linkCount === 0`, `cursor: grab` inherited from the draggable window, no handlers).
  They are decorative. Do not wire them up.
- **Renders the window BODY only.**

Window `864 × 630` viewport, `1158px` of content. Title bar `0,0 864×44`; body starts **50px**
below it, so content begins at `y = 94`. `WindowFrame` renders `{children}` straight after the
title bar with no gap, so the component root supplies that `pt-[50px]` itself.

## DOM Structure

```
"Container"     0,94  864×1064   flex, justify-center, items-center, padding 0 20px 60px, max-w 1152px
  └─ "Content" 20,94  824×1004   display:grid, 3 × 264px columns, gap 20px (row) / 16px (col), 8 items
       └─ card ×8    264×321     flex-col, items-center, justify-center
            ├─ "Image"          264×321  — the image FILLS the whole card
            └─ "Title Wrapper"  264×86   — OVERLAYS the bottom of the image
```

**The "Title Wrapper" is an overlay footer, not a block below the image.** The card spans
`94 → 415`; the image spans the same `94 → 415`; the title wrapper sits at `329 → 415`, i.e. the
bottom 86px of the card, painted on opaque white over the image. Build it with the image as an
absolutely-filled layer and the footer absolutely pinned to the bottom (or a relative card with
the footer `absolute inset-x-0 bottom-0`).

## Computed Styles (exact values from getComputedStyle)

### "Content" grid
- display `grid`; `grid-template-columns: 264px 264px 264px`
- gap `20px 16px` (row-gap 20px, column-gap 16px)
- width `824px`; justifyContent `center`

### Card
- `264 × 321`; display `flex`; flexDirection `column`; justifyContent `center`; alignItems `center`

### Image
- `264 × 321`; `object-fit: cover`; `border-radius: 0`; `alt="Image"` on the live site → use `alt=""`

### "Title Wrapper" (the white footer)
- `264 × 86`
- `background: rgb(255, 255, 255)` — fully opaque, no blur, no transparency
- `padding: 12px`
- display `flex`; flexDirection `row`; justifyContent `space-between`; alignItems `center`
- `border-radius: 0`; no shadow, no border

### "Title & Description" (left side of the footer)
- `182 × 62`; display `flex`; flexDirection `column`; justifyContent `center`;
  alignItems `flex-start`; **gap `0`**
- Three stacked `<p>`s:

| Line | Font | Size / line-height | Tracking | Colour |
| --- | --- | --- | --- | --- |
| Category | SF Pro **Text** Regular → `font-sans` | `12px / 16.8px` | `normal` | `rgba(0, 0, 0, 0.6)` |
| Name | SF Pro **Display** Regular → `font-display` | `18px / 25.2px` | `-0.54px` | `rgb(0, 0, 0)` |
| Blurb | SF Pro **Display** Regular → `font-display` | `14px / 19.6px` | `-0.14px` | `rgba(0, 0, 0, 0.6)` |

The category text is stored **already uppercase** in the content — it is not a
`text-transform: uppercase` (computed `text-transform` is `none`). Write the strings uppercase.

### "Open" pill (right side of the footer)
- `58 × 33`; `background: rgb(0, 0, 0)`; `border-radius: 40px`; `padding: 8px 14px`
- display `flex`; justifyContent `center`; alignItems `center`
- Label `<p>Open</p>` — SF Pro Text Regular → `font-sans`; `12px / 16.8px`; `color: rgb(255, 255, 255)`
- **Not interactive.** Render it as a `<span>` / `<div>`, NOT a `<button>` or `<a>`.

## Content — all 8 cards, in reading order (3 per row)

Asset base: `/sites/portos-framer-website-67488b6b/root-8a5edab2/images/`

| # | Category | Name | Blurb | Asset |
| --- | --- | --- | --- | --- |
| 1 | `DESIGN & PURLISH` | `Framer` | `Interactive prototypes that ship.` | `resume-01.png` |
| 2 | `INTERFACE` | `Figma` | `Where every project begins.` | `resume-02.png` |
| 3 | `3D` | `Spline` | `Soft, spatial exploration.` | `resume-03.png` |
| 4 | `MOTION` | `Rive` | `Runtime animation stays sharp.` | `resume-04.png` |
| 5 | `WORKFLOW` | `Raycast` | `A calmer command line.` | `resume-05.png` |
| 6 | `PLANNING` | `Linear` | `The plot of every project.` | `resume-06.png` |
| 7 | `WRITING` | `Notion` | `Where things are remembered.` | `resume-07.png` |
| 8 | `COLOUR` | `Coolors` | `Palettes for morning light.` | `resume-08.png` |

> `DESIGN & PURLISH` is spelled that way on the live site — a typo for "PUBLISH". **Reproduce it
> verbatim.** This is a clone; do not silently correct the source's copy.
> `COLOUR` is the British spelling on the live site. Also verbatim.

Verified row origins: `y = 94`, `435`, `776`. Card height `321` + `20px` row gap.

## States & Behaviours

**None.** No hover on cards, images, footers or pills. No click targets. No animation.
Verified: `cursor` on every element resolves to `grab`, inherited from the draggable window —
nothing sets `pointer`.

### Scroll
`1158px` of content against a `630px` viewport. Scrollbar hidden (`WindowFrame` applies `.portos-scroll`).

## Text Content (verbatim)
Everything is in the table above, plus the literal string `Open` eight times.
Window title `Resume` is rendered by `WindowFrame`.

## Responsive Behavior
The live site clips rather than reflows below 864px. `WindowFrame` caps the window at
`max-w-[calc(100vw-16px)]`. Add a graceful fallback:
- `min-[880px]:` and above — the measured `264px 264px 264px` grid.
- Below that — `repeat(2, minmax(0, 1fr))`, card image `aspect-[264/321]`, footer stays pinned.
- Below `520px` — single column.
This is an adaptation, not a measurement. Note it in your report.

## Props
```ts
// No props.
export function ResumeWindow()
```
No `"use client"` needed — this component has no state and no handlers.

## Notes
- Model the 8 cards as a module-level `const RESUME_TOOLS: ResumeTool[]` using the `ResumeTool`
  interface already exported from `@/types/portos` (extend it locally if a field is missing, but
  do **not** edit `@/types/portos`). Render with `.map()`.
- **Tailwind preflight sets `img { height: auto }`.** Every card image is the same `264×321`, so a
  static `h-[321px] w-[264px] object-cover` class works — no dynamic class names needed here.
- Import `PORTOS_ASSETS` from `@/types/portos`.
- Verify `npx tsc --noEmit` and `npx eslint <file>` before finishing.

## Replaced entirely — this window no longer clones anything

Everything above describes the ORIGINAL and is kept only as a record of it.

The live site fills this window with eight cards for the template author's own
design tools — Framer, Figma, Spline, Rive, Raycast, Linear and two more — which
is not a resume and has nothing to do with this owner. On request it now shows
the actual CV: `public/Le-Ngoc-Ha-Senior-Frontend-Developer.pdf` (3.6MB, two
pages) in the browser's own PDF viewer, plus a status bar with Open and Download.

`ResumeTool` was deleted from `src/types/portos.ts` along with the cards — it
described the template's content and nothing referenced it any more.

### Height is `calc(100% - 44px)`, and that is not a rounding choice

`WindowFrame` keeps its 44px title bar INSIDE the scroll container, as a
`sticky top-0` first child rather than an overlay. A body at `h-full` would
therefore be a full window tall while sitting below a bar already consuming 44px,
pushing the window into scrolling by exactly that much and putting a second,
outer scrollbar around a viewer that already scrolls itself. Measured after the
fix: window 630, title bar 44, body 586, `scrollHeight` 630 = `clientHeight`, so
no outer scrollbar appears.

`min-h-0` on the viewer is the same flex trap the Projects cards hit: a flex
item's automatic minimum is its content height, and an iframe's default is 150px,
which would stop `flex-1` from shrinking it to fit.

### The small-screen branch is a capability fallback

Below 700px the embed is swapped for a panel with the two buttons. That is not a
styling preference — iOS Safari and most mobile browsers refuse to render a PDF
inside an iframe and paint an empty box instead, so on a phone the buttons are
the only thing that works.

`#view=FitH` on the src asks the built-in viewer to fit the page to the window
width. It is a hint, not a contract: Chrome and Edge honour it, Firefox mostly
does, anything else opens at its own default zoom.

### Leftover assets

`resume-01.png` through `resume-08.png` are the template's tool cards and are now
referenced by nothing. Left on disk deliberately — deleting them is the owner's
call, and the download script restores them either way.
