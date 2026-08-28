"use client";

import Image from "next/image";
import { PORTOS_ASSETS, type DesktopIcon, type PortosAppId } from "@/types/portos";

interface DesktopIconsProps {
  onOpen: (app: PortosAppId) => void;
}

interface DesktopIconButtonProps {
  icon: DesktopIcon;
  onOpen: (app: PortosAppId) => void;
}

/** Every desktop folder shares one artwork — intrinsic 236x236, rendered 58x59. */
const FOLDER_SRC = `${PORTOS_ASSETS}/images/folder.png`;

const ABOUT: DesktopIcon = { label: "About", app: "about" };
const EXPERIENCE: DesktopIcon = { label: "Experience", app: "experience" };
const PROJECTS: DesktopIcon = { label: "Projects", app: "projects" };

/**
 * The hover plate, behind both the folder artwork and its label.
 *
 * An addition, not a transcription — the live site hovers with the `scale(0.9)`
 * press-in alone, which is kept. These three folders are the desktop's primary
 * navigation and a 6px press was doing all the work of saying so.
 *
 * Wider than the 58px button on purpose, because the labels already overflow it:
 * measured at 1440, `Experience` is 63.7px wide against the button's 58, so it
 * overhangs 2.8px on each side. A plate clipped to the button would slice the
 * very word it is meant to be highlighting. -13px a side gives 84px, clearing
 * the longest label with ~10px to spare.
 *
 * Negative insets rather than padding on the button: that 58 x 78.59 box is
 * measured from the live site, and the row it sits in is `justify-between`, so
 * growing the button would walk the icons out of position.
 *
 * `pointer-events-none` keeps the plate from becoming the hover target itself.
 * It is the only positioned element here, so the artwork and label are marked
 * `relative` too and DOM order — plate first — is what puts it underneath.
 */
const HOVER_PLATE_CLASS =
  "pointer-events-none absolute -inset-x-[13px] -inset-y-[6px] rounded-[10px] " +
  "border border-white/20 bg-black/20 backdrop-blur-[6px] " +
  "opacity-0 transition-opacity duration-150 ease-out " +
  "group-hover:opacity-100 group-focus-visible:opacity-100";

/**
 * A single 58x78.59 desktop folder. Hovering the button presses the artwork in
 * (`scale(0.9)`, 0.2s ease-out) and raises a plate behind it; the label itself
 * is left untouched, as measured. A single click opens the matching window.
 */
function DesktopIconButton({ icon, onOpen }: DesktopIconButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(icon.app)}
      className="group relative flex h-[78.59px] w-[58px] cursor-pointer flex-col items-center justify-center"
    >
      <span aria-hidden="true" className={HOVER_PLATE_CLASS} />
      <span className="relative flex h-[59px] w-[58px] cursor-pointer items-center justify-center transition-transform duration-200 ease-out group-hover:scale-90">
        {/* Decorative, so the button takes its accessible name from the visible
            label below instead. Repeating the label in `alt` made every folder
            announce itself twice — "About About". The live site's own alt was
            the meaningless "Logo", so nothing is lost by dropping it. */}
        <Image
          src={FOLDER_SRC}
          alt=""
          width={58}
          height={59}
          className="h-[59px] w-[58px]"
        />
      </span>
      <p className="relative font-display text-[14px] font-normal leading-[19.6px] tracking-[-0.14px] text-white">
        {icon.label}
      </p>
    </button>
  );
}

/**
 * The three folders sitting on the desktop wallpaper: About and Experience on a
 * `space-between` row, Projects on its own left-aligned row 85px below (30px
 * below 810px, where the row also loses its 100px right padding).
 */
export function DesktopIcons({ onOpen }: DesktopIconsProps) {
  return (
    // `overflow-clip` is dropped from the transcription. It was already cutting
    // `Experience` by 2.8px on mobile, where that row loses its 100px right
    // padding and the icon sits flush against the container edge — the live site
    // never hit this because its third folder was the much shorter `Wallpaper`.
    // The hover plate overhangs further still, so the clip had to go either way.
    // Nothing else here overflows: the only transform is a scale DOWN on hover.
    <div className="flex w-full flex-col items-start justify-center gap-[85px] max-[809px]:gap-[30px]">
      {/* About & Experience Card — the live site's layer name said Wallpaper. */}
      <div className="flex h-[78.59px] w-full flex-row items-center justify-between pr-[100px] max-[809px]:pr-0">
        <DesktopIconButton icon={ABOUT} onOpen={onOpen} />
        <DesktopIconButton icon={EXPERIENCE} onOpen={onOpen} />
      </div>
      {/* "Journal File & Title Wrapper" — the live site's own Framer layer name,
          kept for provenance. It holds the Projects icon, not a journal, and the
          window it opens is now Writing. The name was already wrong upstream. */}
      <div className="flex w-full flex-row items-center justify-start">
        <div className="pt-[13px]">
          <DesktopIconButton icon={PROJECTS} onOpen={onOpen} />
        </div>
      </div>
    </div>
  );
}
