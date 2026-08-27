# PreLoader Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/PreLoader.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/state-preloader-frame1.png`
  (the background, captured with time dilated 12×)
- **Interaction model:** time-driven — plays once on mount, then removes itself.

## DOM Structure

```
"Pre-Loader"                fixed inset-0, z-index 10, flex center, overflow clip
  └─ "Variant 1/3"          w-full h-full, flex-col, justify-between, items-center, overflow clip
       └─ "container-wrap"  w-full, flex-col, justify-end, items-center, overflow clip
            └─ "container-mask"     absolute, inset-x-[-144px], bottom-[10px], z-4, overflow clip
                 ├─ <img> background (object-fit cover)
                 └─ "content-container"  relative, z-index 2, p-3, flex-col, center, overflow clip
                      ├─ <img> background (object-fit cover, absolute fill)
                      └─ "middle"        flex, items-center, justify-center
                           └─ "Title Wrapper"  flex-col, items-center, justify-center, gap 8, z-index 1
                                ├─ <h5>
                                ├─ <h1>
                                └─ <p>   ← per-letter reveal

CORRECTION (verified on the live site with `mask.contains(content) === true`):
`content-container` is a **CHILD of `container-mask`**, not its sibling. `container-mask` is the
ONLY child of `container-wrap`. This is what makes the headline visible over the mask's background
image, and it is what makes the text get clipped by the ellipse as the mask collapses.
```

## Computed Styles (exact values from getComputedStyle)

### "Pre-Loader"
- position `fixed`; top `0`; left `0`; width `100%`; height `100%`; zIndex `10`
- display `flex`; justifyContent `center`; alignItems `center`; overflow `clip`

### "container-wrap"
- width `100%`; display `flex`; flexDirection `column`; justifyContent `flex-end`;
  alignItems `center`; gap `10px`; overflow `clip`
- **height is the animated property:** `900px` (viewport height) → `2px`

### "container-mask"
- position `absolute`; left `-144px`; right `-144px`; **bottom `10px`**; height `900px` (viewport height)
- width `1728px` at a 1440px viewport — i.e. `100% + 288px`
- zIndex `4`; overflow `clip`
- display `flex`; justifyContent `center`; alignItems `center`
- **borderRadius is the animated property:** `0px` → `50%`
- Because it is bottom-anchored inside `container-wrap`, collapsing the wrap's height from
  900 → 2 drives the mask up and out of frame (final measured `top: -908px`).

### "content-container"
- position `relative`; zIndex `2`; width `calc(100% - ~2px)`; height `100%`
- padding `12px`; display `flex`; flexDirection `column`; justifyContent `center`;
  alignItems `center`; gap `10px`; overflow `clip`

### "Title Wrapper"
- width `433px`; display `flex`; flexDirection `column`; justifyContent `center`;
  alignItems `center`; gap `8px`; zIndex `1`

### `<h5>` — "Hey, I'm Jalvy! Welcome to my"
- fontFamily: **SF Pro Text Thin** → `font-sans` + `font-[200]`
- fontSize `25px`; fontWeight `200`; lineHeight `32.5px`; letterSpacing `-0.5px`
- color: `rgba(255, 255, 255, 0.7)`; textAlign `center`; whiteSpace `pre`

### `<h1>` — "Portfolio"
- fontFamily: **SF Pro Display Bold** → `font-display` + `font-bold`
- fontSize `116px`; fontWeight `700`; lineHeight `116px`; letterSpacing `-1.16px`
- color: `rgb(255, 255, 255)`; textAlign `start`; whiteSpace `pre`

### `<p>` — "Explore it like a Mac."
- fontFamily: **SF Pro Text Regular** → `font-sans`
- fontSize `12px`; fontWeight `400`; lineHeight `16.8px`; letterSpacing `normal`
- color: `rgba(255, 255, 255, 0.8)`; textAlign `center`; whiteSpace `pre`

## States & Behaviours

### 1. Entrance (Framer appear animation, exact config from `__framer__appearAnimationsContent`)
```json
{ "initial": { "opacity": 1, "scale": 3, "y": 24 },
  "animate": { "opacity": 1, "scale": 1, "y": 0,
    "transition": { "type": "tween", "duration": 1, "ease": [0.86, 0, 0.14, 1], "delay": 0 } } }
```
Applies to the loader content. CSS equivalent:
`transform: scale(3) translateY(24px) → scale(1) translateY(0)` over `1s`
with `cubic-bezier(0.86, 0, 0.14, 1)`.

### 2. Per-letter reveal of the tagline
- The `<p>` is split into **23 `<span>`s** — one per character of `Explore it like a Mac.`
  (including the three spaces; the `.` is its own span).
- **State A (per span):** `display: inline-block; opacity: 0.001; filter: blur(10px);
  transform: translateY(10px)`
- **State B:** `opacity: 1; filter: blur(0); transform: translateY(0)`
- Staggered per letter. Use the `portos-letter-in` keyframe already defined in `globals.css`:
  ```css
  @keyframes portos-letter-in {
    from { opacity: 0.001; filter: blur(10px); transform: translateY(10px); }
    to   { opacity: 1; filter: blur(0); transform: translateY(0); }
  }
  ```
  Apply with `animation: portos-letter-in 0.5s ease-out both; animation-delay: calc(var(--i) * 30ms)`.
- Spaces must still occupy width — render ` ` (or `white-space: pre` on the span) so the
  words stay separated.

### 3. Exit
- **Trigger:** a timer, ~2.6s after mount (entrance 1s + letter stagger ~0.7s + a beat).
- `container-wrap` height: `100vh → 2px`
- `container-mask` borderRadius: `0 → 50%`
- Duration ~`1s`, ease `cubic-bezier(0.86, 0, 0.14, 1)` (same curve as the entrance).
- After the exit completes, unmount the loader entirely (the live site leaves it in the DOM but
  fully off-screen; unmounting is equivalent and cleaner).

## Assets
- Background (used **twice** — once in `container-mask`, once in `content-container`):
  `/sites/portos-framer-website-67488b6b/root-8a5edab2/images/preloader-bg.png`
  — intrinsic 1728×972, a blue/purple gradient wave. `object-fit: cover`, `alt=""`.
- **Both copies are required.** The mask copy is what survives inside the shrinking ellipse;
  the content copy sits behind the text at a slightly inset size.

## Text Content (verbatim)
```
Hey, I'm Jalvy! Welcome to my
Portfolio
Explore it like a Mac.
```
Note the apostrophe in `I'm` is a straight `'` (U+0027) on the live site.

## Responsive Behavior

| | Desktop (≥1200) | Tablet (810–1199) | Mobile (≤809) |
| --- | --- | --- | --- |
| `<h1>` | `116px / 116px`, `-1.16px` | `100px / 100px`, `-1px` | `70px / 70px`, `-0.7px` |
| `<h5>` | `25px / 32.5px`, `-0.5px` | `20px / 26px`, `-0.4px` | `16px / 20.8px`, `-0.32px` |
| `<p>` | `12px / 16.8px` | `12px / 16.8px` | `12px / 16.8px` |
| `container-mask` horizontal bleed | `-144px` each side | `-144px` | `-144px` |

- **Breakpoints:** `810px` and `1200px`. Use arbitrary variants —
  `text-[70px] min-[810px]:text-[100px] min-[1200px]:text-[116px]` etc.

## Props
```ts
interface PreLoaderProps {
  onFinish?: () => void; // called once the exit animation completes
}
```

## Notes
- The component must be a client component (`"use client"`), it owns a timer.
- Respect `prefers-reduced-motion` — `globals.css` already collapses animation durations under
  `.portos-root`, but the loader should still call `onFinish` promptly in that case.
- Verify `npx tsc --noEmit` passes before finishing.
