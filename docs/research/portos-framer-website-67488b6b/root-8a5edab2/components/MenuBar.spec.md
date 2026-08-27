# MenuBar Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/MenuBar.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/desktop-1440-viewport.png` (top strip)
- **Interaction model:** static, except a **live clock** that ticks every minute.

## DOM Structure

```
<header>                                  absolute top-0 left-0 w-full, z-index 5
  └─ bar                                  flex, justify-between, items-center
       ├─ left  ("Icon & Name")           flex, items-center, gap 3px
       │    ├─ apple button               37×24, padding 2px 11px, centers a 15×20 img
       │    └─ <p>Jalvy Portfolio</p>
       └─ right ("Icon & Time")           flex, justify-end, items-center, gap 6px
            ├─ nav icons                  flex, justify-end, items-center, gap 3px
            │    └─ 4 × button            37×24, padding 2px 11px, centers a 15×20 img
            ├─ <p>date</p>
            └─ <p>time</p>
```

## Computed Styles (exact values from getComputedStyle)

### header
- position: `absolute`; top `0`; left `0`; width `100%`; height `29px`; zIndex `5`

### bar (the visible strip)
- backgroundColor: `rgba(0, 0, 0, 0.1)`
- backdropFilter: `blur(82px)`
- padding: `3px 11px 2px 4px`
- height: `29px`
- display: `flex`; justifyContent: `space-between`; alignItems: `center`
- overflow: `clip`

### icon button (all five — apple + 4 nav icons)
- width `37px`; height `24px`
- padding: `2px 11px`
- display `flex`; justifyContent `center`; alignItems `center`
- overflow `clip`
- inner image box: `15px × 20px`

### `<p>` "Jalvy Portfolio"
- fontFamily: SF Pro Display **Bold** → use `font-display` + `font-bold`
- fontSize `12px`; fontWeight `700`; lineHeight `18px`; letterSpacing `normal`
- color: `rgb(255, 255, 255)`
- whiteSpace: `pre`

### `<p>` date and `<p>` time
- fontFamily: SF Pro Display **Medium** → `font-display` + `font-medium`
- fontSize `14px`; fontWeight `500`; lineHeight `16px`; letterSpacing `normal`
- color: `rgb(255, 255, 255)`
- whiteSpace: `nowrap`

## Assets (all already downloaded — use these exact paths)

Base: `/sites/portos-framer-website-67488b6b/root-8a5edab2/images/`

| Slot | File | Intrinsic |
| --- | --- | --- |
| Apple logo (left) | `menubar-apple.svg` | 13×16 |
| Nav icon 1 — wifi | `menubar-wifi.png` | 60×44 |
| Nav icon 2 — search | `menubar-search.svg` | 13×13 |
| Nav icon 3 — control centre | `menubar-account.svg` | 14×14 |
| Nav icon 4 — account | `menubar-control-center.svg` | 13×13 |

All five render at `15px × 20px` with `object-fit: contain`. `alt=""` (decorative) except the
apple logo, which the live site labels `Icon` — keep them decorative in the clone.

## States & Behaviours

### Live clock
- **Trigger:** time. The live site renders the visitor's **local** date and time.
- Date format: `M/D/YYYY` (e.g. `8/27/2026`) — US-style, no leading zeros.
- Time format: `h:mm AM/PM` (e.g. `9:00 AM`) — 12-hour, no leading zero on the hour.
- Implementation: render nothing time-dependent on the server. Start with `null`, fill in on mount
  in a `useEffect`, then update on an interval. **This must not cause a hydration mismatch** —
  gate the first paint behind a mounted flag.
- Suggested: `new Intl.DateTimeFormat("en-US", { month: "numeric", day: "numeric", year: "numeric" })`
  and `{ hour: "numeric", minute: "2-digit", hour12: true }`.

### Hover
No hover state on any menu bar element on the live site — the icons do not change. `N/A`.

## Text Content (verbatim)
- `Jalvy Portfolio`
- Date and time are generated, not fixed text.

## Responsive Behavior
Breakpoints: mobile `≤809.98px`, tablet `810–1199.98px`, desktop `≥1200px`.

- **Desktop (1440px) and tablet (900px):** identical — all 4 nav icons, date **and** time.
- **Mobile (390px):** the bar keeps the same `29px` height, padding and blur, but
  - only **one** nav icon is shown: **wifi** (`menubar-wifi.png`)
  - the **date is hidden**; only the time remains
- **Breakpoint:** the change happens at `810px`. Use `max-lg:` style utilities keyed to a
  `min-width: 810px` boundary — Tailwind's default `lg` is 1024px, so use an arbitrary variant
  such as `max-[809px]:hidden` on the three extra icons and on the date.

## Props
```ts
interface MenuBarProps {
  name?: string; // defaults to "Jalvy Portfolio"
}
```
No callbacks — nothing in the menu bar is clickable on the live site.

## Notes
- Use `next/image` with explicit `width`/`height` for the PNGs; SVGs may also go through `next/image`.
- Do **not** add a bottom border — computed `border-bottom` is `0px none`.
