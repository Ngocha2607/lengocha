"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { PORTOS_ASSETS, type DockItem, type PortosAppId } from "@/types/portos";

interface DockProps {
  onOpen: (app: PortosAppId) => void;
}

/** The eight pinned icons, in the live site's order. */
const DOCK_ITEMS: DockItem[] = [
  { name: "Finder", icon: `${PORTOS_ASSETS}/images/dock-finder.png`, alt: "Finder", app: "projects" },
  {
    name: "Launchpad",
    icon: `${PORTOS_ASSETS}/images/dock-launchpad.png`,
    alt: "Launchpad",
    app: "journal",
  },
  {
    name: "Contacts",
    icon: `${PORTOS_ASSETS}/images/dock-contacts.png`,
    alt: "Contacts",
    app: "contact",
  },
  {
    name: "Messages",
    icon: `${PORTOS_ASSETS}/images/dock-messages.png`,
    alt: "Messages",
    app: "resume",
  },
  // The template's two external icons pointed at its own author's Instagram and
  // Framer profiles. Swapped for Lê Ngọc Hà's real profiles — and the icons swapped
  // with them, so the mark always matches where the link actually goes.
  {
    name: "LinkedIn",
    icon: `${PORTOS_ASSETS}/images/dock-linkedin.svg`,
    alt: "LinkedIn",
    href: "https://www.linkedin.com/in/ng%E1%BB%8Dc-h%C3%A0-l%C3%AA-886aa3228/",
  },
  { name: "Notes", icon: `${PORTOS_ASSETS}/images/dock-notes.png`, alt: "Notes", app: "about" },
  {
    name: "GitHub",
    icon: `${PORTOS_ASSETS}/images/dock-github.svg`,
    alt: "GitHub",
    href: "https://github.com/Ngocha2607",
    hideOnMobile: true,
  },
  { name: "Photos", icon: `${PORTOS_ASSETS}/images/dock-photos.png`, alt: "Photos", app: "gallery" },
];

/** Sits outside the wrapper, after the divider. Stays 76px on tablet. */
const TRASH_ITEM: DockItem = {
  name: "Recycle Bin",
  icon: `${PORTOS_ASSETS}/images/dock-trash.png`,
  alt: "Trash",
  app: "recycleBin",
};

/** Hover shrinks the icon to 90% — a press-in, not macOS magnification. */
const ICON_BASE =
  "block shrink-0 cursor-pointer rounded-none transition-transform duration-200 ease-[ease-out] hover:scale-90";

/** 34px on mobile, 73px on tablet, 76px on desktop. */
const APP_ICON_SIZE = "size-[34px] min-[810px]:size-[73px] min-[1200px]:size-[76px]";

/** 34px on mobile, 76px from tablet up — the trash never shrinks to 73. */
const TRASH_ICON_SIZE = "size-[34px] min-[810px]:size-[76px]";

/**
 * Per-icon inset, applied to the `<img>` so `object-contain` fits the artwork
 * into a smaller content box.
 *
 * Every dock icon is drawn inside a transparent margin, so its artwork fills
 * 81.64% of the square canvas — 62.5px of the 76px desktop slot, measured on the
 * rendered pixels at 4x supersampling. Two assets sit outside that baseline and
 * are pulled back onto it here. Both are DELIBERATE DIVERGENCES: the live site
 * renders each one exactly as its asset is drawn, and evening them out is the
 * owner's call, not a fidelity fix. Do not "correct" them back.
 *
 *   Notes        88.7% -> 67.5px.  Ships with less margin than its siblings.
 *                3.66% a side leaves a 70.43px box; 70.43 * 0.887 = 62.5.
 *
 *   Recycle Bin  a bare object rather than a tile, 55.5 x 69.5px, so it stood
 *                6.2px taller than the app icons (and 7px narrower). Normalised
 *                on HEIGHT, the dimension that overshot: 5.03% a side leaves a
 *                68.35px box, and 68.35 * (69.5/76) = 62.5. Lands at 49.9x62.5,
 *                so the can now matches the tiles' height and stays narrower,
 *                which is correct for its silhouette.
 *
 * Corrected with padding rather than by re-encoding the PNGs, so the downloaded
 * assets stay byte-identical to the originals. Percentage padding resolves
 * against the (square) box, so one value per icon holds at 34px, 73px and 76px
 * alike.
 *
 * `dock-contacts.png` is NOT listed on purpose: its tile is pixel-identical to
 * Finder and the extra 2.8px is the address book's coloured index tabs bleeding
 * past the right edge. Insetting it would shrink the tile to hide a design
 * element. See `components/Dock.spec.md` for the row-by-row edge profile.
 *
 * The two hand-drawn SVGs need no entry — the same 81.64% inset is baked into
 * their own viewBox, next to a comment saying so.
 */
const ICON_INSET: Partial<Record<string, string>> = {
  Notes: "p-[3.66%]",
  "Recycle Bin": "p-[5.03%]",
};

function DockIcon({
  item,
  sizeClass,
  onOpen,
}: {
  item: DockItem;
  sizeClass: string;
  onOpen: (app: PortosAppId) => void;
}) {
  const image = (
    <Image
      src={item.icon}
      alt={item.alt}
      width={76}
      height={76}
      className={cn("h-full w-full rounded-none object-contain", ICON_INSET[item.name])}
    />
  );

  const className = cn(ICON_BASE, sizeClass, item.hideOnMobile && "max-[809px]:hidden");

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={item.alt}
        data-framer-name={item.name}
        className={className}
      >
        {image}
      </a>
    );
  }

  const app = item.app;

  return (
    <button
      type="button"
      aria-label={item.alt}
      data-framer-name={item.name}
      className={className}
      onClick={app ? () => onOpen(app) : undefined}
    >
      {image}
    </button>
  );
}

/**
 * The macOS dock. Renders the bar only — the desktop positions it along the
 * bottom edge. 775x94 from 810px up, full-width and 52px tall below that.
 */
export function Dock({ onOpen }: DockProps) {
  return (
    <div
      data-framer-name="Menu Bar"
      className={cn(
        "flex items-center justify-center overflow-clip bg-[rgba(40,40,40,0.6)] px-[8px] py-[9px] backdrop-blur-[14px]",
        "shadow-[0px_3px_3px_0px_rgba(0,0,0,0.24)]",
        "h-[52px] w-full gap-[8px] rounded-[12px]",
        "min-[810px]:h-[94px] min-[810px]:w-[775px] min-[810px]:gap-[16px] min-[810px]:rounded-[24px]",
      )}
    >
      <div
        data-framer-name="Menu Wrapper"
        className={cn(
          "flex items-center overflow-clip",
          "h-[34px] flex-1 justify-start gap-[6px]",
          "min-[810px]:h-[73px] min-[810px]:w-[650px] min-[810px]:flex-none min-[810px]:justify-center",
          "min-[1200px]:h-[76px]",
        )}
      >
        {DOCK_ITEMS.map((item) => (
          <DockIcon key={item.name} item={item} sizeClass={APP_ICON_SIZE} onOpen={onOpen} />
        ))}
      </div>
      <div
        data-framer-name="Line"
        className="h-[32px] w-px shrink-0 bg-[rgb(104,104,104)] min-[810px]:h-[72px]"
      />
      <DockIcon item={TRASH_ITEM} sizeClass={TRASH_ICON_SIZE} onOpen={onOpen} />
    </div>
  );
}
