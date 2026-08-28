"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { PORTOS_ASSETS, type DockItem, type PortosAppId } from "@/types/portos";

interface DockProps {
  onOpen: (app: PortosAppId) => void;
}

/** The eight pinned icons, in the live site's order. */
const DOCK_ITEMS: DockItem[] = [
  {
    name: "Finder",
    icon: `${PORTOS_ASSETS}/images/dock-finder.png`,
    alt: "Finder",
    app: "projects",
    tooltip: "Projects",
  },
  {
    name: "Launchpad",
    icon: `${PORTOS_ASSETS}/images/dock-launchpad.png`,
    alt: "Launchpad",
    app: "writing",
    tooltip: "Writing",
  },
  {
    name: "Contacts",
    icon: `${PORTOS_ASSETS}/images/dock-contacts.png`,
    alt: "Contacts",
    app: "contact",
    tooltip: "Contact",
  },
  {
    name: "Messages",
    icon: `${PORTOS_ASSETS}/images/dock-messages.png`,
    alt: "Messages",
    app: "resume",
    tooltip: "Resume",
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
  {
    name: "Notes",
    icon: `${PORTOS_ASSETS}/images/dock-notes.png`,
    alt: "Notes",
    app: "decisions",
    tooltip: "Highlights & Decisions",
  },
  {
    name: "GitHub",
    icon: `${PORTOS_ASSETS}/images/dock-github.svg`,
    alt: "GitHub",
    href: "https://github.com/Ngocha2607",
    hideOnMobile: true,
  },
  {
    name: "Photos",
    icon: `${PORTOS_ASSETS}/images/dock-photos.png`,
    alt: "Photos",
    app: "gallery",
    tooltip: "Gallery",
  },
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

/**
 * The hover label macOS puts above a dock icon.
 *
 * `pointer-events-none` matters — the plate sits directly over the icon above
 * it in the stack, and without it hovering the label would count as leaving the
 * icon, so the thing would flicker.
 *
 * Shown on keyboard focus too, via `group-has-[:focus-visible]`, because the
 * focus lands on the control INSIDE the group rather than on the group itself.
 *
 * The offset is measured, not guessed. The requirement is that the caret's tip
 * clears the dock bar by 8px, and the plate is anchored to the ICON, which sits
 * a different distance below the bar's top edge at each breakpoint: 9px on
 * mobile and desktop, where the bar's 9px padding exactly contains the icons,
 * but 10.5px on tablet, where 73px icons are centred in the same 94px bar.
 * So the margin is that offset, plus the 8px gap, plus the caret's 6px height.
 */
const TOOLTIP_CLASS =
  "pointer-events-none absolute bottom-full left-1/2 z-10 -translate-x-1/2 " +
  "mb-[23px] min-[810px]:mb-[24.5px] min-[1200px]:mb-[23px] " +
  "rounded-[6px] bg-black/50 px-[20px] py-[12px] " +
  "font-sans text-[12px] leading-[17px] whitespace-nowrap text-[#e5e5e5] " +
  "shadow-[0_2px_10px_rgba(0,0,0,0.22)] " +
  "opacity-0 transition-opacity duration-150 ease-out " +
  "group-hover:opacity-100 group-has-[:focus-visible]:opacity-100";

/**
 * The caret that points down at the icon.
 *
 * A border triangle sitting flush BELOW the plate, where an earlier pass used a
 * square rotated 45 degrees and overlapping the plate's bottom edge. That only
 * worked while the plate was opaque: now that it is `black/60`, any overlap
 * would stack two translucent layers and draw a darker band across the join.
 * Flush and non-overlapping keeps one uniform alpha through the whole shape.
 *
 * Its 6px height is what the plate's bottom margin above accounts for.
 *
 * The plate is `absolute`, and an absolutely positioned box is itself a
 * containing block, so this needs no extra `relative` to anchor against.
 */
const TOOLTIP_CARET_CLASS =
  "absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 " +
  "border-x-[6px] border-x-transparent border-t-[6px] border-t-black/60";

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

  const className = cn(ICON_BASE, sizeClass);
  const app = item.app;

  const control = item.href ? (
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
  ) : (
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

  return (
    // The wrapper carries `hideOnMobile` now, so the label hides with its icon,
    // and it is what `group-hover` keys off — the control itself scales to 0.9
    // on hover, and a tooltip inside it would shrink along with it.
    <div
      className={cn("group relative flex shrink-0", item.hideOnMobile && "max-[809px]:hidden")}
    >
      {control}
      {/* Decorative: the control already carries the same text as `aria-label`. */}
      <span aria-hidden="true" className={TOOLTIP_CLASS}>
        {item.tooltip ?? item.name}
        <span className={TOOLTIP_CARET_CLASS} />
      </span>
    </div>
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
        // `overflow-clip` is dropped from here and from Menu Wrapper below.
        // Both are transcribed from the live site, but the hover tooltip has to
        // escape them and there is no way around it: `position: fixed` does not
        // help, because this element's own `backdrop-blur` makes it the
        // containing block for fixed descendants, which are then clipped anyway.
        // Nothing else overflowed — the only transform on a dock item is a
        // scale DOWN on hover — so removing it changes nothing on screen.
        "flex items-center justify-center bg-[rgba(40,40,40,0.6)] px-[8px] py-[9px] backdrop-blur-[14px]",
        "shadow-[0px_3px_3px_0px_rgba(0,0,0,0.24)]",
        "h-[52px] w-full gap-[8px] rounded-[12px]",
        "min-[810px]:h-[94px] min-[810px]:w-[775px] min-[810px]:gap-[16px] min-[810px]:rounded-[24px]",
      )}
    >
      <div
        data-framer-name="Menu Wrapper"
        className={cn(
          "flex items-center",
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
