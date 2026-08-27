# BEHAVIORS — portos.framer.website

Everything below was measured with Chrome DevTools MCP against the live site
(`getComputedStyle` / `getBoundingClientRect`), not estimated.

## Global interaction model

**The page does not scroll.** `document.documentElement.scrollHeight === clientHeight === innerHeight`.
It is a single fixed-viewport macOS desktop simulation. There is no scroll-driven behaviour anywhere
at the page level: no parallax, no scroll-snap, no `IntersectionObserver`, no smooth-scroll library
(no `.lenis` / `.locomotive-scroll` class, native scrolling only).

All interactivity is **click-driven** (open/close windows) plus **hover** (icon scale) and
**drag** (window repositioning). Scrolling only ever happens *inside* an open window body.

## Scroll sweep

| Checked | Result |
| --- | --- |
| Page scroll | None — body height == viewport height |
| Header change on scroll | N/A (no page scroll) |
| Elements animating into view | None (no viewport-entry animations) |
| Scroll-snap | None |
| Smooth-scroll library | None |
| Scroll inside windows | Yes — each window body is its own `overflow-y: auto` scroller with a **hidden scrollbar** |

## Pre-loader (runs once on load)

Full-screen `position: fixed; z-index: 10` overlay, present in the DOM from first paint.

- **Background:** `preloader-bg.png` (1728×972 source), `object-fit: cover`, painted twice —
  once in `container-mask` (1728×900, `left/right: -144px`) and once in `content-container` (1438×900).
- **State A (`Variant 1`, initial):** `container-mask` at `top: 0`, `border-radius: 0`;
  `container-wrap` height `900px`.
- **State B (`Variant 3`, exit):** `container-wrap` height animates `900px → 2px` with
  `justify-content: flex-end`; `container-mask` is absolutely positioned with `bottom: 10px`
  so it rides up out of frame (final `top: -908px`), and `border-radius` goes `0 → 50%`.
  Net effect: the loader collapses upward into an ellipse and disappears, revealing the desktop.
- **Headline reveal:** the tagline is split into **23 `<span>`s**, each
  `display: inline-block; opacity: 0.001; filter: blur(10px); transform: translateY(10px)`
  animating to `opacity: 1; filter: none; transform: none`, staggered per letter.
- **Framer appear animation** (`__framer__appearAnimationsContent`):
  `initial { scale: 3, y: 24 } → animate { scale: 1, y: 0 }`,
  `transition: { type: "tween", duration: 1, ease: [0.86, 0, 0.14, 1], delay: 0 }`.

Text (verbatim):
- `h5` — `Hey, I'm Jalvy! Welcome to my`
- `h1` — `Portfolio`
- `p` — `Explore it like a Mac.`

## Click sweep — what opens what

Desktop folder icons and dock icons both open **windows**. Multiple windows can be open at once;
each later window renders above the previous (DOM order, all at `z-index: 4`).

| Opener | Result |
| --- | --- |
| Desktop folder "About" | About window ("Our work with Norma") |
| Desktop folder "Projects" | Projects window ("Overview of the Project") |
| Desktop folder "Wallpaper" | Wallpaper window |
| Dock 1 — Finder (`projects`) | Projects window |
| Dock 2 — Launchpad (`Journal`) | Journal window |
| Dock 3 — Contacts (`contact`) | Contact window |
| Dock 4 — Messages (`Resume`) | Resume window |
| Dock 5 — Instagram | **External link** → `https://www.instagram.com/rk.abir000?igsh=MTU0b2Y4azc1NGVudg==` (`target="_blank"`) |
| Dock 6 — Notes (`About`) | About window |
| Dock 7 — Framer | **External link** → `https://framer.link/r-k-abir` (`target="_blank"`) |
| Dock 8 — Photos (`Gallery`) | Gallery window |
| Dock 9 — Trash (`Recycle Bin`) | Recycle Bin window |

**On the live site, all three traffic lights close the window.** Yellow and green are *not*
minimise and maximise — clicking either dismisses the window exactly as red does. Verified with
real pointer clicks (not synthetic events): after clicking yellow, and again after clicking green,
the open-window count drops to zero.

> An earlier revision of this document claimed only red was wired up and that yellow/green were
> decorative. That was wrong — it came from reading the DOM (the lights are bare `<div>`s with no
> `href` and no visible handler) rather than actually clicking them.

> **The clone deliberately diverges here.** At the project owner's request, green toggles a
> maximised state and yellow toggles a minimised one, instead of both closing. Only red still
> closes, matching the original. See "Requested divergences" in `ARTIFACT_MANIFEST.md`.

## Window behaviours

- **Open and close animation: a centred zoom + fade, symmetric in both directions.**
  - Open: `scale(0.8) → scale(1)` **and** `opacity 0 → 1`.
  - Close: `scale(1) → scale(0.8)` **and** `opacity 1 → 0`, then the window unmounts.
  - The scale is about the window's own centre, which stays fixed for the whole animation —
    the window does not move.
  - Measured mid-flight at `374,131 691×504`, settling to `288,68 864×630`
    (`691/864 = 504/630 = 0.8`, both centred on `720,383`). The 720×596 Wallpaper window shows
    the same ratio: `432,149 576×476` → `360,89 720×596`, centred on `720,387`.
  - **Duration and easing are NOT precisely measurable.** The live container declares
    `transition: all` with no time or curve, so browser defaults apply, and Framer drives the
    values in a way that leaves `getAnimations()` empty and intermediate `getComputedStyle`
    reads unreliable. The clone uses `300ms` / `ease` (what `transition: all` resolves to).
    These are the two numbers to tune if the timing needs adjusting.

> **Implementation trap, hit once and worth recording.** The centring `translate(-50%)` and the
> animated `scale()` must live on *different* elements. Putting a `transform` keyframe on the
> positioning element replaces its whole `transform` for the animation's duration, dropping the
> centring — the window then starts at `left: 50%` and appears to slide in from the right.
> A second trap: swapping the entrance *animation* for an exit *transition* in the same React
> render does not start a transition (there is no stable "before" value, because the value it
> would interpolate from was supplied by the animation's `both` fill), so the close jumped
> straight to invisible. Two symmetric keyframes on an inner wrapper avoid both problems.
- **Drag:** the whole window container has `cursor: grab` — windows are draggable by any point,
  not just the title bar.
- **Chrome:** **no border radius and no box-shadow** on the window (verified: `border-radius: 0px`,
  `box-shadow: none` on the container, on `Desktop`, and on every ancestor). The window is a
  hard-cornered rectangle.
- **Title bar** (`Navigation`) is `position: sticky; top: 0; z-index: 1` inside the scroller, so it
  stays pinned while the body scrolls.
- **Body scrollbar is hidden** but scrolling works.

### Window geometry (settled, desktop 1440×900)

| Window | Title | Box | Content scroll height |
| --- | --- | --- | --- |
| About | `Our work with Norma` | `288,68 864×630` | 1814 |
| Projects | `Overview of the Project` | `288,68 864×630` | 1134 |
| Journal | `Journal` | `288,68 864×630` | 1911 |
| Contact | `Contact` | `288,68 864×630` | 1001 |
| Resume | `Resume` | `288,68 864×630` | 1158 |
| Gallery | `Gallery` | `288,68 864×630` | 1200 |
| Recycle Bin | `Recycle Bin` | `288,68 864×630` | 717 |
| Wallpaper | `Wallpaper` | `360,89 720×596` | fits (no scroll) |

## Hover sweep

| Element | Change | Notes |
| --- | --- | --- |
| Dock icon | inner wrapper `transform: none → scale(0.9)` | 76×76 → 68×68 visually; presses *in*, not macOS magnification |
| Desktop folder icon | inner wrapper `transform: none → scale(0.9)` | 58×59 → 52×53 |
| Traffic light | an **icon fades in** inside the dot; the dot's **colour does not change** | see below |

### Traffic light hover — measured, and not what macOS convention suggests

- Each light is an empty 12×12 dot at rest. On hover, Framer injects an
  `<div data-framer-name="Icon">` holding an SVG.
- The icon renders **18×18**, absolutely positioned at **`inset: -3px`**, `object-fit: cover` — so
  it overflows the 12px dot by 3px on every side.
- **The icon appears only for the light actually under the pointer.** Hovering the group does not
  reveal the other two (real macOS does reveal all three). Verified: with red hovered, yellow and
  green both still had zero children.
- **The dot's background stays on its base colour.** Measured while each was hovered:
  `rgb(253,93,92)`, `rgb(250,201,0)`, `rgb(52,199,90)` — all unchanged.

> An earlier revision listed hover/active colour shifts (`#ff6157`, `#e24640`, …). Those values are
> real tokens in Framer's variable set, but they are **not applied to the traffic lights on hover**.
> Reading them off the token list rather than measuring the element was the mistake.

Icons (downloaded to `images/`):

| Light | Asset | Source |
| --- | --- | --- |
| Red | `traffic-close.svg` | `NDyK0vT59Ts4FdPDJ9gqXGX2tcA.svg` |
| Yellow | `traffic-minimize.svg` | `babtJCoBF9b9ngLcU0gBAQQ26E.svg` |
| Green | `traffic-maximize.svg` | `9nsiD1y2c3PX6aw6PQFSugpMYbk.svg` |

Transitions are Framer Motion driven; `transition` computes to the shorthand `all`, so exact
duration is not exposed via CSS. A `~0.2s` ease-out reproduces the feel.

## Constant desktop scrim

`Hero Section > Layer` is a full-viewport `rgba(0, 0, 0, 0.24)` overlay sitting above the wallpaper.
It is **always** present at that value — it does *not* change when a window opens. The wallpaper is
therefore always rendered ~24% darkened.

## Responsive sweep

Framer breakpoints (from `__framer__breakpoints`):

| Name | Media query |
| --- | --- |
| Desktop | `(min-width: 1200px)` |
| Tablet | `(min-width: 810px) and (max-width: 1199.98px)` |
| Mobile | `(max-width: 809.98px)` |

### Menu bar

| | Desktop (1440) | Tablet (900) | Mobile (390) |
| --- | --- | --- | --- |
| Height / padding / blur | `29px` / `3px 11px 2px 4px` / `blur(82px)` on `rgba(0,0,0,0.1)` | same | same |
| Nav icons shown | 4 (wifi, search, control-centre, account) | 4 | **1 (wifi only)** |
| Date shown | yes | yes | **no** |
| Time shown | yes | yes | yes |

### Desktop container & icons

| | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| `Container` | `50,160 1340×716` | `30,130 840×846` | `20,120 350×700` |
| Side inset | 50px | 30px | 20px |
| Bottom inset | 24px | 24px | 24px |
| `All File & Title` gap | 85px | 85px | **30px** |
| `About & Wallpaper Card` | `padding-right: 100px`, `space-between` | same | **no padding-right**, `space-between` |
| Icon size | 58×59 | 59×59 | 58×59 |
| Icon label | SF Pro Display Regular 14px/19.6px, `-0.14px`, `#fff` | same | same |

### Dock

| | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Bar | `775×94`, radius 24, gap 16, pad `9px 8px` | `775×94`, radius 24, gap 16 | `350×52`, **radius 12**, **gap 8** |
| Wrapper | `650×76`, gap 6 | `650×73`, gap 6 | `283×34`, gap 6, `justify-content: flex-start` |
| Item size | 76×76 | 73×73 | 34×34 |
| Items | 8 | 8 | **7 — the "Framer" item is removed** |
| Divider `Line` | `1×72`, `#686868` | `1×72` | `1×32` |
| Trash | 76×76 | 76×76 | 34×34 |
| Background | `rgba(40,40,40,0.6)`, `backdrop-filter: blur(14px)`, `box-shadow: 0 3px 3px rgba(0,0,0,0.24)` | same | same |

### Pre-loader type

| | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| `h1` "Portfolio" | `116px/116px`, `-1.16px` | `100px/100px`, `-1px` | `70px/70px`, `-0.7px` |
| `h5` kicker | `25px/32.5px`, `-0.5px` | `20px/26px`, `-0.4px` | `16px/20.8px`, `-0.32px` |
| `p` tagline | `12px/16.8px` | `12px/16.8px` | `12px/16.8px` |
