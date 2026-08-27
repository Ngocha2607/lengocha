# JournalWindow Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/JournalWindow.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/window-journal-full.png`
- **Interaction model: CLICK-DRIVEN slideshow** (manual prev/next arrows) + a static card grid below.
  **Verified NOT auto-advancing** — sampled the track position once a second for 8 seconds and it
  never moved. Clicking "Next" moved it by one slide. This is the opposite of the Wallpaper
  window's carousel; do not copy that behaviour here.
- **Renders the window BODY only.**

Window `864 × 630` viewport, `1911px` of content. Title bar `0,0 864×44`; body starts **50px**
below it, so content begins at `y = 94`. `WindowFrame` renders `{children}` straight after the
title bar with no gap, so the component root supplies `pt-[50px]` itself.

## DOM Structure

```
window body                    flex-col, items-center, gap 50px, padding-bottom 60px
  └─ "Container"   72,94  720×1757   flex, justify-center, items-center, padding 0 20px
       └─ "Content" 92,94 680×1757   flex-col, items-center, gap 20px
            └─ "Title & Slaidshow"  680×1757  flex-col, items-center, gap 32px
                 ├─ slideshow  680×458
                 └─ card grid  680×…    2 columns × 328px, column-gap 24px, row-gap 32px
```

> **This window is narrower than the others.** `Container` is `720px` wide (not 864) and centred,
> giving a `680px` content column. That is a real measured difference, not an error.
> The window body also carries `padding-bottom: 60px` (other windows put that on `Container`).
> The `data-framer-name` on the live site is literally `Title & Slaidshow` (typo for "Slideshow").

## Slideshow

Two unique slides, `680 × 457` each, laid out horizontally with a **704px step** (680 wide +
24px gap). The live site repeats the pair four times in the DOM to fake looping — reproduce the
*behaviour* (wrap-around), not the DOM duplication.

### Slide structure
```
slide  680×457   flex-col, items-center, gap 16px
  ├─ "Title & Time"  680×39   flex-ROW, justify-between, items-center
  │      ├─ <h3>  340 wide
  │      └─ <p>   340 wide
  └─ "Image"      680×402
```

- `<h3>`: SF Pro Display **Medium** → `font-display font-medium`; `32px / 38.4px`;
  letterSpacing `-0.32px`; `color: rgba(0, 0, 0, 0.7)`
- `<p>`: SF Pro Display Regular → `font-display`; `14px / 19.6px`; letterSpacing `-0.14px`;
  `color: rgba(0, 0, 0, 0.5)`
- Image: `680 × 402`, `object-fit: cover`, `border-radius: 0`

### Slide content
Asset base: `/sites/portos-framer-website-67488b6b/root-8a5edab2/images/`

| # | Title | Description | Asset |
| --- | --- | --- | --- |
| 1 | `Designing with intention.` | `Our work with Norma explored form, light, and material through calm compositions and refined visual storytelling.` | `journal-hero.png` |
| 2 | `Our Work with Norma` | `Exploring the quiet relationship between material, light, and form through an editorial design process.` | `journal-portrait.png` |

### Prev / Next arrows — these ARE visible (unlike the Wallpaper window's)
- A `flex-row` pair at `124,454`, total `148 × 66`, **gap `16px`** (buttons at x `124` and `206`).
- They **overlay the bottom-left of the slide image** (the image spans y `149 → 551`; the arrows
  sit at `454 → 520`, i.e. 31px above the image's bottom edge and 32px in from the slide's left edge).
- Each button: `66 × 66`; `background: rgba(0, 0, 0, 0.1)`; `border-radius: 60px`; `padding: 0`;
  `cursor: pointer`; accessible names `Previous` and `Next`.
- Each contains a `66 × 66` arrow image:
  - Previous → `journal-arrow-back.png`
  - Next → `journal-arrow-next.png`
- **Transition:** clicking moves the track by one slide. Use `~0.6s ease` on the track transform.
- Wrap around at both ends.

## Card grid (below the slideshow)

- 2 columns × `328px`; **column-gap `24px`** (col 1 at x `92`, col 2 at x `444`);
  **row-gap `32px`**
- Rows align to the tallest cell (verified by the measured y offsets), so a plain CSS grid with
  `align-items: start` and equal row tracks reproduces it.

### Card structure
```
card
  ├─ <img>  328 × H   object-fit cover, border-radius 0
  ├─ 12px gap
  └─ row    flex-ROW, justify-between, items-center
        ├─ <p> title
        └─ <p> tag
```
- Title: SF Pro Display **Medium** → `font-display font-medium`; `20px / 28px`;
  letterSpacing `-0.4px`; `color: rgba(0, 0, 0, 0.7)`
- Tag: SF Pro Display Regular → `font-display`; `14px / 19.6px`; letterSpacing `-0.14px`;
  `color: rgba(0, 0, 0, 0.5)`

### Card content — reading order is COLUMN-MAJOR pairs (row 1 = cards 1+2, etc.)

| Row | Column | Title | Tag | Asset | Image height |
| --- | --- | --- | --- | --- | --- |
| 1 | left | `The Beauty of Quiet Design` | `Editorial` | `journal-01.png` | 282 |
| 1 | right | `Motion Beyond Animation` | `Editorial` | `journal-02.png` | 361 |
| 2 | left | `Objects with Purpose` | `Editorial` | `journal-03.png` | 361 |
| 2 | right | `The Shape of Simplicity` | `Editorial` | `projects-08.png` | 282 |
| 3 | left | `Material Thinking` | `Editorial` | `journal-04.png` | 282 |
| 3 | right | `Crafting Visual Balance` | `Editorial` | `journal-05.png` | 361 |

> `projects-08.png` in row 2 right is **not a typo** — the live site reuses that asset here.

Verified row origins: images at y `584`, `1017`, `1450`.

## States & Behaviours

### Slideshow
- **Manual only.** No timer, no auto-advance, no dots. Verified over 8 seconds of sampling.
- Arrows wrap around.

### Card hover
**None.** No transform, no opacity change, no link. The cards are not clickable.

### Scroll
`1911px` of content against a `630px` viewport — this is the tallest window. Scrollbar hidden
(`WindowFrame` applies `.portos-scroll`).

## Text Content (verbatim)
All slide and card strings are in the tables above. `Editorial` appears six times.
Window title `Journal` is rendered by `WindowFrame`.

## Responsive Behavior
The live site clips rather than reflows below 864px. `WindowFrame` caps the window at
`max-w-[calc(100vw-16px)]`. Add a graceful fallback:
- `min-[760px]:` and above — the measured `680px` content column, 2×328 grid, `680×402` slide image.
- Below that — content column goes fluid (`w-full`), slide image `aspect-[680/402]`, card grid
  to a single column with the image `aspect-[328/<height>]`.
- Scale the `32px` slide `<h3>` down to `~24px` and let `Title & Time` stack (`flex-col`,
  `items-start`, `gap 8px`) below ~600px so the title and description do not collide.
This is an adaptation, not a measurement. Note it in your report.

## Props
```ts
// No props.
export function JournalWindow()
```
Needs `"use client"` (slideshow state).

## Notes
- Mark the arrow button pair `data-no-drag` so clicking them does not start a window drag.
- **Tailwind preflight sets `img { height: auto }`** and Tailwind's JIT cannot see class names
  built from data (`h-[${n}px]` produces no CSS). Use an inline `style` or a CSS custom property
  for the per-card image height.
- Import `PORTOS_ASSETS` and the `JournalEntry` interface from `@/types/portos`.
- Verify `npx tsc --noEmit` and `npx eslint <file>` before finishing.
