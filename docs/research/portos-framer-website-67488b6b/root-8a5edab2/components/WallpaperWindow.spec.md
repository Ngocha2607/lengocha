# WallpaperWindow Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/WallpaperWindow.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/state-wallpaper-window.png`
- **Interaction model:** **time-driven** (auto-advancing carousel) **+ click** on the page dots.
  Not scroll-driven. Not hover-driven.
- **Renders the window BODY only** — `WindowFrame` supplies the chrome.

This window is **smaller than every other window**: `720 × 596` at `(360, 89)`, and it does **not**
scroll — the content fits exactly.

## DOM Structure

```
window body        0,0  720×596   flex-col, items-center, justify-start, gap 32px, bg #f7f7f7
  ├─ title bar     0,0  720×44    (WindowFrame)
  └─ "Container"   0,76 720×520   flex, justify-center, items-center, padding 0 20px 20px
       └─ "Content" 20,76 680×500 flex-col, items-start
            └─ carousel viewport  680×500, overflow hidden, position relative
                 ├─ track — slides laid out horizontally, each 680×500, 10px apart
                 └─ dots  315,536 90×30  (absolutely positioned over the image)
```

Note the body gap here is **32px**, not the 50px used by the other windows.
So `Container` starts at `y = 44 + 32 = 76`.

## Computed Styles (exact values from getComputedStyle)

### Window body
- backgroundColor `rgb(247, 247, 247)`
- display `flex`; flexDirection `column`; justifyContent `flex-start`; alignItems `center`
- **gap `32px`**

### "Container"
- padding: `0px 20px 20px`
- display `flex`; justifyContent `center`; alignItems `center`; width `100%`

### "Content" / carousel viewport
- width `680px`; height `500px`
- `overflow: hidden`, `position: relative`

### Slides
- Each slide image: `680 × 500`, `object-fit: cover`, `border-radius: 0`, `alt=""`
- Horizontal step between slides: **690px** (680 wide + **10px gap**)

### Dot indicator pill
- container box `315,536 90×30` — horizontally centred (`(720 − 90) / 2 = 315`),
  overlapping the bottom of the image (image spans y 76→576, pill spans 536→566, i.e. 10px
  above the image's bottom edge)
- backgroundColor `rgba(0, 0, 0, 0.2)`
- borderRadius `50px`
- display `flex`; justifyContent `center`; alignItems `center`

### Dots
- Each dot: `10 × 10`, `border-radius: 50%`, `background: rgb(255, 255, 255)`
- Spacing: dot centres at x `325, 345, 365, 385` → **10px gap** between 10px dots
- **Active dot:** `opacity: 1`
- **Inactive dot:** `opacity: 0.5`
- The clickable hit areas are `<button>`s of `25×30 / 20×30 / 20×30 / 25×30` filling the pill.
- Accessible names on the live site: `Scroll to page 1` … `Scroll to page 4`.

## Content — exact items

Asset base: `/sites/portos-framer-website-67488b6b/root-8a5edab2/images/`

| Slide | Asset |
| --- | --- |
| 1 | `wallpaper-01.png` |
| 2 | `wallpaper-02.png` |
| 3 | `wallpaper-03.png` |
| 4 | `wallpaper-04.jpg` |

Four unique wallpapers. The live site duplicates the set four times in the DOM to fake an
infinite loop — reproduce the *behaviour* (wrap-around), not the DOM duplication.

## States & Behaviours

### Auto-advance (verified by sampling the dot opacities once per second)
- **Trigger:** a timer. The active dot cycles `1 → 2 → 3 → 4 → 1 …`
- **Measured interval: ~2 seconds per slide.**
- **Transition:** the track slides horizontally; the dot opacity cross-fades (intermediate values
  such as `0.898 / 0.602` were captured mid-transition, confirming a tween rather than a snap).
  Use a `~0.6s` ease transition on the track transform and on dot opacity.
- Wraps around infinitely — after slide 4 it returns to slide 1.

### Dot click
- Clicking a dot jumps to that slide.
- Sensible addition: reset the auto-advance timer on click so the carousel does not immediately
  move on. (The live site's exact behaviour here was not measurable; note it in your report.)

### Prev / Next arrows — DO NOT RENDER
The live site has `<button aria-label="Previous">` and `<button aria-label="Next">` in the DOM
with `background: rgba(0,0,0,0.2)`, `border-radius: 40px`, `40×40` — but their computed
`display` is **`none`**, at rest *and* under a real pointer hover (verified with a genuine
`hover`, not just synthetic events). Framer's carousel emits them and the config hides them.
**Do not render arrows in the clone.** The two arrow SVGs are downloaded
(`wallpaper-arrow-prev.svg`, `wallpaper-arrow-next.svg`) but are intentionally unused.

### Clicking a wallpaper
Does **NOT** change the desktop background — verified (`before === after`). The slides are not
clickable. Do not wire them up.

### Scroll
None. Content height `596px` exactly fits the window. Do not add a scroller.

## Text Content (verbatim)
**None.** The only text is the window title `Wallpaper`, which lives in `WindowFrame`.

## Responsive Behavior
The window is a fixed 720px surface; `WindowFrame` caps it at `max-w-[calc(100vw-16px)]`.
Make the carousel fluid so it never overflows:
- Viewport: `w-full max-w-[680px]`, `aspect-[680/500]` instead of a hard 500px height.
- Track: translate by `calc(index * 100% + index * 10px)` so the 10px gap survives at any width.
- Dot pill: keep `90×30` at every size, absolutely centred `10px` above the image's bottom edge.

This is an adaptation, not a measurement — the live site clips rather than reflows below 720px.

## Props
```ts
// No props.
export function WallpaperWindow()
```
Needs `"use client"` — it owns a timer and click handlers.

## Notes
- Import `PORTOS_ASSETS` from `@/types/portos`.
- Clear the interval on unmount.
- Under `prefers-reduced-motion: reduce`, stop auto-advancing and leave the dots clickable.
- **Tailwind preflight sets `img { height: auto }`** — set explicit sizing (`h-full w-full
  object-cover` inside an aspect-ratio box works well here).
- Verify `npx tsc --noEmit` passes before finishing.
