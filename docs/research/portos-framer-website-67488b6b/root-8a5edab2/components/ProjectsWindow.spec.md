# ProjectsWindow Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/ProjectsWindow.tsx`
- **Screenshots:**
  - `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/window-projects-masonry-state.png`
  - `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/window-projects-grid-state.png`
- **Interaction model: CLICK-DRIVEN.** A `Masonry ⟷ Grid` switch in the **title bar** swaps the
  image heights. Verified by clicking it and re-measuring, not by guessing. It is **not**
  scroll-driven and there are no per-card interactions.
- **Renders the window BODY + the title-bar accessory.** `WindowFrame` accepts a
  `titleBarAccessory` prop — the toggle goes there.

All coordinates are **relative to the window's top-left corner** (window `864 × 630`).
Title bar is `0,0 864×44`; the body starts **50px** below it, so content begins at `y = 94`.

## The title-bar toggle ("Tab Button")

Box `739,13 113×17`, `display: flex`, `align-items: center`, `justify-content: center`, `gap: 4px`.
Three children: the `Masonry` label, the switch, the `Grid` label.

### Labels
- fontFamily **SF Pro Text Regular** → `font-sans`
- fontSize `12px`; fontWeight `400`; lineHeight `16.8px`; letterSpacing `normal`
- **Active label:** `color: rgb(0, 0, 0)`
- **Inactive label:** `color: rgba(0, 0, 0, 0.2)`
- `Masonry` box `49×17`, `Grid` box `24×17`

### Switch track
- `33 × 17`
- `background: transparent` — it is an **outline pill, not a filled one**
- `border: 0.57px solid rgb(0, 0, 0)`
- `border-radius: 46px`
- `display: flex`; `align-items: center`
- `cursor: pointer`; `tabindex="0"` on the live site

### Switch knob ("Black Dot")
- `9 × 9`; `background: rgb(0, 0, 0)`; `border-radius: 999px`

### The two states — the knob moves via the track's PADDING
| State | Track padding | Knob box |
| --- | --- | --- |
| Masonry (default) | `4px 20px 4px 4px` | `795,17 9×9` (left) |
| Grid | `4px 4px 4px 20px` | `811,17 9×9` (right) |

Animate the knob's horizontal position with a `~0.25s ease` transition, and cross-fade the two
label colours over the same duration.

## Body layout — identical in both states

```
"Container"       0,94  864×…    flex, justify-center, items-center, padding 0 20px 60px, max-w 1152px
  └─ "Content"   20,94  824×…    flex-col, items-center, justify-center, gap 64px
       └─ "All Card"  824×…      flex-col, items-center, justify-center, gap 24px
            ├─ row 1  824×…      flex-row, justify-center, items-FLEX-START, gap 16px  (4 cards)
            ├─ row 2  824×…      same
            └─ row 3  824×…      same
```

Each card is `194px` wide:

```
card
  └─ "Title & Image"   flex-col, justify-center, items-FLEX-END, gap 8px
  │      ├─ <p> title       (right-aligned — items-flex-end is why)
  │      └─ <img>           194 × H, object-fit cover, border-radius 0
  └─ <p> description        194 wide, 34 tall (2 lines) — OMITTED on three cards in Masonry
```
The card wrapper is `flex-col`, `align-items: center`, `gap: 8px`.

> **The title sits ABOVE the image and is RIGHT-ALIGNED.** `Title & Image` has
> `align-items: flex-end`. This is easy to get wrong — check the screenshots.

### Typography
- **Card title:** SF Pro Display **Medium** → `font-display font-medium`; `14px / 19.6px`;
  `letter-spacing: -0.28px`; `color: rgb(0, 0, 0)`; height `20px`
- **Card description:** SF Pro Text Regular → `font-sans`; `12px / 16.8px`;
  `letter-spacing: normal`; `color: rgba(0, 0, 0, 0.7)`; width `194px`, height `34px`

## Content — all 12 cards, in order

Asset base: `/sites/portos-framer-website-67488b6b/root-8a5edab2/images/`

| # | Title | Asset | Masonry height | Grid height | Description |
| --- | --- | --- | --- | --- | --- |
| 1 | `Through Form` | `projects-01.png` | 108 | 161 | `Crafted to balance texture, precision, and visual rhythm.` |
| 2 | `Industrial Echo` | `projects-02.png` | 247 | 161 | `Exploring minimal surfaces through light and geometry.` |
| 3 | `Liquid Motion` | `projects-03.png` | 133 | 161 | `A study of movement, color, and tactile realism.` |
| 4 | `Crystal Bloom` | `projects-04.png` | 273 | 161 | `Natural elements reimagined with refined composition.` — **hidden in Masonry** |
| 5 | `Quiet Luxury` | `projects-05.png` | 273 | 161 | `Minimal fashion with timeless silhouettes and detail.` — **hidden in Masonry** |
| 6 | `Human Form` | `projects-06.png` | 108 | 161 | `Portraits that celebrate confidence and authenticity.` |
| 7 | `Monolith` | `projects-07.png` | 215 | 161 | `Architectural objects inspired by balance and proportion.` |
| 8 | `Soft Geometry` | `projects-08.png` | 247 | 161 | `Playful forms with bold color and sculptural depth.` |
| 9 | `Organic Flow` | `projects-09.png` | 108 | 161 | `Textures shaped by nature and fluid movement.` |
| 10 | `Glass Bloom` | `projects-10.png` | 215 | 161 | `Transparent materials brought to life through light.` |
| 11 | `Golden Hour` | `projects-11.png` | 273 | 161 | `Editorial portrait captured with warmth and elegance.` — **hidden in Masonry** |
| 12 | `Modern Carry` | `projects-12.png` | 133 | 161 | `Designed around simplicity, craftsmanship, and function.` |

Rows are cards 1–4, 5–8, 9–12.

### Per-state differences — that is the WHOLE toggle
| | Masonry | Grid |
| --- | --- | --- |
| Image height | varies per card (column above) | **uniform `161px`** |
| Descriptions | cards 4, 5, 11 have **none** | **all 12 have one** |
| Row height | `316px` | `231px` |
| `Content` height | `980px` | `740px` |
| Window scroll height | `1134px` | `894px` |

Cards 4, 5 and 11 keep their description text in the data but **do not render it in Masonry mode**.
All three strings were read from the live site in Grid mode and are in the table above — they are
measured, not invented. Store one description per card and simply hide those three in Masonry.

## States & Behaviours

### Toggle click
- **Trigger:** click anywhere on the switch track (the live site puts `cursor: pointer` and
  `tabindex="0"` on the track only — the two text labels are **not** clickable, they show
  `cursor: grab`, inherited from the draggable window).
- Make the track a real `<button type="button">` with `role="switch"` and `aria-checked`.
- Mark it `data-no-drag` so clicking it does not start a window drag.

### Card hover
**None.** Verified — no transform, no opacity change, no cursor change on cards or images.
Do not add any.

### Scroll
Masonry `1134px` and Grid `894px` of content against a `630px` viewport. Scrollbar hidden
(`WindowFrame` applies `.portos-scroll`).

## Text Content (verbatim)
Window title: `Overview of the Project` (rendered by `WindowFrame`).
Toggle labels: `Masonry`, `Grid`.
All card titles and descriptions are in the table above — copy them exactly, including the
Oxford comma in `texture, precision, and visual rhythm.` and the US spelling `color`.

## Responsive Behavior
The live site does not reflow its windows below 864px — it clips them. `WindowFrame` caps the
window at `max-w-[calc(100vw-16px)]`. Add a graceful fallback:
- `min-[880px]:` and above — the measured 4-across rows at `194px`.
- Below that — 2 across, cards `flex-1` with `aspect-[194/<height>]` on the image.
- `max-[520px]:` — 1 across.
Flatten the three fixed rows into a single wrapping flex/grid so the reflow works.
This is an adaptation, not a measurement. Note it in your report.

## Props
```ts
// The toggle is rendered into WindowFrame's `titleBarAccessory`, so this component
// owns the toggle state and exposes it:
export function ProjectsWindow()          // body
export function ProjectsToggle(props: { mode: "masonry" | "grid"; onChange: (m: "masonry" | "grid") => void })
```
Prefer a single component that owns the state and renders BOTH, e.g.:
```ts
export function useProjectsMode(): { mode, setMode }
```
Simplest workable shape: `ProjectsWindow` takes `{ mode, onModeChange }` and a separate exported
`ProjectsToggle` takes the same — the page wires both. Pick whichever you find cleanest and
document it in your report.

## Notes
- **Tailwind preflight sets `img { height: auto }`** and Tailwind's JIT **cannot see class names
  built from data** (`h-[${n}px]` produces no CSS). Use inline `style` or a CSS custom property
  for the per-card height.
- Verify `npx tsc --noEmit` and `npx eslint <file>` before finishing.

## Requested redesign — what no longer matches the live site

Everything above still describes the ORIGINAL and is kept for that reason. The
window itself was rebuilt on the owner's request and now shares almost nothing
with it but the chrome and the title-bar switch mechanics.

| | Live site | Here |
| --- | --- | --- |
| Cards | 12 stock photos | 6 real projects |
| Card width | 194px, 4 across | 404px, 2 across |
| Switch | Masonry / Grid crop heights | Grid / List column count |
| Interaction | none at all | 5 of 6 cards open a link |
| Card body | title above image, description under | image, period, title, description, stack tags |

### Why the layout had to change

The original's twelve cards hold stock photography, where a tall ragged crop is
the point of Masonry. These hold UI screenshots at 1913x912 (2.1:1). A 194px
portrait crop would have thrown away most of every interface, so the switch picks
a column count instead: 404x192 two-up, or 824x392 single. At 824 the dashboard
text is legible; at 194 it would not have been.

### Content and assets

All six projects — wording, periods, stack lists and screenshots — come from the
owner's own portfolio at lengocha.vercel.app, not from anything invented here.
The screenshots were pulled from `/_astro/<hashed>.png`, which serves the
unresized originals at ~1913x912; the page itself only ever requests 610x290
through the image service, which would have been too small for an 824px card.

Two content gaps, both on the source portfolio rather than here:

- its copy says "Seven products across four employers" but renders six cards;
- Minastik JSC and FPT Software appear in the career timeline with no project.

`Newsletter builder` is the one card with no `href` — no public URL and no
write-up — so it renders as a plain `<div>` rather than a dead link.

### Two things that will break if touched

**`data-no-drag` on every card.** The window is draggable and `WindowFrame`
checks for that attribute. Without it a click that travels a single pixel is
swallowed as a drag and the link never fires.

**`min-h-0` on the screenshot box.** The box is a flex item, so it carries
`min-height: auto`, which resolves to the image's intrinsic height. For any
screenshot FLATTER than the 2.1 ratio that minimum is taller than the ratio asks
for, so it silently wins and `aspect-ratio` is ignored. Two of the six are
flatter — Newsletter at 2.061 and EVN at 2.093 — which is exactly how it showed
up: four boxes at 192.53px and two at 196.31 and 193.16. With `min-h-0` all six
measure 192.38px, spread 0.00.

### Leftover assets

`projects-01.png` through `projects-12.png` are the template's stock photography
and are now referenced by nothing. They are left on disk deliberately — deleting
them is the owner's call, and the download script restores them either way.
