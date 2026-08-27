# ContactWindow Specification

## Overview
- **Target file:** `src/components/sites/portos-framer-website-67488b6b/root-8a5edab2/ContactWindow.tsx`
- **Screenshot:** `docs/design-references/portos-framer-website-67488b6b/root-8a5edab2/window-contact-full.png`
- **Interaction model:** form input + hover (text slide on the submit button and social links).
  Not scroll-driven, no tabs.
- **Renders the window BODY only.**

Window `864 × 630` viewport, `1001px` of content. Title bar `0,0 864×44`; body starts **50px**
below it, so content begins at `y = 94`. `WindowFrame` renders `{children}` straight after the
title bar with no gap, so the component root supplies `pt-[50px]` itself.

## DOM Structure

```
"Container"        0,94  864×908   flex, justify-center, items-center, padding 0 20px 60px, max-w 1152px
  └─ "Content"    20,94  824×848   flex-col, items-start, gap 50px
       ├─ "Title & Description"  474×207  flex-col, items-start, gap 12px
       │      ├─ <h2>
       │      └─ <p>
       └─ "Form & Contact"  824×590  flex-ROW, justify-center, items-start, gap 40px
              ├─ <form>            533×590  flex-col, items-start, gap 32px, padding 20px, bg white
              │     ├─ "All Forms" 493×478  flex-col, gap 24px  (5 labelled fields)
              │     └─ submit button 191×41
              └─ "All Contact Details"  251×281  flex-col, items-start, gap 32px  (4 blocks)
```

## Computed Styles (exact values from getComputedStyle)

### Heading `<h2>` — "Let's build something good."
- SF Pro Display Regular → `font-display`, weight `400`
- fontSize **`72px`**; lineHeight `86.4px`; letterSpacing `-2.88px`; color `rgb(0, 0, 0)`
- box `474 × 173` — it wraps onto two lines at that width

### Subtitle `<p>`
- SF Pro Display Regular → `font-display`; `16px / 22.4px`; letterSpacing `-0.16px`
- color `rgba(0, 0, 0, 0.6)`

### `<form>` card
- `533 × 590`; `background: rgb(255, 255, 255)`; `padding: 20px`
- display `flex`; flexDirection `column`; justifyContent `flex-start`; alignItems `flex-start`; gap `32px`
- **No border radius, no shadow, no border.**

### "All Forms"
- `493 × 478`; display `flex`; flexDirection `column`; gap `24px`

### Field label `<p>` (NAME / EMAIL / PROJECT / BUDGET / MESSAGE)
- SF Pro Display Regular → `font-display`; `14px / 19.6px`; letterSpacing `-0.14px`
- color `rgb(0, 0, 0)`
- Text is stored **already uppercase** (computed `text-transform: none`) — write the strings uppercase.
- Each label + input pair is wrapped in a `<label>` element on the live site.

### Field wrapper (the underline)
- `493px` wide; text inputs `34.41px` tall, the textarea wrapper `66px`
- `padding: 0 0 12px` on the four text inputs; **no padding** on the textarea wrapper
- display `flex`; alignItems `center`; `position: relative`; `overflow: hidden`
- **The underline is drawn by a `::after` pseudo-element**:
  `position: absolute; bottom: 0; inset-x: 0; border-bottom: 1px solid rgba(0, 0, 0, 0.1)`
  → simplest faithful reproduction: put `border-bottom: 1px solid rgba(0, 0, 0, 0.1)` directly on
  the wrapper div. Visually identical.

### Inputs
- SF Pro Display Regular → `font-display`; `16px / 22.4px`; color `rgb(0, 0, 0)`
- `background: transparent`; `border: none`; `border-radius: 0`; `padding: 0`; no outline ring
- Text inputs `493 × 22`; textarea `493 × 66`
- **Placeholder:** `color: rgba(0, 0, 0, 0.5)`, same font/size as the input

### Submit button
- `<button>` `191 × 41`; `background: rgb(0, 0, 0)`; `border-radius: 40px`; `padding: 12px 54px`
- display `flex`; justifyContent `center`; alignItems `center`; **`overflow: clip`**
- Label: SF Pro Text Regular → `font-sans`; `12px / 16.8px`; color `rgb(255, 255, 255)`
- **It contains TWO stacked copies of `Send Message`** in a `flex-col` — measured at
  `y = 892` and `y = 927`, i.e. 35px apart, with the button clipping to show one at a time.
  This is a **slide-up-on-hover** effect: on hover the inner column translates up by one line
  height so the second copy replaces the first. Use `transition: transform 0.3s ease`.

### "All Contact Details" (right column)
- `251 × 281`; display `flex`; flexDirection `column`; justifyContent `center`;
  alignItems `flex-start`; gap `32px`; 4 blocks

Each block is `flex-col`, `items-start`, `gap: 4px` (the Social block uses `gap: 16px`):

| Block label | Value |
| --- | --- |
| `EMAIL` | `hello@portos.studio` — an `<a>` |
| `LOCATION` | `Lisbon, Portugal` — an `<a>` |
| `• AVAILABILITY` | `Available for select projects - Q3 2026` — plain `<p>` |
| `SOCIAL` | four links, see below |

- **Block label:** SF Pro **Text** Regular → `font-sans`; `12px / 16.8px`; `color: rgba(0, 0, 0, 0.6)`
- **Block value:** SF Pro **Display** Regular → `font-display`; `16px / 22.4px`;
  letterSpacing `-0.16px`; `color: rgb(0, 0, 0)`
- The `•` in `• AVAILABILITY` is its own `<span>` coloured **`rgb(80, 162, 90)`** (`#50a25a`, green).
  The word `AVAILABILITY` stays `rgba(0, 0, 0, 0.6)`.

### Social links row
- `251 × 22`; display `flex`; flexDirection `row`; justifyContent `space-between`; `overflow: clip`
- Four `<a target="_blank">` items, each also containing **two stacked text copies**
  (measured at `y = 609` and `y = 633`, 24px apart) — the same slide-on-hover effect as the
  submit button.

| Label | href |
| --- | --- |
| `Twitter` | `https://twitter.com` |
| `Dribbble` | `https://dribbble.com` |
| `GitHub` | `https://gitHub.com` |
| `Linkedin` | `https://linkedin.com` |

> `https://gitHub.com` is spelled with a capital `H` on the live site, and the visible label is
> `Linkedin` (not "LinkedIn"). **Reproduce both verbatim.**

## Form fields — exact order, names, placeholders

| Order | Label | `name` | Type | Placeholder | Required |
| --- | --- | --- | --- | --- | --- |
| 1 | `NAME` | `Name` | text | `Your name` | yes |
| 2 | `EMAIL` | `EMAIL` | email | `you@email.com` | yes |
| 3 | `PROJECT` | `PROJECT` | text | `What do you need?` | yes |
| 4 | `BUDGET` | `BUDGET` | text | `$5k- $20k` | yes |
| 5 | `MESSAGE` | `MESSAGE` | textarea | `Tell me about Your Project` | yes |

> The `name` attribute of the first field really is `Name` (mixed case) while the rest are all
> caps, and the budget placeholder really is `$5k- $20k` with the space after the hyphen rather
> than before. Verbatim.

### Honeypot fields — DO NOT REPRODUCE
The live site also emits 11 zero-size spam-trap inputs (`website`, `company`, `message`,
`subject`, `title`, `description`, `feedback`, `notes`, `details`, `remarks`, `comments`).
These are Framer's form spam protection, not part of the design. **Leave them out.**

## States & Behaviours

### Form submission
**Out of scope** — no backend. Wire `onSubmit` to `preventDefault()` and keep the fields as
controlled or uncontrolled inputs; do not POST anywhere and do not fake a success state.

### Hover
- Submit button: inner two-line column translates up one line. `transition: transform 0.3s ease`.
- Social links: same two-copy slide.
- No other hover states.

### Focus
The inputs have no outline ring on the live site (`outline: none`). Keep a visible focus style
anyway for accessibility — the underline darkening to `rgba(0,0,0,0.4)` on `:focus-within` is a
minimal, in-keeping choice. Note it in your report as an addition.

### Scroll
`1001px` of content against a `630px` viewport. Scrollbar hidden (`WindowFrame` applies `.portos-scroll`).

## Text Content (verbatim)
```
Let's build something good.
Available for select projects - Q3 2026
NAME / EMAIL / PROJECT / BUDGET / MESSAGE
Send Message
EMAIL          hello@portos.studio
LOCATION       Lisbon, Portugal
• AVAILABILITY Available for select projects - Q3 2026
SOCIAL         Twitter  Dribbble  GitHub  Linkedin
```
Note the apostrophe in `Let's` is a straight `'` (U+0027), and the dash in
`projects - Q3 2026` is a plain hyphen-minus, not an en dash.

## Responsive Behavior
The live site clips rather than reflows below 864px. `WindowFrame` caps the window at
`max-w-[calc(100vw-16px)]`. Add a graceful fallback:
- `min-[880px]:` and above — the measured two-column `Form & Contact` row (`533px` + `40px` + `251px`).
- Below that — stack to a single column (`flex-col`), form full width, contact details below.
- Scale the `72px` heading down (`text-[40px] min-[640px]:text-[56px] min-[880px]:text-[72px]`
  with proportional line-height and tracking) so it does not overflow at narrow widths.
This is an adaptation, not a measurement. Note it in your report.

## Props
```ts
// No props.
export function ContactWindow()
```
Needs `"use client"` (form handlers).

## Notes
- Mark the form `data-no-drag` so typing/clicking in it does not start a window drag
  (`WindowFrame` checks for that attribute on pointerdown).
- Import `PORTOS_ASSETS` from `@/types/portos` only if you need it — this window has **no images**.
- Verify `npx tsc --noEmit` and `npx eslint <file>` before finishing.
