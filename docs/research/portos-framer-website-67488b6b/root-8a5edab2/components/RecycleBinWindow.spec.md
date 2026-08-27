# RecycleBinWindow Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/RecycleBinWindow.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/window-recyclebin-full.png`
- **Interaction model:** static content + click-driven shortcuts. No scroll-driven behaviour.
- **Renders the window BODY only** — `WindowFrame` already supplies the chrome (traffic lights,
  title `Recycle Bin`, sticky title bar, drag, hidden-scrollbar scroller).

All coordinates below are **relative to the window's top-left corner** (window is 864px wide).
Title bar occupies `0,0 864×44`.

## DOM Structure

```
"Container"        0,94  864×624   flex, justify-center, items-center, padding 0 20px 60px
  └─ "Content"    20,94  824×564   flex-col, items-start, row-gap 20px
       ├─ "Menu Wrapper"  20,94 824×79   flex-row, items-center, gap 20px
       │     ├─ Contacts icon   76×76
       │     ├─ Messages icon   76×76
       │     ├─ About folder    58×79  (icon 58×59 + label)
       │     └─ Projects folder 58×79  (icon 58×59 + label)
       └─ image grid  20,192 824×465  display:grid, 4 × 194px columns, gap 16px
             └─ 4 column divs, each flex-col gap 16px
```

The window body sits **50px below the title bar** (`Desktop` is `flex-col` with `gap: 50px`),
so `Container` starts at `y = 44 + 50 = 94`.

## Computed Styles (exact values from getComputedStyle)

### Window body scroller (`Desktop`) — supplied by `WindowFrame`, listed for reference
- backgroundColor `rgb(247, 247, 247)`; display `flex`; flexDirection `column`;
  justifyContent `flex-start`; alignItems `center`; **gap `50px`**

### "Container"
- padding: `0px 20px 60px`
- maxWidth: `1152px`
- display `flex`; justifyContent `center`; alignItems `center`
- width `100%`

### "Content"
- width `824px` (= 864 − 2×20 padding)
- display `flex`; flexDirection `column`; justifyContent `center`; alignItems `flex-start`
- gap: `20px 16px` (row-gap `20px`, column-gap `16px`)

### "Menu Wrapper" (the shortcut row)
- width `100%`; height `78.59px`
- display `flex`; flexDirection `row`; justifyContent `flex-start`; alignItems `center`; gap `20px`

### Shortcut folder label `<p>` ("About", "Projects")
- fontFamily SF Pro Display Regular → `font-display`
- fontSize `14px`; fontWeight `400`; lineHeight `19.6px`; letterSpacing `-0.14px`
- color: **`rgb(0, 0, 0)`** — note this is BLACK here, unlike the white labels on the desktop
- The folder icon + label stack is `flex-col`, `items-center`, `justify-center`

### Image grid
- display `grid`; `grid-template-columns: 194px 194px 194px 194px`; gap `16px`
- Each of the four children is a `flex-col` with `gap: 16px`
- Every image: `object-fit: cover`; `border-radius: 0`; width `194px`, height as listed below

## Content — exact items

Asset base: `/sites/portos-framer-website-67488b6b/root-8a5edab2/images/`

### Shortcut row (left → right, gap 20px)

| # | Asset | Size | Label | Opens |
| --- | --- | --- | --- | --- |
| 1 | `dock-contacts.png` | 76×76, `object-fit: contain` | — | **nothing** |
| 2 | `dock-messages.png` | 76×76, `object-fit: contain` | — | **nothing** |
| 3 | `folder.png` | 58×59, `object-fit: cover` | `About` | **nothing** |
| 4 | `folder.png` | 58×59, `object-fit: cover` | `Projects` | **nothing** |

**CORRECTION — these four shortcuts are INERT.** An earlier draft of this spec wired them to
`onOpen`. That was wrong. Verified by clicking each one with a real pointer (not synthetic
events) and re-counting open windows: the count stays at 1 (`Recycle Bin`) every time. They
carry `cursor: pointer` but have no handler and no `href`. Render them as non-interactive
markup — no `<button>`, no `<a>`, no `onOpen` prop.

### Image grid — four columns, top to bottom

| Column | Items (asset @ rendered height) |
| --- | --- |
| 1 | `gallery-01.png` @ 269px, then `projects-10.png` @ 158px |
| 2 | `gallery-04.png` @ 225px, then `gallery-07.png` @ 225px |
| 3 | `gallery-06.png` @ 182px |
| 4 | `gallery-02.png` @ 225px |

All are 194px wide. `alt="Image"` on the live site — use `alt=""` (decorative) in the clone.

Verified offsets (relative to window): col1 `20,192` and `20,478`; col2 `230,192` and `230,433`;
col3 `440,192`; col4 `650,192`. Total grid block `824×465`.

## States & Behaviours

### Hover
The four shortcuts have `cursor: pointer`. The live site does not apply a measurable transform to
them (unlike the desktop icons and the dock). Add a subtle `hover:opacity-80`
`transition-opacity duration-200` and nothing more — do NOT add a scale.

### Grid images
Not interactive. No hover, no lightbox, no click handler.

### Scroll
Content height is `717px` against a `630px` viewport, so the body scrolls ~87px. The scrollbar is
hidden (`WindowFrame` already applies `.portos-scroll`).

## Text Content (verbatim)
- `About`
- `Projects`

That is the entire text content of this window.

## Responsive Behavior
The window is a fixed 864px-wide surface, and `WindowFrame` caps it at `max-w-[calc(100vw-16px)]`.
Below ~864px the grid must not overflow:
- Keep the 4×194px grid at `min-[880px]:` and above.
- Below that, use `grid-template-columns: repeat(2, minmax(0, 1fr))` and let image widths go fluid
  (`w-full`, keep the same aspect ratios via `aspect-ratio` derived from `194 / height`).
- The shortcut row wraps naturally; add `flex-wrap: wrap` so it never overflows.

This is an adaptation, not a measurement — the live site does not resize its windows below 864px,
it just clips them. Note it in your report.

## Props
```ts
interface RecycleBinWindowProps {
  onOpen: (app: PortosAppId) => void;
}
```
Export as a named export: `export function RecycleBinWindow({ onOpen }: RecycleBinWindowProps)`.
Import `PortosAppId` and `PORTOS_ASSETS` from `@/types/portos`.

## Notes
- **Tailwind preflight sets `img { height: auto }`.** `next/image` `width`/`height` props alone
  will NOT give you the measured height — you must also set explicit height classes
  (e.g. `h-[269px] w-[194px]`) or the images will render at their intrinsic ratio.
- Verify `npx tsc --noEmit` passes before finishing.
