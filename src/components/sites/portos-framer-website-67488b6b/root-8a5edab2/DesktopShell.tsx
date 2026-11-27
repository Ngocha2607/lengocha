"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent, type OpenVia, type TrackedSection } from "@/lib/analytics";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALES, type Locale } from "@/i18n/locale";
import { pathForApp } from "@/lib/sections";
import {
  PORTOS_ASSETS,
  type PortosAppId,
  type WindowGeometry,
} from "@/types/portos";
import { AboutWindow } from "./AboutWindow";
import { ContactWindow } from "./ContactWindow";
import { DesktopIcons } from "./DesktopIcons";
import { DesktopIntro } from "./DesktopIntro";
import { Dock } from "./Dock";
import { GalleryWindow } from "./GalleryWindow";
import { WritingWindow } from "./WritingWindow";
import { MenuBar } from "./MenuBar";
import { PreLoader } from "./PreLoader";
import {
  ProjectsToggle,
  ProjectsWindow,
  type ProjectsMode,
} from "./ProjectsWindow";
import { RecycleBinWindow } from "./RecycleBinWindow";
import { ResumeWindow } from "./ResumeWindow";
import { DecisionsWindow } from "./DecisionsWindow";
import { ExperienceWindow } from "./ExperienceWindow";
import { Spotlight } from "./Spotlight";
import { WindowFrame } from "./WindowFrame";
import { fetchPostList, type PostDetail, type PostMeta } from "./writingClient";

interface WindowDef {
  title: string;
  geometry: WindowGeometry;
  /** Measured distance from the top of the viewport. */
  top: number;
  /** The About window's title bar uses Inter 16px, unlike every other window. */
  titleFont?: "sf" | "inter";
}

/**
 * Measured on the live site. Every window is 864×630 at `top: 68` except one:
 * the window the template used for Wallpaper, now Experience, which is 720×596
 * and sits 21px lower at `top: 89`. The geometry is kept as measured even though
 * its contents changed — 680px of text is a better reading width than 824.
 */
const STANDARD: WindowGeometry = { width: 864, height: 630 };

/**
 * 12px-wide WebP of the wallpaper, inline at 84 bytes. Only ever visible to
 * `prefers-reduced-motion` visitors, for whom the splash leaves after 200ms
 * rather than 2.6s — everyone else has the real bitmap long before the desktop
 * is uncovered. See the matching note in PreLoader.tsx.
 */
const MOUNTAIN_BLUR =
  "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoMAAgAA8BgJbACdADSR0UAAAD+WmpGwRqyZyd3ic+8FcYoLYPKqBF+fBLzMr8HdnKl8rNhJKVsAAAA";

const WINDOWS: Record<PortosAppId, WindowDef> = {
  // Title is the owner's, not the template's ("Our work with Norma"). The Inter
  // title font is kept — that is a real quirk of the source, see WindowFrame.
  about: {
    title: "About",
    geometry: STANDARD,
    top: 68,
    titleFont: "inter",
  },
  projects: { title: "Projects", geometry: STANDARD, top: 68 },
  writing: { title: "Writing", geometry: STANDARD, top: 68 },
  contact: { title: "Contact", geometry: STANDARD, top: 68 },
  resume: { title: "Resume", geometry: STANDARD, top: 68 },
  gallery: { title: "Gallery", geometry: STANDARD, top: 68 },
  recycleBin: { title: "Recycle Bin", geometry: STANDARD, top: 68 },
  experience: { title: "Experience", geometry: STANDARD, top: 68 },
  decisions: {
    title: "Leadership & Technical Decisions",
    geometry: STANDARD,
    top: 68,
  },
};

const BASE_Z = 4;

/**
 * How many cascade steps before the stack starts over.
 *
 * Slots go to the LOWEST FREE one rather than being counted off the number of
 * open windows: open two, close the first, open a third, and a count would hand
 * the third the second's slot and stack them exactly. Wrapping at eight keeps
 * the ninth from marching off the corner.
 *
 * What a slot is worth in pixels is WindowFrame's business — an open window and
 * a parked one step by different amounts, and only that file knows the scale
 * each is drawn at.
 */
const CASCADE_WRAP = 8;

/** Above every window. Windows sit at BASE_Z upward, nine apps at most. */
const DOCK_Z = 20;

/** Everything Spotlight can open directly, in menu order. */
const SPOTLIGHT_WINDOWS = (Object.keys(WINDOWS) as PortosAppId[]).map((app) => ({
  app,
  title: WINDOWS[app].title,
}));

/** The windows `window_open` reports — every content window, not the Recycle Bin. */
const TRACKED_SECTIONS: ReadonlySet<PortosAppId> = new Set<TrackedSection>([
  "about",
  "experience",
  "projects",
  "writing",
  "contact",
  "resume",
  "decisions",
  "gallery",
]);

/**
 * Reports a window that was not open becoming open. Resume doubles as the CV,
 * so it also reports `cv_open`.
 */
function reportWindowOpen(app: PortosAppId, via: OpenVia): void {
  if (!TRACKED_SECTIONS.has(app)) return;
  trackEvent("window_open", { section: app as TrackedSection, via });
  if (app === "resume") trackEvent("cv_open", { via });
}

/**
 * The URL the desktop should show in a language: the front window's own page,
 * the article the Writing window is on, or the home page when nothing is open.
 * Every one of these is a real route (see app/(vi) and app/en), so whatever a
 * visitor copies out of the address bar opens the same view.
 *
 * An article has ONE URL, the Vietnamese `/writing/<slug>`, whichever desktop
 * it is read in: there is no English twin to point at.
 */
function pathForView(
  front: PortosAppId | null,
  writingView: string | null,
  locale: Locale,
): string {
  if (front === "writing" && writingView) return `/writing/${writingView}`;
  const home = locale === "en" ? "/en" : "/";
  if (front === null) return home;
  return pathForApp(front, locale) ?? home;
}

/**
 * Where the VI | EN switch goes from the current view: the same window in the
 * other language. An article has no English twin, so from an article EN goes
 * to the English Writing list, and VI to the article itself.
 */
function switchTargets(front: PortosAppId | null, writingView: string | null): Record<Locale, string> {
  const targets = {} as Record<Locale, string>;
  for (const locale of LOCALES) {
    targets[locale] =
      locale === "en" && front === "writing" && writingView
        ? pathForView("writing", null, "en")
        : pathForView(front, writingView, locale);
  }
  return targets;
}

interface DesktopShellProps {
  /**
   * Set by every route except the home page: boot with this window open. Its
   * content is then part of the server HTML, which is the point — crawlers
   * that run no JavaScript read the window the URL names.
   */
  initialApp?: PortosAppId | null;
  /** Set by the /writing/[slug] route: open Writing on this article. */
  initialWritingSlug?: string | null;
  /** The Writing list as the server read it, so /writing renders it without a fetch. */
  initialPosts?: PostMeta[] | null;
  /** The booted article, rendered on the server, so /writing/[slug] ships its body. */
  initialPost?: PostDetail | null;
}

/**
 * The macOS desktop: wallpaper, always-on scrim, menu bar, icons, dock, and the
 * stack of open windows. Multiple windows can be open at once; the most recently
 * opened or focused one renders on top, matching the live site's DOM-order stacking.
 */
export function DesktopShell({
  initialApp = null,
  initialWritingSlug = null,
  initialPosts = null,
  initialPost = null,
}: DesktopShellProps) {
  /**
   * The route's language — `en` under /en, Vietnamese everywhere else — from
   * the LocaleProvider the route wraps the shell in (app/_shared). Every
   * window reads the same context.
   */
  const locale = useLocale();
  /**
   * The window a route boots with, and only until the visitor closes it. It is
   * mounted while the pre-loader still covers the desktop (on the server, in
   * fact), where the genie entrance would fly ABOVE the splash — its overlay
   * outranks everything — so that one window skips the entrance. Reopening it
   * later plays the genie as normal.
   */
  const [bootApp, setBootApp] = useState<PortosAppId | null>(initialApp);
  const [open, setOpen] = useState<PortosAppId[]>(() =>
    initialApp ? [initialApp] : [],
  );
  const [projectsMode, setProjectsMode] = useState<ProjectsMode>("grid");
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  /**
   * Which article the Writing window should open on. Set when a project card
   * points at an internal write-up; cleared when Writing is opened any other
   * way, so the dock icon always lands on the list.
   */
  const [writingSlug, setWritingSlug] = useState<string | null>(initialWritingSlug);
  /**
   * What the Writing window is SHOWING right now — `writingSlug` above is only
   * where it started, and the window navigates on its own after that (cards,
   * Back, links between articles). Tracked separately because changing
   * `writingSlug` remounts the window body, which this must not do.
   */
  const [writingView, setWritingView] = useState<string | null>(initialWritingSlug);
  /**
   * Counts how many times each app has been asked to open. A window that is
   * parked watches this and unparks itself, so a dock icon reaches a minimised
   * window rather than silently doing nothing.
   */
  const [openCount, setOpenCount] = useState<
    Partial<Record<PortosAppId, number>>
  >({});
  /** Per-window cascade slot, held only while the window is open. */
  const [cascade, setCascade] = useState<Partial<Record<PortosAppId, number>>>(
    () => (initialApp ? { [initialApp]: 0 } : {}),
  );

  /**
   * The open windows as of the last render, for the open handlers: they report
   * a window only when it was NOT already open (a dock click on an open or
   * parked window brings it forward; that is not a new open). Read from a ref
   * so the handlers keep a stable identity, and so the report is made in the
   * handler itself rather than inside a state updater, which React may run
   * twice.
   */
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /**
   * The window a deep link booted with counts as opened, once. The ref keeps
   * a development-mode double mount from reporting it twice.
   */
  const bootReported = useRef(false);
  useEffect(() => {
    if (bootReported.current || !initialApp) return;
    bootReported.current = true;
    reportWindowOpen(initialApp, "url");
  }, [initialApp]);

  /** The window on top. It is "the page": it owns the address bar and the H1. */
  const front = open.length > 0 ? open[open.length - 1] : null;
  const viewPath = pathForView(front, writingView, locale);

  /**
   * Mirrors the front window into the address bar WITHOUT a router
   * navigation: a Next navigation would remount the shell and replay the
   * pre-loader, when all that changed is which window is on top.
   *
   * Only the path is compared and written, so a query string the visitor
   * arrived with (utm tags, say) survives the first render untouched.
   */
  useEffect(() => {
    if (window.location.pathname === viewPath) return;
    window.history.replaceState(null, "", viewPath);
  }, [viewPath]);

  /**
   * Warm the article index the moment the desktop exists. One tiny request, and
   * it makes three other things fast: the Writing list opens filled, Spotlight
   * searches articles on its first keystroke, and the SERVER starts pre-rendering
   * every article body (see warmPostCache) before anything is clicked.
   */
  useEffect(() => {
    void fetchPostList().catch(() => {
      // The Writing window reports properly when it actually opens.
    });
  }, []);

  // ⌘K / Ctrl+K from anywhere on the desktop.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSpotlightOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Claims the lowest step nobody is standing on. */
  const claimCascade = useCallback((app: PortosAppId) => {
    setCascade((current) => {
      if (current[app] !== undefined) return current;
      const taken = new Set(Object.values(current));
      let slot = 0;
      while (taken.has(slot % CASCADE_WRAP)) slot++;
      return { ...current, [app]: slot % CASCADE_WRAP };
    });
  }, []);

  const openWindow = useCallback(
    (app: PortosAppId) => {
      if (!openRef.current.includes(app)) reportWindowOpen(app, "desktop");
      if (app === "writing") {
        setWritingSlug(null);
        setWritingView(null);
      }
      claimCascade(app);
      setOpenCount((current) => ({
        ...current,
        [app]: (current[app] ?? 0) + 1,
      }));
      setOpen((current) => [...current.filter((id) => id !== app), app]);
    },
    [claimCascade],
  );

  /** A project card asking for its write-up: open Writing already on that article. */
  const openWriting = useCallback(
    (slug: string) => {
      if (!openRef.current.includes("writing")) reportWindowOpen("writing", "desktop");
      setWritingSlug(slug);
      setWritingView(slug);
      claimCascade("writing");
      setOpen((current) => [
        ...current.filter((id) => id !== "writing"),
        "writing",
      ]);
    },
    [claimCascade],
  );

  const closeWindow = useCallback((app: PortosAppId) => {
    // The boot window is gone; any later window of that app earns its entrance.
    setBootApp((current) => (current === app ? null : current));
    setOpen((current) => current.filter((id) => id !== app));
    // Releases the step so the next window can stand on it.
    setCascade((current) => {
      if (current[app] === undefined) return current;
      const next = { ...current };
      delete next[app];
      return next;
    });
  }, []);

  const focusWindow = useCallback((app: PortosAppId) => {
    setOpen((current) =>
      current[current.length - 1] === app
        ? current
        : [...current.filter((id) => id !== app), app],
    );
  }, []);

  const renderBody = (app: PortosAppId) => {
    switch (app) {
      case "about":
        return <AboutWindow />;
      case "projects":
        return (
          <ProjectsWindow mode={projectsMode} onOpenWriting={openWriting} />
        );
      case "writing":
        // Keyed by slug so arriving from a project card re-opens the body on
        // that article even when the window is already up. Only the body
        // remounts; the frame stays, so this does not replay the genie.
        return (
          <WritingWindow
            key={writingSlug ?? "list"}
            initialSlug={writingSlug}
            initialPosts={initialPosts}
            // Only for the article it was rendered for: a project card can
            // re-point this window at another one.
            initialPost={initialPost && initialPost.slug === writingSlug ? initialPost : null}
            onSlugChange={setWritingView}
          />
        );
      case "contact":
        return <ContactWindow />;
      case "resume":
        return <ResumeWindow />;
      case "gallery":
        return <GalleryWindow />;
      case "recycleBin":
        return <RecycleBinWindow />;
      case "experience":
        return <ExperienceWindow />;
      case "decisions":
        return <DecisionsWindow />;
    }
  };

  return (
    <div className="portos-root">
      {/* Desktop background — swapped on request from the template's forest
          (`desktop-wallpaper.jpg`, 3840x2160) to a mountain shot. The forest stays
          on disk, unreferenced, so switching back is a one-line change.

          The source is 6000x4000, comfortably past the ladder's 3840 ceiling, so
          this is never upscaled at any viewport or DPR.

          Everything else here exists to keep this layer OFF the pre-loader's
          critical path, because for the first 2.6s it is completely hidden behind
          the splash:
          - `sizes` is 100vw, not the pre-loader's 200vw. Nothing zooms this layer,
            so the extra width bought nothing — and it pushed a 390px phone at
            DPR 3 onto the 3840 render, measured at 1.5MB against 132KB for 1200.
          - `loading="eager"` still starts the fetch immediately, but
            `fetchPriority="low"` makes it yield to the splash bitmap, which is
            what the visitor is actually looking at. This was `priority`
            (deprecated in Next 16), which did the exact opposite. */}
      <Image
        src={`${PORTOS_ASSETS}/images/mountain-bg.jpg`}
        alt=""
        fill
        loading="eager"
        fetchPriority="low"
        sizes="150vw"
        quality={90}
        placeholder="blur"
        blurDataURL={MOUNTAIN_BLUR}
        className="object-cover"
      />
      {/* Constant scrim — measured at rgba(0,0,0,0.24) whether or not a window is open. */}
      <div className="absolute inset-0 bg-black/24" aria-hidden="true" />

      <MenuBar
        onOpen={openWindow}
        onSearch={() => setSpotlightOpen(true)}
        languageTargets={switchTargets(front, writingView)}
      />

      {/* Desktop container: inset 50px (desktop) / 30px (tablet) / 20px (mobile),
          24px from the bottom at every breakpoint. At the desktop breakpoint only, the
          icon block and dock sit inside a further 16px left inset — measured on the live
          site as Content `50,160 1340x716` vs its inner block `66,160 1324x255`, which is
          also what puts the dock's centre at 340.5 rather than the container's 720. */}
      <div className="absolute inset-x-5 bottom-6 top-[120px] flex flex-col justify-between min-[810px]:inset-x-[30px] min-[810px]:top-[130px] min-[1200px]:inset-x-[50px] min-[1200px]:top-40 min-[1200px]:pl-4">
        <DesktopIcons onOpen={openWindow} />
        {/* The intro widget, placed so that neither its size nor its closing
            can move anything else (CLS stays at zero either way).

            On a phone it sits at the TOP of the column between the folders
            and the dock, full width inside the gutters. That column is
            `flex-1`, so its height comes from the space left over, not from
            the widget: closing the widget leaves the dock where it was. It
            scrolls inside that gap if a short screen cannot show all of it.

            From 810px it leaves the flow for the desktop's right edge, under
            the Experience folder: 104px down clears the folder (78.59px) and
            its hover plate (6px more), and `right-0` lines it up with the
            container's edge, 100px right of the folder. The column stays
            exactly the measured folders-and-dock layout. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[810px]:absolute min-[810px]:top-[104px] min-[810px]:right-0 min-[810px]:block min-[810px]:overflow-visible min-[810px]:p-0">
          <DesktopIntro isPageHeading={front === null} onOpen={openWindow} />
        </div>
        {/* Lifted above the window stack: the dock is how you reach the other
            eight apps, and a maximised window used to bury it. It fades back
            while a window has the focus so it does not compete with what is
            being read, and comes back to full on hover. */}
        <div
          className="relative flex w-full justify-center"
          style={{ zIndex: DOCK_Z }}
        >
          <Dock onOpen={openWindow} dimmed={open.length > 0} />
        </div>
      </div>

      {/* Rendered on the server too: a route that boots with a window open
          ships that window's content in its HTML. WindowFrame is written to
          hydrate — see its `mode` and `warping` initialisers. */}
      {open.map((app, index) => {
        const def = WINDOWS[app];
        // One H1 per page: the front window's title, except while Writing is
        // on an article, whose own title is the heading.
        const isPageHeading = app === front && !(app === "writing" && writingView);
        return (
          <WindowFrame
            key={app}
            app={app}
            title={def.title}
            width={def.geometry.width}
            height={def.geometry.height}
            top={def.top}
            titleFont={def.titleFont}
            titleAs={isPageHeading ? "h1" : "p"}
            cascadeSlot={cascade[app] ?? 0}
            restoreSignal={openCount[app] ?? 0}
            skipEntrance={app === bootApp}
            zIndex={BASE_Z + index}
            onClose={() => closeWindow(app)}
            onFocus={() => focusWindow(app)}
            titleBarAccessory={
              app === "projects" ? (
                <ProjectsToggle
                  mode={projectsMode}
                  onChange={setProjectsMode}
                />
              ) : undefined
            }
          >
            {renderBody(app)}
          </WindowFrame>
        );
      })}

      {/* Mounted only while open, so its search state resets itself. */}
      {spotlightOpen ? (
        <Spotlight
          onClose={() => setSpotlightOpen(false)}
          onOpenApp={openWindow}
          onOpenWriting={openWriting}
          windows={SPOTLIGHT_WINDOWS}
        />
      ) : null}

      <PreLoader />
    </div>
  );
}
