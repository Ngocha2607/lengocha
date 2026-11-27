"use client";

import Image from "next/image";
import { Fragment, useSyncExternalStore } from "react";
import { EN_MENU_BAR } from "@/i18n/en";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALES, type Locale } from "@/i18n/locale";
import type { MenuBarCopy } from "@/i18n/types";
import { cn } from "@/lib/utils";
import { type PortosAppId, PORTOS_ASSETS } from "@/types/portos";
import { AppleMenu } from "./AppleMenu";

interface MenuBarProps {
  name?: string;
  /** Lets the logo menu open the same windows the dock and folders do. */
  onOpen: (app: PortosAppId) => void;
  /**
   * Opens Spotlight. On the live site the magnifier was a dead image like the
   * other status icons; it is the one glyph a visitor actually expects to work.
   */
  onSearch?: () => void;
  /** Where each language's link goes: the current view in that language. */
  languageTargets: Record<Locale, string>;
}

const VI_COPY: MenuBarCopy = {
  languageLabel: "Ngôn ngữ",
};

/** Each language's own name, announced in that language (`lang` on the link). */
const LANGUAGE_NAMES: Record<Locale, string> = { vi: "Tiếng Việt", en: "English" };

/**
 * VI | EN. Plain links rather than buttons: each one is a real URL for the
 * current view in that language (a crawler and "open in new tab" both work),
 * and changing language is a full page load anyway — the two languages have
 * separate root layouts so that `<html lang>` is right in the server HTML.
 * Nothing switches language automatically; this is the only way.
 *
 * Shown at every width, unlike the status icons: it is the one way to reach
 * the other language.
 */
function LanguageSwitch({ targets }: { targets: Record<Locale, string> }) {
  const locale = useLocale();
  const copy = locale === "en" ? EN_MENU_BAR : VI_COPY;
  return (
    <nav aria-label={copy.languageLabel} className="flex items-center">
      {LOCALES.map((target, index) => {
        const current = target === locale;
        return (
          <Fragment key={target}>
            {index > 0 ? (
              <span aria-hidden="true" className="font-display px-[1px] text-[12px] leading-[18px] text-white/40">
                |
              </span>
            ) : null}
            <a
              href={targets[target]}
              hrefLang={target}
              lang={target}
              aria-label={LANGUAGE_NAMES[target]}
              aria-current={current ? "true" : undefined}
              title={LANGUAGE_NAMES[target]}
              className={cn(
                "font-display rounded-[4px] px-[5px] text-[12px] leading-[18px] font-bold tracking-normal transition-colors",
                "outline-none focus-visible:bg-white/15",
                // A thumb needs more than a 12px word to aim at.
                "max-[809px]:px-[7px] max-[809px]:py-[3px]",
                current ? "text-white" : "text-white/55 hover:bg-white/15 hover:text-white",
              )}
            >
              {target.toUpperCase()}
            </a>
          </Fragment>
        );
      })}
    </nav>
  );
}

interface Clock {
  date: string;
  time: string;
}

/**
 * The four status icons on the right. Filenames are transcribed verbatim from the
 * live site — `menubar-account.svg` really is the control centre glyph and
 * `menubar-control-center.svg` really is the account glyph. Do not "fix" the order.
 * `width`/`height` are the intrinsic pixel sizes; every icon renders at 15x20.
 */
const NAV_ICONS = [
  { file: "menubar-wifi.png", width: 60, height: 44, hideOnMobile: false },
  { file: "menubar-search.svg", width: 13, height: 13, hideOnMobile: true },
  { file: "menubar-account.svg", width: 14, height: 14, hideOnMobile: true },
  { file: "menubar-control-center.svg", width: 13, height: 13, hideOnMobile: true },
] as const;

/** 37x24 box with 2px/11px padding — leaves exactly the 15x20 image content box. */
const ICON_BOX = "flex h-[24px] w-[37px] items-center justify-center overflow-clip px-[11px] py-[2px]";

/** All five glyphs are decorative and render at a fixed 15x20 with object-fit: contain. */
const ICON_IMAGE = "h-[20px] w-[15px] object-contain";

function readClock(): Clock {
  const now = new Date();
  return {
    // "8/27/2026" — US-style, no leading zeros.
    date: new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }).format(now),
    // "9:00 AM" — 12-hour, no leading zero on the hour.
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now),
  };
}

/**
 * The clock lives outside React so the menu bar can render `null` on the server and
 * on the first client render — hydration always matches — and only picks up the
 * visitor's local time once `subscribe` runs on mount. One shared 30s timer feeds
 * every subscriber, and the snapshot is kept referentially stable between ticks.
 */
let clockSnapshot: Clock | null = null;
let clockTimer: number | null = null;
const clockListeners = new Set<() => void>();

function tickClock(): void {
  const next = readClock();
  if (clockSnapshot && clockSnapshot.date === next.date && clockSnapshot.time === next.time) {
    return;
  }
  clockSnapshot = next;
  for (const listener of clockListeners) listener();
}

function subscribeToClock(onStoreChange: () => void): () => void {
  clockListeners.add(onStoreChange);
  clockTimer ??= window.setInterval(tickClock, 30_000);
  tickClock();
  return () => {
    clockListeners.delete(onStoreChange);
    if (clockListeners.size === 0 && clockTimer !== null) {
      window.clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

function getClockSnapshot(): Clock | null {
  return clockSnapshot;
}

function getServerClockSnapshot(): Clock | null {
  return null;
}

/**
 * macOS menu bar pinned to the top of the desktop. On the live site nothing here
 * was interactive — the icon "buttons" are plain boxes, not focusable controls —
 * and the four status icons on the right still are not. The clock shows the
 * visitor's local date and time, and the logo is now a real menu; see AppleMenu.
 *
 * Below 810px only the language switch, the wifi icon, the magnifier and the
 * time survive.
 */
export function MenuBar({ name = "Lê Ngọc Hà", onOpen, onSearch, languageTargets }: MenuBarProps) {
  const clock = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);

  // z-30: above every window (BASE_Z 4 + at most 8 of them) AND the dock
  // (z 20). It was z-5, which only beat the FIRST window — the stack's z grows
  // per window, so a second window tied it and painted over both the bar and
  // its dropdown. Spotlight (z-40+) stays above.
  return (
    <header className="absolute left-0 top-0 z-30 h-[29px] w-full">
      <div className="flex h-[29px] w-full items-center justify-between overflow-clip bg-black/10 pb-[2px] pl-[4px] pr-[11px] pt-[3px] backdrop-blur-[82px]">
        {/* Icon & Name */}
        <div className="flex items-center gap-[3px]">
          <AppleMenu onOpen={onOpen} />
          <p className="whitespace-pre font-display text-[12px] font-bold leading-[18px] tracking-normal text-white">
            {name}
          </p>
        </div>

        {/* Icon & Time */}
        <div className="flex items-center justify-end gap-[6px]">
          <LanguageSwitch targets={languageTargets} />
          <div className="flex items-center justify-end gap-[3px]">
            {NAV_ICONS.map((icon) => {
              const image = (
                <Image
                  src={`${PORTOS_ASSETS}/images/${icon.file}`}
                  alt=""
                  width={icon.width}
                  height={icon.height}
                  className={ICON_IMAGE}
                />
              );
              // The magnifier is the one live control in the row — and the one
              // icon that IGNORES hideOnMobile: on touch there is no ⌘K, so
              // without it Spotlight would be unreachable on a phone.
              if (icon.file === "menubar-search.svg" && onSearch) {
                return (
                  <button
                    key={icon.file}
                    type="button"
                    onClick={onSearch}
                    aria-label="Search (Cmd+K)"
                    title="Search (⌘K)"
                    className={cn(ICON_BOX, "cursor-pointer rounded transition-colors hover:bg-white/15")}
                  >
                    {image}
                  </button>
                );
              }
              return (
                <div
                  key={icon.file}
                  className={cn(ICON_BOX, icon.hideOnMobile && "max-[810px]:hidden")}
                >
                  {image}
                </div>
              );
            })}
          </div>
          <p className="whitespace-nowrap font-display text-[14px] font-medium leading-[16px] tracking-normal text-white max-[810px]:hidden">
            {clock ? (
              clock.date
            ) : (
              // Reserves the row's width before the clock mounts so nothing jumps.
              <span aria-hidden className="invisible">
                8/27/2026
              </span>
            )}
          </p>
          <p className="whitespace-nowrap font-display text-[14px] font-medium leading-[16px] tracking-normal text-white">
            {clock ? (
              clock.time
            ) : (
              <span aria-hidden className="invisible">
                9:00 AM
              </span>
            )}
          </p>
        </div>
      </div>
    </header>
  );
}
