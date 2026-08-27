import Image from "next/image";
import { PORTOS_ASSETS, type GalleryImage } from "@/types/portos";

/**
 * The three masonry columns, transcribed from the live site. Heights are the
 * measured rendered crop at the 864px window width — every image is 264px wide.
 *
 * `projects-10.png` in column 2 is not a typo: the live site reuses that one
 * asset across the Projects, Gallery and Recycle Bin windows.
 */
const GALLERY_COLUMNS: GalleryImage[][] = [
  [
    { src: "gallery-01.png", height: 367 },
    { src: "gallery-02.png", height: 240 },
    { src: "gallery-03.png", height: 367 },
  ],
  [
    { src: "gallery-04.png", height: 306 },
    { src: "projects-10.png", height: 300 },
    { src: "gallery-05.png", height: 367 },
  ],
  [
    { src: "gallery-06.png", height: 342 },
    { src: "gallery-07.png", height: 306 },
    { src: "gallery-08.png", height: 367 },
  ],
];

/**
 * Body of the "Gallery" window — the chrome lives in `WindowFrame`.
 *
 * Completely static: the live site attaches no hover transform, click handler,
 * lightbox, filter or entrance animation to these images, so neither do we.
 *
 * Layout is a 3 x 264px grid with a 16px gap (824px total inside the 864px
 * window). Below 880px the window gets clipped rather than reflowed on the live
 * site, so the 2-column / 1-column steps are our own graceful fallback.
 */
export function GalleryWindow() {
  return (
    // Container. The 50px top gap is the live site's `Desktop` flex-column gap between
    // the sticky title bar and the body; WindowFrame renders children flush, so it lives here.
    <div className="flex w-full max-w-[1152px] items-center justify-center px-5 pb-[60px] pt-[50px]">
      {/* Content */}
      <div className="flex w-full flex-col items-start justify-center gap-x-4 gap-y-5">
        <div className="grid w-full grid-cols-1 gap-4 min-[521px]:grid-cols-2 min-[880px]:grid-cols-[264px_264px_264px]">
          {GALLERY_COLUMNS.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-4">
              {column.map((image) => (
                <Image
                  key={image.src}
                  src={`${PORTOS_ASSETS}/images/${image.src}`}
                  alt=""
                  width={264}
                  height={image.height}
                  sizes="(min-width: 880px) 264px, (min-width: 521px) 50vw, 100vw"
                  // Tailwind preflight forces `img { height: auto }`, so the
                  // measured crop has to be re-stated in CSS.
                  style={
                    {
                      "--portos-gallery-h": `${image.height}px`,
                      "--portos-gallery-ar": `264 / ${image.height}`,
                    } as React.CSSProperties
                  }
                  className="w-full rounded-none object-cover aspect-[var(--portos-gallery-ar)] min-[880px]:aspect-auto min-[880px]:h-[var(--portos-gallery-h)] min-[880px]:w-[264px]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
