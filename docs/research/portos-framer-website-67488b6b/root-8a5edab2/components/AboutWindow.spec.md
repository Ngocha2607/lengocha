# AboutWindow Specification

## Overview
- **Target files (split across two builders — this section is too large for one):**
  - `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/AboutWindow.tsx` — window body,
    portrait + intro + counters + team cards; imports and renders `AboutDetails`
  - `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/AboutDetails.tsx` — the
    Service / Featured Client / Experience / Tools I Use stack
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/window-about-full.png`
- **Interaction model:** static, with **one** animation — the four counters count up from zero on mount.
- **Renders the window BODY only.**

Window `864 × 630` viewport, `1814px` of content. Title bar `0,0 864×43`; body starts **50px**
below it, so content begins at `y = 93`.

> **This window's title bar uses a different font from every other window.** Its title
> `Our work with Norma` computes to **Inter `16px / 19.2px`, weight 400, `color: rgb(134, 134, 139)`**,
> not the SF Pro Display 14px used elsewhere. That is a real inconsistency in the source template.
> `WindowFrame` already supports it via `titleFont="inter"` — pass that when mounting this window.

## Top-level layout

```
"Content"    0,93  864×1720   flex-ROW, justify-center, items-start, gap 24px, padding 0 20px 60px
  ├─ portrait <img>   20,93  330×371   object-fit cover
  └─ "About Us"      374,93  470×1660  flex-col, items-start, gap 52px   (5 children)
       ├─ "Title Wrapper"  470×761   flex-col, items-start, gap 32px   (3 children)
       ├─ "All Service"    470×120
       ├─ "All Featured"   470×120
       ├─ "All Experience" 470×165
       └─ "All Tools"      470×287
```

Portrait asset: `about-portrait.png`, rendered `330 × 371`, `object-fit: cover`, `border-radius: 0`.

---

# Part 1 — `AboutWindow.tsx`

## "Title Wrapper" (470 × 761, flex-col, gap 32px)

### a. Intro block ("Title Wrapper" inner) — 470×290, flex-col, gap 20px

**"Title & Details"** — 470×184, flex-col, gap 16px:

- `<h3>` — `Hey, I'm Jalvy.`
  SF Pro Display Regular → `font-display`; `32px / 38.4px`; letterSpacing `-0.32px`; `color: rgb(0,0,0)`
- **"Details"** — 470×130, flex-col, gap 12px, two `<p>`s, each `470 × 59`:
  SF Pro Display Regular → `font-display`; `14px / 19.6px`; letterSpacing `-0.14px`; `color: rgb(0,0,0)`
  1. `I design modern digital experiences that combine thoughtful aesthetics with practical functionality. My focus is creating products that feel intuitive, refined, and built to last.`
  2. `Over the past few years, I've partnered with startups, agencies, and founders to design websites, products, and brands that help businesses grow with clarity and confidence.`

**Signature** — `<h2>` `Jalvy` at `374,297`, box `78 × 86`:
- **font-family `Inspiration`** (the Google font, already wired as `font-signature`)
- `72px / 86.4px`; letterSpacing `-2.88px`; `color: rgb(0, 0, 0)`

### b. "All Counters" — 470×147, flex-col, gap 32px, two rows

Each row ("Counters"): flex-row, `gap: 19px`, two `Counter` cells of `226 × 58`.

**Counter cell:**
- `border-top: 1px solid rgba(0, 0, 0, 0.1)` — on the live site this is drawn by an `::after`
  pseudo-element; applying it directly to the cell is visually identical
- `padding: 8px 0 0`; `overflow: clip`
- inner column: flex-col, `align-items: flex-start`, `gap: 2px`
  - **label `<p>`** — SF Pro Display Regular → `font-display`; `14px / 19.6px`; letterSpacing `-0.14px`;
    `color: rgba(0, 0, 0, 0.7)`
  - **value `<h2>`** — SF Pro Display **Bold** → `font-display font-bold`; `20px / 28px`;
    letterSpacing `-0.4px`; `color: rgb(0, 0, 0)`; `text-align: left`

| Row | Left cell | Right cell |
| --- | --- | --- |
| 1 | `• Projects` → `45+` | `• Clients` → `28+` |
| 2 | `• Experience` → `6 Years` | `• Countries` → `12` |

**Count-up animation (the one animation in this window).** The live DOM holds **two** stacked
`<h2>`s per counter inside an `overflow: clip` column — captured mid-flight as `45+` / `0+`, and
after settling as `45+` / `45+`. This is Framer's Counter rolling from `0` to the target on mount.

Reproduce as a count-up on mount:
- `• Projects` → `0+` … `45+`
- `• Clients` → `0+` … `28+`
- `• Experience` → `0 Years` … `6 Years`
- `• Countries` → `0` … `12`

Note the suffix travels with the number (`+`, ` Years`, or nothing). Duration ~1.2s, ease-out.
Under `prefers-reduced-motion: reduce`, render the final value immediately.

### c. "Cards" — 470×260, flex-row, justify-center, items-center, gap 16px

Two cards of `227 × 260`, each flex-col with `gap: 8px`:
- `<img>` `227 × 213`, `object-fit: cover`, `border-radius: 0`
- **"Name & Designation"** `227 × 39`, flex-col, `gap: 0`:
  - name `<p>` — SF Pro Display **Medium** → `font-display font-medium`; `14px / 19.6px`;
    letterSpacing `-0.28px`; `color: rgb(0, 0, 0)`
  - role `<p>` — SF Pro Display Regular → `font-display`; `14px / 19.6px`;
    letterSpacing `-0.14px`; `color: rgba(0, 0, 0, 0.6)`

| Card | Asset | Name | Role |
| --- | --- | --- | --- |
| 1 | `about-card-01.png` | `Ethan Carter` | `Lead Product Designer` |
| 2 | `about-card-02.png` | `Sophia Bennett` | `Brand & Visual Designer` |

---

# Part 2 — `AboutDetails.tsx`

A `flex-col` with `gap: 52px` inherited from the parent — render the four blocks as siblings and
let `AboutWindow` place them inside `About Us`.

## "All Service" — 470×120 and "All Featured" — 470×120

Both share one shape: `flex-row`, **`justify-content: space-between`**, **`align-items: flex-end`**.

```
left column ("Service")   flex-col, gap 16px
  ├─ <p> heading
  └─ "Featureds"   flex-col, gap 0, padding-left 8px   (4 items, each 20px tall)
right column ("Featureds")  flex-col, gap 0   (4 items, each 20px tall)  — NO left padding
```

- Heading `<p>` — SF Pro Display Regular → `font-display`; `18px / 25.2px`;
  letterSpacing `-0.54px`; `color: rgb(0, 0, 0)`
- List item `<p>` — SF Pro Display Regular → `font-display`; `14px / 19.6px`;
  letterSpacing `-0.14px`; `color: rgba(0, 0, 0, 0.6)`

### Content — reproduce the bullet spacing EXACTLY

The bullets are literal characters in the text, not list markers, and the spacing is inconsistent
in the source (some have two spaces after the `•`, most have three). Copy verbatim.

| Block | Heading | Left items | Right items |
| --- | --- | --- | --- |
| All Service | `Service` | `•  UI/UX Design`, `•   Product Design`, `•   Mobile App Design`, `•   Dashboard Design` | `•  Framer Development`, `•   Webflow Development`, `•   CMS Integration`, `•   Responsive Websites` |
| All Featured | `Featured Client` | `•   Framer`, `•   Webflow`, `•   Figma`, `•   Linear` | `•  Notion`, `•   Spline`, `•   Vercel`, `•   Stripe` |

(The first item of each right-hand column has two spaces; the rest have three. Same for the
Service left column. Verbatim.)

## "All Experience" — 470×165, flex-col, items-start, gap 16px

- Heading `<p>` `Experience` — SF Pro Display Regular → `font-display`; `18px / 25.2px`;
  letterSpacing `-0.54px`; `color: rgb(0, 0, 0)`
- **"Experience"** table — 470×124, flex-col, `gap: 4px`, five rows

Each row: `border-top: 0.5px solid rgba(0, 0, 0, 0.1)`, `470 × 21`, three cells —
role (left), company (middle), dates (right, `text-align: end`).
All three: SF Pro Display **Medium** → `font-display font-medium`; `12px / 16.8px`;
letterSpacing `-0.12px`; `color: rgb(0, 0, 0)`.

| Role | Company | Dates |
| --- | --- | --- |
| `Lead Product Designer` | `Jalvy Studio` | `2026 – Present` |
| `Senior UI/UX Designer` | `Pixel Agency` | `2022 – 2024` |
| `Product Designer` | `Nova Studio` | `2020 – 2022` |
| `Freelance Designer` | `Independent` | `2022 – 2024` |
| `Graphic Designer` | `Creative Lab` | `2018 – 2020` |

> The dates use an **en dash** `–` (U+2013), not a hyphen. And rows 2 and 4 really do both say
> `2022 – 2024` — that overlap is in the source. Verbatim.

Measured column origins: role at x `374`, company at x `~575`, dates right-aligned to x `844`.

## "All Tools" — 470×287, flex-col, gap 16px

- Heading `<p>` `Tools I Use` — same style as the other headings
  (`font-display`, `18px / 25.2px`, `-0.54px`, `rgb(0,0,0)`)
- Three tool rows, each flex-col with `gap: 12px`:

```
row
  ├─ header   flex-ROW, items-baseline
  │     ├─ <p> index      "/01"
  │     ├─ <p> name       "Framer"
  │     └─ <p> blurb      right-aligned, fills remaining width
  └─ bar      470×33 track, relative
        └─ fill   absolute, left 0, width = N% of 470, height 33
```

- **Index `<p>`** — SF Pro **Text** Regular → `font-sans`; `12px / 16.8px`; `color: rgb(0, 0, 0)`
- **Name `<p>`** — SF Pro Display **Medium** → `font-display font-medium`; `16px / 22.4px`;
  letterSpacing `-0.16px`; `color: rgb(0, 0, 0)`
- **Blurb `<p>`** — SF Pro Display **Medium** → `font-display font-medium`; `12px / 16.8px`;
  letterSpacing `-0.12px`; `color: rgb(0, 0, 0)`; **`text-align: end`**
- **Bar fill** — `background: rgb(0, 0, 0)`; `height: 33px`; `padding: 5px 6px 5px 0`;
  `display: flex`; `justify-content: flex-end`; `align-items: center`; `gap: 10px`;
  `border-radius: 0`. **There is no visible track behind it** — just the fill.
- **Percentage `<p>`** inside the fill — SF Pro Display **Medium** → `font-display font-medium`;
  `16px / 22.4px`; letterSpacing `-0.16px`; `color: rgb(255, 255, 255)`

| Index | Name | Blurb | Fill width |
| --- | --- | --- | --- |
| `/01` | `Framer` | `Interactive websites, CMS, animations, and premium experiences.` | `96%` (measured `451.578 / 470.406`) |
| `/02` | `Figma` | `Interface design, prototyping, and scalable design systems.` | `92%` (measured `432.766 / 470.406`) |
| `/03` | `Webflow` | `Responsive websites with CMS, interactions, and production-ready builds.` | `88%` (measured `413.953 / 470.406`) |

The third blurb wraps to two lines, which is why that row is taller than the first two.

## States & Behaviours
Apart from the counter count-up, **nothing**. No hover, no clicks, no links, no scroll-driven
animation. The bars do not animate their width on the live site.

## Responsive Behavior
The live site clips rather than reflows below 864px. `WindowFrame` caps the window at
`max-w-[calc(100vw-16px)]`. Add a graceful fallback:
- `min-[880px]:` and above — the measured two-column `Content` row (`330px` portrait + `24px` +
  `470px` column).
- Below that — stack (`flex-col`), portrait full-width with `aspect-[330/371]`, the `470px`
  column goes `w-full`.
- Below `560px` — the counters go one per row, the team cards stack, and the
  Service / Featured Client two-column lists stack.
This is an adaptation, not a measurement.

## Notes
- **Tailwind preflight sets `img { height: auto }`** — set explicit heights or use aspect boxes.
- Import `PORTOS_ASSETS` and the `AboutCounter` interface from `@/types/portos`.
- Verify `npx tsc --noEmit` and `npx eslint <file>` before finishing.

## Bullet blocks — the right column is a fixed 155px

The two bullet blocks (`Service` / `Featured Client` on the live site, `Expertise` /
`Stack` here) are `display: flex; justify-content: space-between; align-items: flex-end`
on a 470px row. The left column shrinks to fit — measured 133.0px and 124.0px on the
live site — but **the right column is 155.0px in BOTH blocks**, so it always starts at
x = 315.4 and the two blocks line up down the page.

That 155px is load-bearing. Letting the right column shrink to fit instead makes its
position depend on how long the copy is, and this clone's copy is shorter than the
template's: it put Expertise at x = 353.2 (w 116.8) and Stack at x = 378.5 (w 91.5) — a
25px stagger between two blocks that should share an edge. Fixed at 155px, both now
measure x = 315.0, w = 155.0.

> Measuring note: read this geometry only once the open animation has settled. The
> window animates `scale(0.8) -> scale(1)`, `getBoundingClientRect()` includes that
> transform, and the animation is throttled to a standstill while the tab is in the
> background — which silently returns every number multiplied by 0.8. Assert the
> portrait measures 330px before trusting anything else.

## Requested redesign — what no longer matches the live site

The About body was reworked on the owner's request. Everything below is a
deliberate divergence, not a fidelity fix. The measurements recorded earlier in
this file still describe the ORIGINAL and are kept for that reason.

### The body is two regions, and that is load-bearing

| Region | Contents | Width |
| --- | --- | --- |
| 1 | portrait, intro, counters, Expertise, Stack | 330 + 24 + 470 |
| 2 | Experience | full 824 |

A sticky element is confined to its containing block, so region 1's row *is* the
definition of how far the portrait pins: it releases the moment Stack ends.
Measured — pinned at viewport y=162 for scrollTop 0/200/400, sliding at 500, gone
by 650. Merging the regions back into one row would pin the portrait all the way
to the bottom of the window.

### Both bullet blocks now align with the counters above them

The live site gives the second column of each bullet block a fixed 155px flush to
the right edge, starting at x = 315.4 — which lines up with nothing above it. It
is now half the 470px column with the counters' own 19px gap, so all three second
columns share one left edge. Measured after the change: the second counter, the
second Expertise column and the second Stack column all start at x = 906.5,
spread 0.00px.

This is derived, not hard-coded: both halves are `flex-1` with `gap-[19px]`, the
same rule the counters use. Change the counters' gap and the bullet blocks follow.

### Experience is a climbing timeline, not a table

The live site renders a three-column table (role / company / dates). This is now
five markers on a rail that rises left to right and carries on past the last one,
arrowhead included. Each milestone sits 18px above the previous and the whole
column moves — dot and text together — because lifting only the dots would open a
widening gap between each marker and its own label.

Content changed too: a missing entry was added (FPT Software, 2021, Intern), the
order flipped to oldest-first to suit a left-to-right read, and company names were
shortened ("Minastik", not "Minastik JSC") because a ~165px column wraps the full
names onto two lines.

#### Two geometry traps, both measured

**The column gap silently breaks the rail.** The rail places its ends with
percentages, which assumes marker `i` sits at exactly `i * 20%` of the block.
`gap-x-4` makes that false: five columns in 824px with four 16px gaps are 152px,
not 164.8, so the last marker lands 13px right of where 80% predicts. The symptom
is a *progressive* drift — markers measured 0.66 / 1.03 / 1.41 / 1.75 / 2.04px off
the line. `min-[880px]:gap-x-0` restores the fifths; drift then goes flat at
0.60-0.74px, inside the 1.5px stroke and therefore invisible.

**Percentages and pixels cannot share an axis.** Markers sit at `i * 20% + DOT/2`.
Writing the line as `x1={DOT/2} x2="94%"` puts the half-dot on one end only, which
is a different affine map and tilts the rail. SVG geometry attributes reject
`calc()`, but a `transform` is applied *after* percentages resolve — so `x1="0"
x2="94%"` plus `translate(DOT/2 0)` offsets both ends at once and holds at any
width.

### Stack carries brand logos

Eight marks in `StackIcons.tsx`, drawn by hand rather than pulled from a package:
the clone has no external asset hosts (verified — every runtime request is
same-origin) and `lucide-react` dropped brand logos. React, Vercel and GitLab use
the real construction and are essentially exact; Next.js and TypeScript use
stroked letterforms so they never depend on an installed font; Docker, Spring and
Turborepo are simplified silhouettes that read at 16px and no further.

> Turborepo rendered flat pink at first. A `<linearGradient>` defaults to
> `gradientUnits="objectBoundingBox"`, where coordinates are fractions of the
> shape — so `x2="24"` meant 24x the width, stretching the ramp until only its
> first stop was visible. `gradientUnits="userSpaceOnUse"` is required whenever
> the gradient coordinates are viewBox units.

### "Tools I Use" is gone

The template's fourth block — three self-assessed proficiency bars — was removed
on request. Its markup, and the measured 8px index→name / 16px name→blurb gaps
behind it, are in git history. Body content height dropped 1509 → 1268px.

### Measuring note

Read any of this geometry only once the open animation has settled. The window
animates `scale(0.8) -> scale(1)`, `getBoundingClientRect()` includes that
transform, and the animation is throttled to a standstill while the tab is in the
background — which silently returns every number multiplied by 0.8. Assert the
portrait measures 330px before trusting anything else; a reading of 264 means the
tab was not focused.
