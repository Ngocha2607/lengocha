import Image from "next/image";
import { PORTOS_ASSETS, type GalleryImage } from "@/types/portos";

/**
 * One of the four decorations on the bin's top row. The live site gives them
 * `cursor: pointer` but no click handler and no href — they open nothing.
 */
interface BinShortcut {
  /** Stable key; matches the artwork's role on the live site. */
  name: string;
  icon: string;
  /** Intrinsic hint for next/image — always equal to the rendered box. */
  width: number;
  height: number;
  /** Literal Tailwind classes so the JIT can see every measured size. */
  imageClassName: string;
  /** Rendered under the folder artwork; the two app icons are unlabelled. */
  label?: string;
}

/** Left → right, 20px apart. Folder artwork is shared, intrinsic 236x236. */
const BIN_SHORTCUTS: BinShortcut[] = [
  {
    name: "Contacts",
    icon: `${PORTOS_ASSETS}/images/dock-contacts.png`,
    width: 76,
    height: 76,
    imageClassName: "h-[76px] w-[76px] object-contain",
  },
  {
    name: "Messages",
    icon: `${PORTOS_ASSETS}/images/dock-messages.png`,
    width: 76,
    height: 76,
    imageClassName: "h-[76px] w-[76px] object-contain",
  },
  {
    name: "About",
    icon: `${PORTOS_ASSETS}/images/folder.png`,
    width: 58,
    height: 59,
    imageClassName: "h-[59px] w-[58px] object-cover",
    label: "About",
  },
  {
    name: "Projects",
    icon: `${PORTOS_ASSETS}/images/folder.png`,
    width: 58,
    height: 59,
    imageClassName: "h-[59px] w-[58px] object-cover",
    label: "Projects",
  },
];

/**
 * The 4 x 194px grid, column by column. Columns 3 and 4 hold a single image —
 * that is how the live site renders, not an omission. Heights are the measured
 * rendered heights at the window's 864px width.
 */
const BIN_COLUMNS: GalleryImage[][] = [
  [
    { src: `${PORTOS_ASSETS}/images/gallery-01.png`, height: 269 },
    { src: `${PORTOS_ASSETS}/images/projects-10.png`, height: 158 },
  ],
  [
    { src: `${PORTOS_ASSETS}/images/gallery-04.png`, height: 225 },
    { src: `${PORTOS_ASSETS}/images/gallery-07.png`, height: 225 },
  ],
  [{ src: `${PORTOS_ASSETS}/images/gallery-06.png`, height: 182 }],
  [{ src: `${PORTOS_ASSETS}/images/gallery-02.png`, height: 225 }],
];

/**
 * Body of the "Recycle Bin" window — the chrome comes from `WindowFrame`.
 *
 * Entirely static: the shortcut row and the grid are decoration, so this stays
 * a server component. The 50px top padding is the gap the live site's scroller
 * puts between the 44px title bar and the content container, which starts at
 * y = 94.
 *
 * Below 880px the measured 4 x 194px grid collapses to two fluid columns and
 * the shortcut row wraps — an adaptation, since the live site simply clips.
 */
export function RecycleBinWindow() {
  return (
    <div className="pt-[50px]">
      {/* Container */}
      <div className="mx-auto flex w-full max-w-[1152px] items-center justify-center px-5 pb-[60px]">
        {/* Content */}
        <div className="flex w-full flex-col items-start justify-center gap-x-4 gap-y-5">
          {/* Menu Wrapper */}
          <div className="flex w-full min-h-[78.59px] flex-row flex-wrap items-center justify-start gap-5 min-[880px]:h-[78.59px]">
            {BIN_SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.name}
                className="flex shrink-0 cursor-pointer flex-col items-center justify-center transition-opacity duration-200 hover:opacity-80"
              >
                <Image
                  src={shortcut.icon}
                  alt=""
                  width={shortcut.width}
                  height={shortcut.height}
                  className={shortcut.imageClassName}
                />
                {shortcut.label ? (
                  <p className="font-display text-[14px] font-normal leading-[19.6px] tracking-[-0.14px] text-black">
                    {shortcut.label}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          {/* Image grid */}
          <div className="grid w-full grid-cols-2 gap-4 min-[880px]:grid-cols-[194px_194px_194px_194px]">
            {BIN_COLUMNS.map((column) => (
              <div key={column[0].src} className="flex flex-col gap-4">
                {column.map((image) => (
                  <Image
                    key={image.src}
                    src={image.src}
                    alt=""
                    width={194}
                    height={image.height}
                    style={
                      {
                        "--portos-ar": `194 / ${image.height}`,
                        "--portos-h": `${image.height}px`,
                      } as React.CSSProperties
                    }
                    className="aspect-[var(--portos-ar)] h-auto w-full rounded-none object-cover min-[880px]:h-[var(--portos-h)] min-[880px]:w-[194px]"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
