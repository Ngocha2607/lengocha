import Image from "next/image";
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
export function GalleryWindow() {
  return (
    // Container. The 50px top gap is the live site's `Desktop` flex-column gap between
    // the sticky title bar and the body; WindowFrame renders children flush, so it lives here.
    <div className="flex w-full items-center justify-center px-5 pt-[50px] pb-[60px]">
      {/* Content */}
      <div className="grid w-full grid-cols-1 gap-x-4 gap-y-5 min-[521px]:grid-cols-2 min-[880px]:max-w-[var(--portos-content-max)] min-[880px]:grid-cols-4">
        {GALLERY_TILES.map((tile) => (
          <figure key={tile.src} className="flex min-w-0 flex-col gap-[6px]">
            <div
              className={cn(
                "min-h-0 w-full overflow-clip rounded-[8px] border border-black/10",
                SHOT_ASPECT,
              )}
            >
              <Image
                src={`${PORTOS_ASSETS}/images/${tile.src}`}
                alt={tile.alt}
                width={1913}
                height={912}
                sizes="(min-width: 880px) 266px, (min-width: 521px) 50vw, 100vw"
                className="h-full w-full rounded-none object-cover"
              />
            </div>
            <figcaption className="truncate text-center font-sans text-[12px] leading-[16px] font-normal text-black/70">
              {tile.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
