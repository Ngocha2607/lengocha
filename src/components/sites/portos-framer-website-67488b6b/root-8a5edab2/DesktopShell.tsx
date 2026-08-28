"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { PORTOS_ASSETS, type PortosAppId, type WindowGeometry } from "@/types/portos";
import { AboutWindow } from "./AboutWindow";
import { ContactWindow } from "./ContactWindow";
import { DesktopIcons } from "./DesktopIcons";
import { Dock } from "./Dock";
import { GalleryWindow } from "./GalleryWindow";
import { WritingWindow } from "./WritingWindow";
import { MenuBar } from "./MenuBar";
import { PreLoader } from "./PreLoader";
import { ProjectsToggle, ProjectsWindow, type ProjectsMode } from "./ProjectsWindow";
import { RecycleBinWindow } from "./RecycleBinWindow";
import { ResumeWindow } from "./ResumeWindow";
import { DecisionsWindow } from "./DecisionsWindow";
import { ExperienceWindow } from "./ExperienceWindow";
import { WindowFrame } from "./WindowFrame";

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
  about: { title: "About Lê Ngọc Hà", geometry: STANDARD, top: 68, titleFont: "inter" },
  projects: { title: "Overview of the Project", geometry: STANDARD, top: 68 },
  writing: { title: "Writing", geometry: STANDARD, top: 68 },
  contact: { title: "Contact", geometry: STANDARD, top: 68 },
  resume: { title: "Resume", geometry: STANDARD, top: 68 },
  gallery: { title: "Gallery", geometry: STANDARD, top: 68 },
  recycleBin: { title: "Recycle Bin", geometry: STANDARD, top: 68 },
  experience: { title: "Experience", geometry: { width: 720, height: 596 }, top: 89 },
  decisions: { title: "Highlights & Decisions", geometry: STANDARD, top: 68 },
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

/**
 * The macOS desktop: wallpaper, always-on scrim, menu bar, icons, dock, and the
 * stack of open windows. Multiple windows can be open at once; the most recently
 * opened or focused one renders on top, matching the live site's DOM-order stacking.
 */
export function DesktopShell() {
  const [open, setOpen] = useState<PortosAppId[]>([]);
  const [projectsMode, setProjectsMode] = useState<ProjectsMode>("grid");
  /**
   * Which article the Writing window should open on. Set when a project card
   * points at an internal write-up; cleared when Writing is opened any other
   * way, so the dock icon always lands on the list.
   */
  const [writingSlug, setWritingSlug] = useState<string | null>(null);
  /**
   * Counts how many times each app has been asked to open. A window that is
   * parked watches this and unparks itself, so a dock icon reaches a minimised
   * window rather than silently doing nothing.
   */
  const [openCount, setOpenCount] = useState<Partial<Record<PortosAppId, number>>>({});
  /** Per-window cascade slot, held only while the window is open. */
  const [cascade, setCascade] = useState<Partial<Record<PortosAppId, number>>>({});

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
      if (app === "writing") setWritingSlug(null);
      claimCascade(app);
      setOpenCount((current) => ({ ...current, [app]: (current[app] ?? 0) + 1 }));
      setOpen((current) => [...current.filter((id) => id !== app), app]);
    },
    [claimCascade],
  );

  /** A project card asking for its write-up: open Writing already on that article. */
  const openWriting = useCallback(
    (slug: string) => {
      setWritingSlug(slug);
      claimCascade("writing");
      setOpen((current) => [...current.filter((id) => id !== "writing"), "writing"]);
    },
    [claimCascade],
  );

  const closeWindow = useCallback((app: PortosAppId) => {
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
        return <ProjectsWindow mode={projectsMode} onOpenWriting={openWriting} />;
      case "writing":
        // Keyed by slug so arriving from a project card re-opens the body on
        // that article even when the window is already up. Only the body
        // remounts; the frame stays, so this does not replay the genie.
        return <WritingWindow key={writingSlug ?? "list"} initialSlug={writingSlug} />;
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

      <MenuBar onOpen={openWindow} />

      {/* Desktop container: inset 50px (desktop) / 30px (tablet) / 20px (mobile),
          24px from the bottom at every breakpoint. At the desktop breakpoint only, the
          icon block and dock sit inside a further 16px left inset — measured on the live
          site as Content `50,160 1340x716` vs its inner block `66,160 1324x255`, which is
          also what puts the dock's centre at 340.5 rather than the container's 720. */}
      <div className="absolute inset-x-5 bottom-6 top-[120px] flex flex-col justify-between min-[810px]:inset-x-[30px] min-[810px]:top-[130px] min-[1200px]:inset-x-[50px] min-[1200px]:top-40 min-[1200px]:pl-4">
        <DesktopIcons onOpen={openWindow} />
        {/* Lifted above the window stack: the dock is how you reach the other
            eight apps, and a maximised window used to bury it. It fades back
            while a window has the focus so it does not compete with what is
            being read, and comes back to full on hover. */}
        <div className="relative flex w-full justify-center" style={{ zIndex: DOCK_Z }}>
          <Dock onOpen={openWindow} dimmed={open.length > 0} />
        </div>
      </div>

      {open.map((app, index) => {
        const def = WINDOWS[app];
        return (
          <WindowFrame
            key={app}
            app={app}
            title={def.title}
            width={def.geometry.width}
            height={def.geometry.height}
            top={def.top}
            titleFont={def.titleFont}
            cascadeSlot={cascade[app] ?? 0}
            restoreSignal={openCount[app] ?? 0}
            zIndex={BASE_Z + index}
            onClose={() => closeWindow(app)}
            onFocus={() => focusWindow(app)}
            titleBarAccessory={
              app === "projects" ? (
                <ProjectsToggle mode={projectsMode} onChange={setProjectsMode} />
              ) : undefined
            }
          >
            {renderBody(app)}
          </WindowFrame>
        );
      })}

      <PreLoader />
    </div>
  );
}
