# DesktopIcons Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/DesktopIcons.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/desktop-1440-viewport.png`
- **Interaction model:** click-driven (single click opens a window) + hover (icon scales down)

## DOM Structure

```
"All File & Title"                    flex-col, items-start, gap 85
  ├─ "About & Wallpaper Card"         flex-row, justify-between, items-center, w-full, pr-[100px]
  │    ├─ icon "About"
  │    └─ icon "Wallpaper"
  └─ "Journal File & Title Wrapper"   holds the single "Projects" icon at the left
       └─ icon "Projects"             wrapper has padding-top: 13px
```

Each icon:
```
button (58 × 78.59)                   flex-col, items-center, justify-center, cursor-pointer
  ├─ "Logo" (58 × 59)                 image wrapper — this is what scales on hover
  └─ <p>label</p>                     19.59px tall
```

## Computed Styles (exact values from getComputedStyle)

### "All File & Title" container
- display `flex`; flexDirection `column`; justifyContent `center`; alignItems `flex-start`
- gap: `85px` (desktop + tablet), `30px` (mobile)
- width: fills the desktop container
- overflow: `clip`

### "About & Wallpaper Card"
- display `flex`; flexDirection `row`; justifyContent `space-between`; alignItems `center`
- padding: `0px 100px 0px 0px` (desktop + tablet) — **no padding on mobile**
- width: `100%`; height `78.59px`

### "Journal File & Title Wrapper" (contains only "Projects")
- Desktop: `58 × 91.59`, the inner "File Card" has `padding: 13px 0 0`
- Tablet: full width, `flex-row`, gap `71px`
- Mobile: `58 × 91.59`, `flex-column`, gap `30px`
- Net visual effect at every breakpoint: the Projects icon sits at the **left edge**, 85px
  (desktop/tablet) or 30px (mobile) below the About/Wallpaper row, plus the 13px card padding.

### Icon image wrapper ("Logo")
- width `58px`; height `59px`
- display `flex`; alignItems `center`; justifyContent `center`
- cursor: `pointer`

### Icon label `<p>`
- fontFamily: SF Pro Display **Regular** → `font-display`
- fontSize `14px`; fontWeight `400`; lineHeight `19.6px`; letterSpacing `-0.14px`
- color: `rgb(255, 255, 255)`
- textShadow: **none** (verified — do not add one)
- textAlign: `start`; the label is centred under the icon by the parent's `align-items: center`

## Items

| Position | Label | Opens |
| --- | --- | --- |
| Top-left | `About` | window `about` |
| Top-right | `Wallpaper` | window `wallpaper` |
| Below top-left | `Projects` | window `projects` |

All three use the **same** folder image:
`/sites/portos-framer-website-67488b6b/root-8a5edab2/images/folder.png` (intrinsic 236×236,
rendered at 58×59, `alt="Logo"` on the live site — render it decorative (`alt=""`) in the clone, NOT the label: the visible
label sits directly below and is already the button accessible name, so repeating it in `alt`
makes every folder announce twice).

## States & Behaviours

### Hover — icon press-in
- **Trigger:** pointer hover anywhere on the icon button.
- **State A:** image wrapper `transform: none` → image renders `58×59` at the wrapper origin.
- **State B:** image wrapper `transform: scale(0.9)` → image renders `52×53`, centred
  (measured: wrapper `66,160 58×59` → image `69,163 52×53`).
- **Transition:** Framer Motion driven, CSS computes to `all`. Use `transition: transform 0.2s ease-out`.
- The **label does not change** on hover — no colour, weight, or shadow change.

### Click
- Single click (not double click) opens the corresponding window.
- The live site keeps the element focusable; render each icon as a `<button type="button">`.

### Selected state
None. Clicking does not leave the icon highlighted. `N/A`.

## Text Content (verbatim)
- `About`
- `Wallpaper`
- `Projects`

## Responsive Behavior

| | Desktop (≥1200) | Tablet (810–1199) | Mobile (≤809) |
| --- | --- | --- | --- |
| Column gap between the two rows | `85px` | `85px` | `30px` |
| `About & Wallpaper Card` right padding | `100px` | `100px` | `0` |
| Icon size | `58×59` | `59×59` (treat as 58×59) | `58×59` |
| Label | unchanged at every breakpoint | | |

- **Breakpoint:** `810px`. Use arbitrary variants (`max-[809px]:gap-[30px]`,
  `max-[809px]:pr-0`) since Tailwind's default breakpoints do not line up.
- The About/Wallpaper row is always `justify-between` across the full container width, so on
  mobile the two icons sit hard against the left and right container edges.

## Props
```ts
interface DesktopIconsProps {
  onOpen: (app: PortosAppId) => void;
}
```
Import `PortosAppId` and `PORTOS_ASSETS` from `@/types/portos`.

## Notes
- Use `next/image` with `width={58} height={59}`.
- Verify `npx tsc --noEmit` passes before finishing.
