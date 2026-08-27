# Dock Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/Dock.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/desktop-1440-viewport.png` (bottom strip)
- **Interaction model:** click-driven (opens windows / external links) + hover (icon scales down)

## DOM Structure

```
Dock bar ("Menu Bar")                      flex, items-center, justify-center, gap 16
  ├─ wrapper ("Menu Wrapper")              flex, items-center, justify-center, gap 6
  │    └─ 8 × app icon (76×76)
  ├─ divider ("Line")                      1×72
  └─ trash ("Recycle Bin")                 76×76
```

The dock is horizontally centred and sits at the bottom of the desktop container.

## Computed Styles (exact values from getComputedStyle)

### Dock bar — desktop (1440) and tablet (900)
- width `775px`; height `94px`
- backgroundColor: `rgba(40, 40, 40, 0.6)`
- backdropFilter: `blur(14px)`
- borderRadius: `24px`
- boxShadow: `rgba(0, 0, 0, 0.24) 0px 3px 3px 0px`
- padding: `9px 8px`
- display `flex`; justifyContent `center`; alignItems `center`; gap `16px`
- overflow: `clip`

### Wrapper
- width `650px`; height `76px` (desktop) / `73px` (tablet)
- display `flex`; justifyContent `center`; alignItems `center`; gap `6px`
- overflow `clip`

### App icon
- 76×76 (desktop), 73×73 (tablet), 34×34 (mobile)
- The image fills the box; `border-radius: 0` (the rounded-square look is baked into the PNGs)
- cursor: `pointer`

### Divider ("Line")
- width `1px`; height `72px` (desktop/tablet), `32px` (mobile)
- backgroundColor: `rgb(104, 104, 104)`

### Trash
- 76×76 (desktop/tablet), 34×34 (mobile) — note the trash stays **76px on tablet** while the
  eight app icons shrink to 73px.

## Items — exact order, assets and targets

Base: `/sites/portos-framer-website-67488b6b/root-8a5edab2/images/`

| # | Live `data-framer-name` | Image | Opens |
| --- | --- | --- | --- |
| 1 | `projects` | `dock-finder.png` | window `projects` |
| 2 | `Journal` | `dock-launchpad.png` | window `journal` |
| 3 | `contact` | `dock-contacts.png` | window `contact` |
| 4 | `Resume` | `dock-messages.png` | window `resume` |
| 5 | `Instagram` | `dock-instagram.png` | **external** `https://www.instagram.com/rk.abir000?igsh=MTU0b2Y4azc1NGVudg==` — `target="_blank" rel="noreferrer noopener"` |
| 6 | `About` | `dock-notes.png` | window `about` |
| 7 | `Framer` | `dock-framer.png` | **external** `https://framer.link/r-k-abir` — `target="_blank" rel="noreferrer noopener"` |
| 8 | `Gallery` | `dock-photos.png` | window `gallery` |
| — | `Line` divider | — | — |
| 9 | `Recycle Bin` | `dock-trash.png` | window `recycleBin` |

All icons carry `alt="Icon"` on the live site; use a meaningful alt in the clone
(e.g. `alt="Finder"`, `alt="Instagram"`) since these are interactive controls.

### Artwork inset — the icons are not full-bleed

Each PNG bakes in a transparent margin, so the visible artwork is smaller than
the 76px slot it sits in. Measured at 4x supersampling on the rendered pixels:

| Asset | Artwork in a 76px slot | % of slot |
| --- | --- | --- |
| `dock-finder` / `launchpad` / `messages` / `photos` | 62.5px | 81.64% |
| `dock-contacts` | 65.25px | 85.9% |
| `dock-notes` | 67.5px | 88.7% |
| `dock-trash` | 55.5 x 69.5px | 73.0% |

**81.64% is the baseline** — four of the eight app icons agree on it exactly. Any
replacement icon must reproduce that margin inside its own canvas, or it renders
~23% larger than its neighbours. Prefer baking the inset into the asset over
scaling in CSS, so the component stays uniform across every item.

#### Do NOT normalise Contacts or the Recycle Bin

Both sit outside the 81.64% baseline in the table above, and both are correct as
drawn. This was checked by profiling the left and right opaque edge row by row.

**Contacts** — its tile is pixel-identical to Finder. Sampling every 4 slot-px, the
left edge matches Finder at *every* row (15.5, 10.0, 7.8, 6.8 …), and so do all four
corner curves (y=8 → 15.3, y=12 → 10.0, y=64 → 9.8, y=68 → 14.5). Only the middle
band, y=16 to y=60, bleeds 2.8px further right. That bleed is the address book's
coloured index tabs — green, orange, red and blue slivers visible past the tan tile.
It is a design element, not a sizing error. Insetting Contacts to a 62.5px bbox would
shrink the *tile* below every other tile purely to hide those tabs.

**Recycle Bin** — a bare object rather than a tile, so the tile baseline does not apply.
It is 6.2px taller than the app icons but 7px narrower (55.5 vs 62.5) and carries ~20%
less opaque area (2875 vs 3582 in 76px-slot units), so it already reads *lighter* than
its neighbours, not heavier. Insetting it to match tile height would make that worse.
It also keeps its 76px slot at the 810px breakpoint while the app icons drop to 73px —
see the sizing note above; that asymmetry is measured from the live site.

Ink area is the wrong metric for this family of checks in general: Launchpad is a grid
of separated squares, so its opaque area (2824) reads 8.7% "small" while its bbox is
an exact 62.5px match. Compare bounding boxes for tiles; compare nothing for the bin.

## States & Behaviours

### Hover — icon press-in
- **Trigger:** pointer hover on an individual dock item.
- **State A:** icon wrapper `transform: none` → renders 76×76.
- **State B:** icon wrapper `transform: scale(0.9)` → renders 68×68, centred (measured
  `516,795 68×68` inside a `513,791 76×76` slot).
- **Transition:** Framer Motion driven; CSS `transition` computes to `all`. Use
  `transition: transform 0.2s ease-out`.
- **Note:** this is a *shrink*, not macOS dock magnification. Do not build magnification.

### Click
- App icons call `onOpen(appId)`.
- The two external icons are real `<a>` elements — they must be anchors, not buttons.

## Text Content (verbatim)
None — the dock is icon-only. No tooltips and no running-app indicator dots on the live site.

## Responsive Behavior

| | Desktop (≥1200) | Tablet (810–1199) | Mobile (≤809) |
| --- | --- | --- | --- |
| Bar | `775×94`, radius `24px`, gap `16px`, padding `9px 8px` | identical | `350×52`, radius `12px`, gap `8px`, padding `9px 8px` |
| Wrapper | `650×76`, gap `6px`, `justify-center` | `650×73`, gap `6px`, `justify-center` | `283×34`, gap `6px`, **`justify-start`**, `overflow: clip` |
| App icon | `76×76` | `73×73` | `34×34` |
| Divider | `1×72` | `1×72` | `1×32` |
| Trash | `76×76` | `76×76` | `34×34` |
| Item count | 8 | 8 | **7 — the `Framer` item is removed entirely** |

- **Breakpoint:** `810px`.
- On mobile the bar is `width: 100%` of the desktop container (which is `calc(100vw - 40px)`),
  so express it as `w-full` rather than a hard `350px`.
- Mobile hides the `Framer` item — mark it `hideOnMobile` and apply `max-[809px]:hidden`.

## Props
```ts
interface DockProps {
  onOpen: (app: PortosAppId) => void;
}
```
Import `PortosAppId` and `PORTOS_ASSETS` from `@/types/portos`.

## Notes
- Use `next/image` with `width={76} height={76}` and size down with CSS classes per breakpoint.
- The dock bar must not clip its own shadow — `overflow: clip` is on the bar in the original, so
  keep it, but note the shadow is drawn outside and is unaffected.
- Verify `npx tsc --noEmit` passes before finishing.
