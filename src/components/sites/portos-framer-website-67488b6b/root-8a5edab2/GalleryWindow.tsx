"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PORTOS_ASSETS } from "@/types/portos";

/**
 * A gallery tile. Not the shared `GalleryImage` type — that one carries a
 * measured pixel height for the template's portrait masonry, which this layout
 * no longer has. `RecycleBinWindow` still uses it, so it stays in the contract.
 */
interface GalleryTile {
  src: string;
  alt: string;
  /**
   * Shown under the tile. Deliberately the short half of the Projects title —
   * "LMS Platform", not "LMS Platform · SAPP Academy" — because at 194px the
   * full form wraps to two lines and the row stops reading as a grid.
   */
  label: string;
}

/**
 * The same six project screenshots the Projects window uses, alt text and all,
 * carried over from lengocha.vercel.app. Newest first, so the row reads in the
 * same order as the Projects list.
 */
const GALLERY_TILES: readonly GalleryTile[] = [
  {
    src: "project-lms-platform.png",
    alt: "SAPP Academy learning-management system dashboard",
    label: "LMS Platform",
  },
  {
    src: "project-ops-portal.png",
    alt: "SAPP Academy operations portal showing the class list screen",
    label: "Operations",
  },
  {
    src: "project-subscriber-platform.png",
    alt: "Tweet World Travel subscriber management platform interface",
    label: "Subscriber Platform",
  },
  {
    src: "project-b2b-storefront.png",
    alt: "Tweet World Travel B2B e-commerce website homepage",
    label: "B2B",
  },
  {
    src: "project-newsletter.png",
    alt: "Drag-and-drop email newsletter builder interface",
    label: "Newsletter System",
  },
  {
    src: "project-evn.png",
    alt: "EVN Hanoi power-management system module interface",
    label: "EVN Hanoi",
  },
];

/** Every screenshot is ~1913x912; one ratio keeps the mosaic on a single grid. */
const SHOT_ASPECT = "aspect-[2.1]";

/**
 * Body of the "Gallery" window — the chrome lives in `WindowFrame`.
 *
 * REBUILT ON REQUEST; this no longer matches the live site. The original is nine
 * stock photos in three portrait masonry columns, 264px wide and 240-367px tall.
 * These are UI screenshots at 1913x912, and a portrait crop would have thrown
 * away most of every interface — so the tiles are laid out four to a row at the
 * screenshots' own ratio, and nothing is cropped.
 *
 * Four across the measured 824px content width, with the template's 16px gap,
 * puts each tile at (824 - 3*16) / 4 = 194px — the same 194px the original's
 * cards used, which is a coincidence worth knowing rather than a constraint.
 * At 2.1 that is 92px tall, so these read as contact-sheet thumbnails; the
 * Projects window is where the same six are large enough to read.
 *
 * Six tiles in a four-column grid means the second row holds two. That is the
 * natural grid flow and is left alone deliberately — stretching two tiles to
 * fill the row would break the one ratio every tile shares.
 *
 * Each tile is captioned, on request, after the macOS Wallpapers browser. The
 * label is the short half of the Projects title only — no description, no stack
 * tags, no link, and still no hover or lightbox. Projects remains the place
 * these six are actually explained; this stays a contact sheet with names on it.
 *
 * `min-h-0` on each tile is not cosmetic: a grid item's automatic minimum is its
 * content height, so for any screenshot flatter than 2.1 that minimum wins and
 * silently overrides `aspect-ratio`. Two of the six are flatter — see
 * `components/ProjectsWindow.spec.md`, where the same trap cost real debugging.
 *
 * The live site clips rather than reflows below 880px, so the 2-column and
 * 1-column steps are our own adaptation.
 */
/**
 * Full-screen viewer for one tile.
 *
 * PORTALLED, and that is not optional. `WindowFrame`'s shell carries a
 * `transform` for centring and dragging, and a transformed element is the
 * containing block for its fixed-position descendants — so a `position: fixed`
 * overlay rendered inside the Gallery would be trapped inside the Gallery.
 * `Dialog.Portal` moves it to the body, where `inset-0` means the viewport.
 *
 * Base UI's Dialog rather than a hand-rolled overlay, for the focus trap, the
 * Escape handling, the return of focus to the tile, and `aria-modal`. What it
 * does not give is stepping between images, so that is wired below.
 *
 * Sized to the viewport rather than the window: at 1440 this shows the
 * screenshot about 73% of its native 1913px, against 43% in Projects' list view
 * and 10% in the grid it was opened from. That gap is the whole reason this
 * exists — see the note above GALLERY_TILES.
 */
function GalleryLightbox({
  index,
  onIndexChange,
  onClose,
}: {
  index: number | null;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const open = index !== null;
  const tile = open ? GALLERY_TILES[index] : null;

  // Left and right step through the set, wrapping. Bound to the document
  // because focus sits on whichever control the dialog moved it to, and the
  // arrows should work wherever that is.
  useEffect(() => {
    // Narrowed on `index` rather than `open`: the latter is a derived boolean,
    // which TypeScript cannot use to prove `index` is a number below.
    if (index === null) return;
    // Pinned to a local: `index` is a parameter, and TypeScript drops a
    // narrowing on those once it crosses into a closure.
    const from = index;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      onIndexChange((from + step + GALLERY_TILES.length) % GALLERY_TILES.length);
    };
    // CAPTURE phase. The dialog handles keys for its own focus management and
    // stops them before they bubble as far as the document, so a listener on the
    // bubble phase never fired.
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [index, onIndexChange]);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-[6px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-0 z-[61] flex flex-col items-center justify-center gap-4 p-6 outline-none transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
          {tile !== null && index !== null ? (
            <>
              {/* The title is what a screen reader announces on open; it is the
                  tile's own label, so the visible caption below is redundant to
                  it and marked away. */}
              <Dialog.Title className="sr-only">{tile.label}</Dialog.Title>

              <Image
                key={tile.src}
                src={`${PORTOS_ASSETS}/images/${tile.src}`}
                alt={tile.alt}
                width={1913}
                height={912}
                sizes="92vw"
                quality={90}
                priority
                className="h-auto max-h-[82vh] w-auto max-w-[92vw] rounded-[10px] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
              />

              <p aria-hidden="true" className="font-sans text-[13px] leading-[18px] text-white/80">
                {tile.label}
                <span className="text-white/40">
                  {"  ·  "}
                  {index + 1}/{GALLERY_TILES.length}
                </span>
              </p>

              <Dialog.Close
                aria-label="Close"
                className="absolute top-5 right-5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 outline-none transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X size={16} aria-hidden="true" />
              </Dialog.Close>
            </>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function GalleryWindow() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Returns focus to the tile on the way out, which Base UI cannot do for us:
   * it restores focus to a `Dialog.Trigger`, and there is no trigger here — the
   * viewer is opened from state so that six tiles can share one dialog.
   *
   * Focus goes to the tile the viewer ENDED on, not the one it started from, so
   * arrowing to the sixth image and closing leaves the keyboard on the sixth
   * tile rather than jumping back across the grid.
   */
  const closeLightbox = useCallback(() => {
    const last = openIndex;
    setOpenIndex(null);
    if (last === null) return;
    // Deferred by a tick: the dialog moves focus itself while unmounting, and
    // doing this in the same task would simply be overwritten.
    window.setTimeout(() => tileRefs.current[last]?.focus(), 0);
  }, [openIndex]);

  return (
    // Container. The 50px top gap is the live site's `Desktop` flex-column gap between
    // the sticky title bar and the body; WindowFrame renders children flush, so it lives here.
    <div className="flex w-full items-center justify-center px-5 pt-[50px] pb-[60px]">
      {/* Content */}
      <div className="grid w-full grid-cols-1 gap-x-4 gap-y-5 min-[521px]:grid-cols-2 min-[880px]:max-w-[var(--portos-content-max)] min-[880px]:grid-cols-4">
        {GALLERY_TILES.map((tile, i) => (
          <figure key={tile.src} className="flex min-w-0 flex-col gap-[6px]">
            {/* `data-no-drag` so opening a tile is not read as the start of a
                window drag — the whole window is a drag handle. */}
            <button
              type="button"
              data-no-drag
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              onClick={() => setOpenIndex(i)}
              aria-label={`View ${tile.label} full size`}
              className={cn(
                "group min-h-0 w-full cursor-pointer overflow-clip rounded-[8px] border border-black/10",
                "outline-none focus-visible:ring-2 focus-visible:ring-black/40",
                SHOT_ASPECT,
              )}
            >
              <Image
                src={`${PORTOS_ASSETS}/images/${tile.src}`}
                alt={tile.alt}
                width={1913}
                height={912}
                sizes="(min-width: 880px) 266px, (min-width: 521px) 50vw, 100vw"
                className="h-full w-full rounded-none object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
            </button>
            <figcaption className="truncate text-center font-sans text-[12px] leading-[16px] font-normal text-black/70">
              {tile.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <GalleryLightbox index={openIndex} onIndexChange={setOpenIndex} onClose={closeLightbox} />
    </div>
  );
}
