# PAGE TOPOLOGY — portos.framer.website

## The page is one non-scrolling screen

`document.documentElement.scrollHeight === clientHeight === innerHeight`. There are no page
sections in the usual sense — this is a **macOS desktop simulation** that occupies exactly one
viewport. Everything else is windows that open on top of it.

## Layer stack (bottom → top)

| z | Layer | Notes |
| --- | --- | --- |
| — | Wallpaper `<img>` | `desktop-wallpaper.jpg`, fills the viewport, `object-fit: cover` |
| auto | `Layer` scrim | full-viewport `rgba(0, 0, 0, 0.24)`, **always on** — not tied to window state |
| — | Desktop icons | About / Wallpaper (top row), Projects (below left) |
| — | Dock | bottom-centred |
| 4 | Windows | every open window; later-opened renders above earlier (DOM order) |
| 5 | Menu bar | `position: absolute`, top strip — sits **above** windows |
| 10 | Pre-loader | `position: fixed`, covers everything, plays once then leaves |

Note the menu bar (`z-index: 5`) is above the windows (`z-index: 4`) — a window dragged upward
slides *under* the menu bar, as on real macOS.

## Desktop container geometry

The icons and dock live inside one `Container` inset from the viewport edges:

| Breakpoint | Container box | Side inset | Bottom inset |
| --- | --- | --- | --- |
| Desktop 1440×900 | `50,160 1340×716` | 50px | 24px |
| Tablet 900×1000 | `30,130 840×846` | 30px | 24px |
| Mobile 390×844 | `20,120 350×700` | 20px | 24px |

Inside it: the icon block sits top-left, the dock is bottom-centred.

## Components and their source elements

| Component | Live element | Role |
| --- | --- | --- |
| `PreLoader` | `Pre-Loader` | one-shot intro overlay |
| `MenuBar` | `header` | top strip, live clock |
| `DesktopIcons` | `All File & Title` | three folder icons |
| `Dock` | `Menu Bar` | 8 apps + divider + trash |
| `WindowFrame` | the `-container` / `Desktop` / `Navigation` triple | shared window chrome |
| `DesktopShell` | — | window manager (open set, z-order, focus) |

## Windows

Eight distinct windows. Any opener can open any of them; multiple can be open at once.

| Window | Title | Size | Content height | Notable |
| --- | --- | --- | --- | --- |
| `about` | `Our work with Norma` | 864×630 | 1814 | title uses **Inter 16px**, not SF Pro 14px |
| `projects` | `Overview of the Project` | 864×630 | 1134 / 894 | Masonry⟷Grid toggle in the title bar |
| `journal` | `Journal` | 864×630 | 1911 | narrower 680px column; **manual** slideshow |
| `contact` | `Contact` | 864×630 | 1001 | form |
| `resume` | `Resume` | 864×630 | 1158 | 8 cards, inert "Open" pills |
| `gallery` | `Gallery` | 864×630 | 1200 | 3×3 image grid, fully static |
| `recycleBin` | `Recycle Bin` | 864×630 | 717 | inert shortcuts + 4-col image grid |
| `wallpaper` | `Wallpaper` | **720×596** | fits | **auto-advancing** carousel, 32px body gap |

Every window opens at `top: 68px`, horizontally centred, and animates `scale(0.8) → scale(1)`.
The whole window is draggable (`cursor: grab`).

## Opener → window map

| Opener | Window |
| --- | --- |
| Desktop "About" | `about` |
| Desktop "Wallpaper" | `wallpaper` |
| Desktop "Projects" | `projects` |
| Dock Finder | `projects` |
| Dock Launchpad | `journal` |
| Dock Contacts | `contact` |
| Dock Messages | `resume` |
| Dock Instagram | external link |
| Dock Notes | `about` |
| Dock Framer | external link |
| Dock Photos | `gallery` |
| Dock Trash | `recycleBin` |

## Assembly order in `src/app/page.tsx`

```
<div className="portos-root">      // 100dvh, overflow hidden
  <img wallpaper />                 // fills
  <div scrim rgba(0,0,0,0.24) />
  <MenuBar />                       // z-5
  <div container>                   // inset per breakpoint
    <DesktopIcons onOpen={open} />
    <Dock onOpen={open} />          // bottom-centred
  </div>
  {openWindows.map(...)}            // z-4, each in a WindowFrame
  <PreLoader />                     // z-10, unmounts itself
</div>
```

`DesktopShell` owns the open-window list and z-order; `page.tsx` is a thin server component that
renders it.

## What is deliberately NOT reproduced

- Framer's **"Made in Framer"** attribution badge (`__framer-badge-container`) — Framer's own
  injected watermark on free sites, not part of the template design.
- The **11 zero-size honeypot inputs** in the contact form — Framer's spam protection.
- The DOM-level duplication Framer uses to fake infinite carousels — the clone reproduces the
  wrap-around behaviour instead.
