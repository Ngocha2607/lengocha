# Artifact Manifest — portos.framer.website

## Assets

**72 files, all downloaded from the original.** No generated substitutes, no Atlas Cloud fallback
was used or needed — every asset resolved on first attempt.

Downloader: `scripts/download-assets-portos-framer-website-67488b6b-root-8a5edab2.mjs`
Destination: `public/sites/portos-framer-website-67488b6b/root-8a5edab2/`

| Group | Count | Notes |
| --- | --- | --- |
| Menu-bar icons | 5 | `menubar-apple.svg`, `-wifi.png`, `-search.svg`, `-account.svg`, `-control-center.svg` |
| Desktop | 3 | wallpaper, folder icon, pre-loader background |
| Dock | 9 | Finder, Launchpad, Contacts, Messages, Instagram, Notes, Framer, Photos, Trash |
| Projects window | 12 | `projects-01…12.png` |
| Journal window | 9 | hero, portrait, 2 arrows, 5 cards |
| About window | 3 | portrait + 2 team cards |
| Resume window | 8 | `resume-01…08.png` |
| Gallery window | 8 | `gallery-01…08.png` |
| Wallpaper window | 6 | 4 wallpapers + 2 (unused) arrow SVGs |
| SEO | 3 | favicon, apple-touch-icon, OG image |
| Fonts | 6 | SF Pro Display Regular/Medium/Bold, SF Pro Text Thin/Regular/Semibold (woff2) |

Total: ~35 MB images, 3.7 MB fonts, 1.4 MB SEO.

### Assets downloaded but intentionally unused
- `wallpaper-arrow-prev.svg`, `wallpaper-arrow-next.svg` — the live site emits these buttons but
  their computed `display` is `none` at rest and under a real hover. Framer's carousel renders them
  and the config hides them, so the clone does not render them either.

### Cross-window asset reuse (not mistakes)
The live site reuses several images across windows. Reproduced faithfully:
- `projects-10.png` also appears in the Gallery and Recycle Bin grids.
- `projects-08.png` also appears as a Journal card (row 2, right).
- `gallery-01/02/04/06/07.png` also appear in the Recycle Bin grid.

## Fonts

| Family | Faces | Source |
| --- | --- | --- |
| SF Pro Display | 400 / 500 / 700 | self-hosted woff2, downloaded from Framer's CDN |
| SF Pro Text | 200 / 400 / 600 | self-hosted woff2, downloaded from Framer's CDN |
| Inspiration | 400 | Google Fonts via `next/font/google` — the "Jalvy" signature in the About window |

`next/font/local` requires literal `src` paths; a shared path constant fails the build with
`data did not match any variant of untagged enum SrcRequest`. The paths in `layout.tsx` are
therefore written out in full.

## Verbatim source oddities preserved

These look like defects but are the source template's own content. Each carries a code comment so
nobody "fixes" them later.

| Where | Oddity |
| --- | --- |
| Resume card 1 | `DESIGN & PURLISH` — typo for "PUBLISH" |
| Resume card 8 | `COLOUR` — British spelling |
| Contact social | `https://gitHub.com` — capital `H` in the host |
| Contact social | label `Linkedin`, not "LinkedIn" |
| Contact form | first field's `name` is `Name` (mixed case) while the rest are all-caps |
| Contact form | budget placeholder `$5k- $20k` — space after the hyphen, not before |
| About lists | bullets have inconsistent spacing: first item of each column has two spaces after `•`, the rest have three |
| About experience | rows 2 and 4 both read `2022 – 2024` |
| About window | its title bar uses Inter 16px `#86868b`; every other window uses SF Pro Display 14px `rgba(0,0,0,0.7)` |
| Journal | the container's `data-framer-name` is `Title & Slaidshow` (typo) |

## Deliberately not reproduced

- **Framer's "Made in Framer" badge** (`__framer-badge-container`) — Framer's injected watermark on
  free sites, not part of the template's design.
- **11 zero-size honeypot inputs** in the contact form (`website`, `company`, `message`, `subject`,
  `title`, `description`, `feedback`, `notes`, `details`, `remarks`, `comments`) — Framer's form
  spam protection.
- **DOM-level carousel duplication.** Framer repeats slide sets 4× to fake infinite loops; the clone
  reproduces the wrap-around behaviour with a single set instead.

## Behaviours that were verified, not assumed

Each of these was measured or clicked on the live site, and several contradicted a first guess:

| Question | Answer | How verified |
| --- | --- | --- |
| Is the Journal slideshow auto-advancing? | **No** — manual arrows only | sampled track position for 8s: never moved |
| Is the Wallpaper carousel auto-advancing? | **Yes**, ~2s per slide | sampled dot opacities once a second |
| Do the Wallpaper prev/next arrows show? | **No** — `display: none` even on real hover | real pointer hover, not synthetic events |
| Do the Recycle Bin shortcuts open windows? | **No** — inert | real click; open-window count stayed at 1 |
| Do the Resume "Open" pills link anywhere? | **No** — no `<a>`, no handler | `linkCount === 0` in the window |
| Does clicking a wallpaper change the desktop? | **No** | compared desktop `<img>` src before/after |
| Does the desktop scrim change when a window opens? | **No** — constant `rgba(0,0,0,0.24)` | measured with and without a window open |
| Do windows have rounded corners or a shadow? | **No** — hard rectangle, no shadow | checked the container, `Desktop`, and every ancestor |
| Is the dock hover macOS magnification? | **No** — the icon scales *down* to 0.9 | real hover, measured 76→68px |

## Requested divergences from the original

Changes made at the project owner's request, where the clone intentionally does **not** match the
live site. Everything else aims at exact reproduction.

| Change | Original behaviour | Clone behaviour |
| --- | --- | --- |
| Green traffic light | Closes the window, same as red and yellow | **Toggles maximised**: fills the desktop below the menu bar; click again to restore |
| Yellow traffic light | Closes the window, same as red and green | **Toggles minimised**: shrinks to 10% of its original area and parks in the bottom-left corner; click the window (or yellow again) to restore |
| Site identity | The template's fictional designer "Jalvy" and the Portos brand | **Replaced throughout with Lê Ngọc Hà's real details** — see below |

### Site identity — every place the template's name appeared

Sources: the CV PDF and `lengocha.vercel.app` (read directly, not guessed).

| Where | Was | Now |
| --- | --- | --- |
| Page `<title>` / OG / Twitter | `PortOS - MacOS Portfolio Experience` | `Lê Ngọc Hà — Senior Frontend Engineer` |
| `metadataBase` / OG url | `portos.framer.website` | `lengocha.vercel.app` |
| Menu bar | `Jalvy Portfolio` | `Lê Ngọc Hà` |
| Pre-loader kicker | `Hey, I'm Jalvy! Welcome to my` | `Hey, I'm Hà! Welcome to my` |
| Contact — email | `hello@portos.studio` | `ngocha2k0.ln@gmail.com` |
| Contact — location | `Lisbon, Portugal` (Google Maps link) | `Hanoi, Vietnam · UTC+7` (plain text) |
| Contact — availability | `Available for select projects - Q3 2026` | `Available for remote work` |
| Contact — social | Twitter / Dribbble / placeholder GitHub / Linkedin roots | GitHub / LinkedIn / Portfolio / CV — all real URLs |
| Dock — external #1 | Instagram → template author's account | **LinkedIn** → his profile, with a LinkedIn icon |
| Dock — external #2 | Framer → template author's account | **GitHub** → his profile, with a GitHub icon |
| Journal — 2 slides | Fictional design-studio copy about "Norma" | His two SAPP platform write-ups |
| Journal — cards | 6 fictional design essays, tagged `Editorial` | 4 real articles from `/writing`, tagged `Writing` |

Notes:
- **He has no Twitter, Dribbble, Instagram or Framer account** — none appear on his portfolio, so
  those slots were repurposed rather than pointed somewhere invented.
- **The two dock icons were redrawn, not just relinked.** `dock-linkedin.svg` and `dock-github.svg`
  are new macOS-style rounded-square marks, so the logo always matches its destination. Leaving the
  Instagram glyph on a LinkedIn link would have been misleading.
- **Dock icon artwork is normalised to 81.64% of its slot.** Every template dock PNG bakes in a
  transparent margin: measured at 4x supersampling on the rendered pixels, the artwork occupies
  62.5px of the 76px desktop slot. The first cut of the two SVGs was full-bleed (76px, ~23%
  oversized), and `dock-notes.png` ships with less margin than its siblings (67.5px). Both were
  corrected:
  - the SVGs carry the 81.64% inset inside their own `viewBox`, so no code has to know about it;
  - Notes is inset with `p-[3.66%]` in `Dock.tsx` rather than by re-encoding the PNG, so the
    downloaded asset stays byte-identical to the original.

  Evening out Notes is a **deliberate divergence** — the live site has the same quirk. Percentage
  padding resolves against the square box, so the single value holds at 34px, 73px and 76px alike.

  `dock-contacts.png` and `dock-trash.png` also fall outside the baseline and were **deliberately
  left alone** after a row-by-row edge profile: the Contacts tile is pixel-identical to Finder and
  its extra 2.8px is the address book's coloured index tabs, while the bin is a bare object that
  already reads lighter than the tiles. Insetting either would damage it. Reasoning and the
  measurements are in `components/Dock.spec.md`.
- **Contact's social row needed a `gap-x-4` floor.** The row shrink-wraps to its content, so
  `justify-between` had no slack and the four labels rendered flush against each other. `Résumé`
  was also shortened to `CV` to fit the 251px row.
- **SEO artwork is now the owner's.** `seo/favicon.svg` and `seo/apple-touch-icon.png` were
  supplied by him; `seo/og-image.png` is a 1200x630 capture of this build's own desktop.
  `seo/favicon.png` (the template's) is left on disk, unreferenced.
- **The Journal window is gone; "Writing" reads live from Notion.** The template's two-slide
  carousel plus six invented design essays is replaced by the owner's real Writing database —
  the same one behind lengocha.vercel.app/#writing — so editing a post in Notion updates this
  site with no redeploy. Clicking a card swaps the window body for the article and offers
  "← Writing" back, mirroring how his own article pages are laid out.

  Wiring: `src/lib/notion.ts` (server-only) + `src/lib/markdown.ts` behind two route handlers,
  `/api/writing` and `/api/writing/[slug]`. The window is a client component, so it never
  imports the Notion module — anything a `"use client"` file imports is shipped to the browser,
  and `NOTION_TOKEN` must not be. Markdown is rendered to HTML on the server, with raw HTML in
  the Notion source ESCAPED rather than passed through; verified no `<script>` survives.

  Three things worth knowing:
  - The app id was renamed `journal` -> `writing` across the contract, dock, shell and icons.
  - `next.config.ts` now allows ONE remote image host, the owner's Vercel Blob store, for post
    covers. It is the only exception to this site being entirely same-origin, and it exists
    because live content is the point of the window. Writing is now the one part of the site
    that needs the network.
  - Article bodies are cached 10 minutes, separately from the 60s list, because they are
    expensive rather than volatile. `pageToMarkdown` costs one Notion request per level of
    block nesting, so latency tracks nesting, not length: measured cold through the route,
    1.1s for the simplest of the four posts and 11.0s for the one with 27 sub-headings, 9
    tables and 54 list items. Warm it answers in 0.014s. Cards also warm the cache on hover,
    which took a real click on the slowest post from 11.7s to 0.25s. Concurrent requests for
    one slug share a single walk instead of racing.
  - `getPublishedPosts` memoises for 60s. The Astro original memoises per render and lets ISR
    decide reuse; there is no ISR here, so a plain module-level promise in a long-running server
    would never expire and a post edited in Notion would never appear.

  Measured end to end: 4 posts listed, the largest article renders 87 prose nodes — 12 h2, 6
  tables, 7 code blocks — and the window body does NOT scroll sideways, because `pre` and
  `table` carry their own `overflow-x` (`display: table` ignores `overflow`, so the table is set
  to `display: block` to become its own scroll container).
- **The Contact window lost two fields and gained icons.** The heading is now "Let's talk"; the
  live site's PROJECT and BUDGET fields are dropped, leaving NAME / EMAIL / MESSAGE. Email,
  location and availability each carry a lucide mark, and the four social links carry one too —
  GitHub and LinkedIn hand-drawn in `SocialIcons.tsx`, because lucide ships no brand marks at
  all. Those two are bare `currentColor` glyphs rather than the dock's colour badges, so they
  inherit the link colour and its hover. The social row became a 2x2 grid: with an icon in front
  of each label the four no longer fit 251px, and a wrapped `justify-between` row spaces its
  last line differently from its first. The two-copy hover slide is kept, with the icon outside
  the clipped box so it stays put while the label travels.
- **Gallery is four to a row.** Changed from the two-column mosaic at the owner's request. Four
  across the 824px content width with the template's 16px gap puts each tile at 194px, 92px tall
  at the screenshots' 2.1 ratio — contact-sheet thumbnails. Six tiles means the second row holds
  two; that is left alone, since stretching them would break the shared ratio.
- **The 31 unreferenced template images were deleted.** Verified restorable first: the download
  script is gone (it went with `scripts/`), so git is the only restore path — all 31 were
  confirmed tracked in HEAD before removal, and `git restore <path>` brings any of them back.
  Verified safe after: every window and desktop icon was opened and swept, 364 distinct images
  checked, 0 broken. That sweep is not optional — `next/image` resolves its `src` at runtime, so
  a green build proves nothing about a missing file.
- **The Gallery window now shows the project screenshots.** Nine stock photos in three portrait
  masonry columns became the same six project shots the Projects window uses, in a two-column
  mosaic that alternates one 824x392 tile with a pair at 404x192 — chosen so the 2.1 screenshots
  are never cropped. It stays image-only and static, which is both the live site's behaviour and
  what stops it duplicating Projects; only `alt` changed, from decorative `""` to the real
  descriptions. See `components/GalleryWindow.spec.md`.
- **The Resume window was replaced on request and no longer clones anything.** The live site
  fills it with eight cards for the template author's design tools; it now embeds the owner's
  actual CV (`public/Le-Ngoc-Ha-Senior-Frontend-Developer.pdf`, 3.6MB, two pages) in the
  browser's PDF viewer, with an Open / Download status bar and a small-screen fallback for
  mobile browsers that will not render a PDF in an iframe. The dead `ResumeTool` type went with
  it. Body height is `calc(100% - 44px)` because the title bar lives inside the scroll
  container — see `components/ResumeWindow.spec.md`.
- **31 template images are now unreferenced but deliberately kept.** All of them are template
  content that has been replaced or intentionally dropped: `projects-*`, `resume-*`, `about-*`,
  two `journal-*`, `dock-instagram`/`dock-framer`, `menubar-apple.svg` (the menu bar shows the
  owner's favicon instead) and the two `wallpaper-arrow-*.svg` (the live carousel never renders
  its arrows). Note `projects-08.png` and `projects-10.png` are NOT orphaned — Journal, Gallery
  and Recycle Bin reuse them. Deleting any of this is the owner's call.
- **The Projects window was rebuilt on request and no longer matches the live site.** Twelve
  194px stock-photo cards became six real projects at 404px two-up, and the title-bar switch now
  picks a column count (Grid / List) rather than a crop height (Masonry / Grid). Five of the six
  cards open a link; `Newsletter builder` has nothing public to point at and stays inert. All
  content and all six screenshots come from lengocha.vercel.app — the shots were taken from
  `/_astro/<hashed>.png`, which serves the ~1913x912 originals rather than the 610x290 the page
  requests. `projects-01..12.png` are now unreferenced but left on disk. Reasoning, the measured
  numbers and two things that will break if touched (`data-no-drag`, `min-h-0`) are in
  `components/ProjectsWindow.spec.md`.
- **The About window was redesigned on request and no longer matches the live site.** The body
  is now two regions — portrait + intro/counters/Expertise/Stack at 330+24+470, then Experience
  full width — because the first region doubles as the portrait's sticky containing block, so
  the pin releases exactly where Stack ends. Experience became a rising timeline with an arrow
  running past the last milestone, gained a missing entry (FPT Software, 2021, Intern), flipped
  to oldest-first and uses short company names to fit ~165px columns. Stack items carry
  hand-drawn brand logos from `StackIcons.tsx`. The second column of both bullet blocks is now
  half the 470px column so it sits under the second counter (all three measured at x = 906.5),
  replacing a measured flush-right 155px. The template's "Tools I Use" block was dropped
  entirely. Full reasoning, the measured numbers and three traps worth knowing — a grid gap that
  breaks percentage geometry, mixing px and % on one SVG axis, and SVG gradient units — are in
  `components/AboutWindow.spec.md`.
- **`src/app/favicon.ico` had to be deleted, not just unreferenced.** In the App Router, file
  convention beats configuration: while `src/app/favicon.ico` existed, Next.js emitted
  `<link rel="icon" href="/favicon.ico?…">` and the `metadata.icons.icon` value was ignored
  entirely. The tag only switched to `seo/favicon.svg` once the scaffold `.ico` was removed. It
  was git-tracked, so `git checkout src/app/favicon.ico` restores it. `/favicon.ico` now 404s,
  which is harmless — every browser follows the `<link rel="icon">` instead.
- **The OG capture is a crop, not a 1:1 screenshot.** The viewport could not be driven to
  1200x630, so the shot is 1440x900 and 144px of height had to go to reach the 1.905:1 card
  ratio. Content spans 876 of the 900px (menu bar y 0-29, icons y 160-415, dock y 782-876), so
  nothing could simply be cropped away: the body is taken from y=131 and the original 1440x29
  menu-bar strip is composited back over the top, which keeps the owner's name in the card and
  hides the wallpaper seam on an edge that is meant to be there. Rebuild with
  `og-source-1440x900.png` in the design-references folder. Note that the Next.js dev indicator
  (`<nextjs-portal>`) sits in the bottom-left in dev mode and MUST be removed from the DOM
  before capturing.

### About window — real content

Layout, typography and spacing stay exactly as measured from the live site. Only the copy, the
figures and the portrait changed, all sourced from Lê Ngọc Hà's CV:

| Slot | Was | Now |
| --- | --- | --- |
| Window title | `Our work with Norma` | `About Lê Ngọc Hà` |
| Heading | `Hey, I'm Jalvy.` | `Hey, I'm Hà.` |
| Signature | `Jalvy` | `Hà` |
| Portrait | `about-portrait.png` (stock) | `Le_Ngoc_Ha.jpg` (1920×2560, supplied by the owner) |
| Counters | Projects 45+ / Clients 28+ / Experience 6 Years / Countries 12 | Experience 5 Years / Faster Page Load 60% / Juniors Mentored 5 / Productivity Gain 30% |
| Bullet block 1 | `Service` — design services | `Expertise` — architecture, performance, leadership, CI/CD security |
| Bullet block 2 | `Featured Client` — Framer, Webflow… | `Stack` — React, Next.js, TypeScript, Spring Boot, Turborepo, Docker, GitLab CI/CD, Vercel |
| Experience table | 5 fictional design roles | 3 real roles (SAPP Academy, Tweet World Travel, Minastik JSC) + HUST education |
| Tools I Use | Framer / Figma / Webflow | React & Next.js / TypeScript / Monorepo & CI/CD |

Notes:
- **Every counter is a figure from the CV**, not an estimate: ~5 years' experience, the 60%
  page-load cut on the SAPP LMS (15.2s → 6.1s), 5 juniors mentored, 30% productivity gain.
- **The "Tools I Use" bar percentages are the one judgement call** — a self-assessed proficiency
  rather than a measured number. They are commented as such in `AboutDetails.tsx`.
- **The two team-member photo cards were removed, not refilled.** They held stock portraits of
  invented people; there was no real content for them, and renaming stock faces would be
  fabrication. The markup is in git history if two genuine images turn up.
- The source template's inconsistent bullet spacing was a quirk of *its* copy, so the new bullets
  use uniform spacing.
- Content is in English to stay consistent with the rest of the site (Projects, Journal, Resume are
  all English). It can be switched to Vietnamese on request.

Red still closes, matching the original. Both toggles restore the window to its previous size
*and* its dragged position — the drag offset is preserved rather than cleared.

Implementation notes (`WindowFrame.tsx`), all driven by one `WindowMode` union
(`"normal" | "maximized" | "minimized"`):

**Shared**
- The element stays `left: 50%` in every mode, so only lengths change and the geometry can
  transition smoothly (260ms ease) instead of jumping.
- The transition is suppressed while a drag is in progress, otherwise the window lags the pointer.
- Dragging is disabled in both non-normal modes.
- Each button's accessible name flips to `Restore` when its mode is active, and carries `aria-pressed`.

**Maximised**
- `width: 100vw`, `height: calc(100dvh - 29px)`, `top: 29px`. It deliberately stops below the menu
  bar rather than covering the whole viewport: the menu bar sits at `z-index: 5` and the window at
  `z-index: 4`, so a full-viewport window would bury its own title bar — and its traffic lights —
  under the menu bar, leaving no way to un-maximise.

**Minimised**
- Scale is derived from an **area** ratio: `MINIMIZED_AREA_RATIO = 0.1` gives a linear
  `sqrt(0.1) ≈ 0.3162`, so an 864×630 window renders at roughly 273×199. Set that constant to
  `0.9` if the intent was to *keep* 90% of the area instead of removing it.
- Anchored with `transform-origin: 0% 100%` (bottom-left) plus
  `translate(calc(16px - 50vw), 0) scale(…)`, and `top: calc(100dvh - 16px - height)`. The scale is
  on the transform rather than on width/height so the whole window shrinks proportionally — title
  bar, traffic lights and content alike — reading as a genuine preview rather than a small window.
- **Click anywhere on a minimised window to restore it.** This is not decoration: at 0.316 scale
  the 12px traffic lights render under 4px across and are not realistically clickable, so without
  it a window could be minimised and never recovered. While minimised the lights are also made
  click-through and removed from the tab order, leaving exactly one unambiguous action.

## Known remaining deviations

1. **About window content height: 1822px vs the original's 1814px** (+0.4%). Every section origin
   is within 1–4px and every x-offset and width matches exactly; the drift is sub-pixel
   accumulation across the counter cells and team cards, which the source renders at fractional
   heights (e.g. `78.5938px`).
2. **Contact window: 1006px vs 1001px** (+0.5%) — same cause.
3. **Pre-loader title block sits ~10px higher** than the original. All typography (family, size,
   line-height, tracking, colour, 22 letter spans) matches exactly; only the vertical centring of
   the block within the full-screen container differs. Visible for ~3 seconds on first load.
4. **Responsive behaviour below 864px is an adaptation, not a measurement.** The live site does not
   reflow its windows at narrow widths — it clips them. The clone adds graceful stacking fallbacks
   so windows stay usable on small screens. Desktop, tablet (900px) and mobile (390px) shell layouts
   are all pixel-exact against measurements.
