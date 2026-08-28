"use client";

import { Menu } from "@base-ui/react/menu";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  PORTOS_ASSETS,
  PORTOS_PROFILES,
  type PortosAppId,
} from "@/types/portos";

interface AppleMenuProps {
  onOpen: (app: PortosAppId) => void;
}

/**
 * The windows this menu offers, in the order macOS would put them: identity
 * first, then the work, then how to get in touch.
 *
 * Projects and Gallery are left out. Both already have a folder or a dock icon,
 * and a menu that simply repeats the desktop is a menu nobody opens twice.
 * Contact has a dock icon too and is here anyway, at the owner's request — it is
 * the one thing a visitor may go looking for without knowing which icon hides it.
 */
const MENU_APPS: { app: PortosAppId; label: string }[] = [
  { app: "about", label: "About" },
  { app: "experience", label: "Experience" },
  { app: "resume", label: "Resume" },
  { app: "decisions", label: "Leadership & Technical Decisions" },
  { app: "contact", label: "Contact" },
];

/**
 * Same material as the dock tooltip and the desktop folder hover plate: a dark
 * translucent panel over a blur. macOS would tint this with the system accent on
 * hover; the site has no accent colour, so rows highlight with the same white
 * wash used everywhere else here.
 *
 * `origin-top-left` with a scale is what Base UI animates against the
 * `data-starting-style` / `data-ending-style` attributes it sets while opening
 * and closing.
 */
const POPUP_CLASS =
  "min-w-[220px] rounded-[6px] border border-white/15 bg-black/60 p-[4px] " +
  "shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-[24px] " +
  "origin-top-left transition-[opacity,transform] duration-150 ease-out " +
  "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 " +
  "data-[ending-style]:scale-95 data-[ending-style]:opacity-0";

/** 22px rows, the macOS menu metric, with the text inset clear of the rounding. */
const ITEM_CLASS =
  "flex h-[22px] cursor-default select-none items-center justify-between gap-6 " +
  "rounded-[4px] px-[10px] font-sans text-[13px] leading-[22px] text-[#e5e5e5] " +
  "outline-none data-[highlighted]:bg-white/15 data-[highlighted]:text-white";

const SEPARATOR_CLASS = "my-[4px] h-px bg-white/12";

/**
 * The menu bar's leftmost logo, opened like the Apple menu.
 *
 * Every row does something. The macOS original is mostly power controls, which
 * on a portfolio would be a menu of items that do nothing when clicked, so the
 * shape is kept and the contents are the site's own.
 */
export function AppleMenu({ onOpen }: AppleMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Menu"
        className={cn(
          "flex h-[24px] w-[37px] cursor-default items-center justify-center overflow-clip px-[11px] py-[2px]",
          "rounded-[4px] outline-none transition-colors duration-100",
          "hover:bg-white/15 focus-visible:bg-white/15 data-[popup-open]:bg-white/20",
        )}
      >
        <Image
          src={`${PORTOS_ASSETS}/seo/favicon.svg`}
          alt=""
          width={13}
          height={16}
          className="h-[20px] w-[15px] object-contain"
        />
      </Menu.Trigger>

      <Menu.Portal>
        {/* Hangs from the bar's lower edge, its left edge lined up with the
            trigger's — 4px back, because the trigger carries 11px of its own
            padding and the panel should sit under the glyph, not the box. */}
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={2}
          alignOffset={-4}
        >
          <Menu.Popup className={POPUP_CLASS}>
            {MENU_APPS.map((entry) => (
              <Menu.Item
                key={entry.app}
                className={ITEM_CLASS}
                onClick={() => onOpen(entry.app)}
              >
                {entry.label}
              </Menu.Item>
            ))}

            <div role="separator" className={SEPARATOR_CLASS} />

            <Menu.LinkItem
              className={ITEM_CLASS}
              href={PORTOS_PROFILES.github}
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
              <span aria-hidden="true" className="text-[11px] text-white/45">
                ↗
              </span>
            </Menu.LinkItem>
            <Menu.LinkItem
              className={ITEM_CLASS}
              href={PORTOS_PROFILES.linkedin}
              target="_blank"
              rel="noreferrer noopener"
            >
              LinkedIn
              <span aria-hidden="true" className="text-[11px] text-white/45">
                ↗
              </span>
            </Menu.LinkItem>

            <div role="separator" className={SEPARATOR_CLASS} />

            {/* The one system-flavoured row that can honestly do what it says:
                reloading replays the pre-loader, which is the closest thing this
                desktop has to booting. */}
            <Menu.Item
              className={ITEM_CLASS}
              onClick={() => window.location.reload()}
            >
              Restart
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
