# GalleryWindow Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/GalleryWindow.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/window-gallery-full.png`
- **Interaction model:** **static**. No clicks, no hover, no tabs, no lightbox, no scroll-driven behaviour.
- **Renders the window BODY only** — `WindowFrame` supplies the chrome (traffic lights, title
  `Gallery`, sticky title bar, drag, hidden-scrollbar scroller).

All coordinates are **relative to the window's top-left corner** (window is 864px wide,
630px tall viewport, 1200px of content).

## DOM Structure

```
"Container"        0,94  864×1106   flex, justify-center, items-center, padding 0 20px 60px
  └─ "Content"    20,94  824×1046   flex-col, items-start
       └─ grid    20,94  824×1046   display:grid, 3 × 264px columns, gap 16px
            ├─ column 1   264×1046  flex-col, gap 16px  (3 images)
            ├─ column 2   264×1046  flex-col, gap 16px  (3 images)
            └─ column 3   264×1046  flex-col, gap 16px  (3 images)
```

The body sits **50px below the title bar** (`Desktop` is `flex-col` with `gap: 50px`),
so `Container` starts at `y = 44 + 50 = 94`.

## Computed Styles (exact values from getComputedStyle)

### Window body scroller (`Desktop`) — supplied by `WindowFrame`, for reference
backgroundColor `rgb(247, 247, 247)`; display `flex`; flexDirection `column`;
justifyContent `flex-start`; alignItems `center`; **gap `50px`**

### "Container"
- padding: `0px 20px 60px`
- maxWidth: `1152px`; width `100%`
- display `flex`; justifyContent `center`; alignItems `center`

### "Content"
- width `824px` (= 864 − 2×20)
- display `flex`; flexDirection `column`; justifyContent `center`; alignItems `flex-start`
- gap: `20px 16px`

### Grid
- display `grid`
- `grid-template-columns: 264px 264px 264px`
- gap `16px`
- Each column child: `display: flex; flex-direction: column; gap: 16px`

### Images
- width `264px`; `object-fit: cover`; `border-radius: 0`
- heights vary per item (below)
- `alt="Image"` on the live site — use `alt=""` (decorative) in the clone

## Content — exact items

Asset base: `/sites/portos-framer-website-67488b6b/root-8a5edab2/images/`

### Column 1 (x = 20)
| Order | Asset | Rendered | Verified y |
| --- | --- | --- | --- |
| 1 | `gallery-01.png` | 264×367 | 94 |
| 2 | `gallery-02.png` | 264×240 | 476 |
| 3 | `gallery-03.png` | 264×367 | 732 |

### Column 2 (x = 300)
| Order | Asset | Rendered | Verified y |
| --- | --- | --- | --- |
| 1 | `gallery-04.png` | 264×306 | 94 |
| 2 | `projects-10.png` | 264×300 | 415 |
| 3 | `gallery-05.png` | 264×367 | 731 |

### Column 3 (x = 580)
| Order | Asset | Rendered | Verified y |
| --- | --- | --- | --- |
| 1 | `gallery-06.png` | 264×342 | 94 |
| 2 | `gallery-07.png` | 264×306 | 452 |
| 3 | `gallery-08.png` | 264×367 | 773 |

> `projects-10.png` in column 2 is not a typo — the live site reuses that same asset in the
> Projects, Gallery and Recycle Bin windows. Use that exact file.

## States & Behaviours

**None.** Verified: no hover transform, no click handler, no lightbox, no filter tabs,
no lazy-in animation. The images are inert. Do not add any interactivity.

### Scroll
Content is `1200px` tall against a `630px` viewport, so the body scrolls ~570px. The scrollbar is
hidden — `WindowFrame` already applies `.portos-scroll`.

## Text Content (verbatim)
**None.** The only text in this window is the title `Gallery`, which lives in `WindowFrame`.

## Responsive Behavior
The live site does not resize its windows below 864px — it just clips them. `WindowFrame` caps the
window at `max-w-[calc(100vw-16px)]`, so the grid needs a graceful fallback:

- `min-[880px]:` and above — the measured `264px 264px 264px` grid.
- Below that — `grid-template-columns: repeat(2, minmax(0, 1fr))`, images `w-full` with their
  aspect ratio preserved via `aspect-[264/<height>]` so proportions stay correct.
- At `max-[520px]:` — single column.

This is an adaptation, not a measurement. Note it in your report.

## Props
```ts
// No props.
export function GalleryWindow()
```

## Notes
- Model the nine images as a module-level `const GALLERY_COLUMNS: GalleryImage[][]` using the
  `GalleryImage` interface (`{ src: string; height: number }`) already exported from
  `@/types/portos`, and render with nested `.map()` — do not paste nine `<Image>` blocks.
- Import `PORTOS_ASSETS` from `@/types/portos`.
- **Tailwind preflight sets `img { height: auto }`.** `next/image` `width`/`height` props alone
  will NOT produce the measured height — you must also set an explicit height (a `style` height or
  an `h-[Npx]` class) or every image will render at its intrinsic aspect ratio instead of the
  measured crop.
- This component needs no client-side state — leave it a server component (no `"use client"`).
- Verify `npx tsc --noEmit` passes before finishing.
