"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { PORTOS_ASSETS } from "@/types/portos";

interface MenuBarProps {
  name?: string;
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
 * macOS menu bar pinned to the top of the desktop. Nothing here is interactive on
 * the live site — the icon "buttons" are plain boxes, not focusable controls — apart
 * from the clock, which shows the visitor's local date and time.
 *
 * Below 810px only the wifi icon and the time survive.
 */
export function MenuBar({ name = "Lê Ngọc Hà" }: MenuBarProps) {
  const clock = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);

  return (
    <header className="absolute left-0 top-0 z-[5] h-[29px] w-full">
      <div className="flex h-[29px] w-full items-center justify-between overflow-clip bg-black/10 pb-[2px] pl-[4px] pr-[11px] pt-[3px] backdrop-blur-[82px]">
        {/* Icon & Name */}
        <div className="flex items-center gap-[3px]">
          <div className={ICON_BOX}>
            <Image
              src={`${PORTOS_ASSETS}/seo/favicon.svg`}
              alt=""
              width={13}
              height={16}
              className={ICON_IMAGE}
            />
          </div>
          <p className="whitespace-pre font-display text-[12px] font-bold leading-[18px] tracking-normal text-white">
            {name}
          </p>
        </div>

        {/* Icon & Time */}
        <div className="flex items-center justify-end gap-[6px]">
          <div className="flex items-center justify-end gap-[3px]">
            {NAV_ICONS.map((icon) => (
              <div
                key={icon.file}
                className={cn(ICON_BOX, icon.hideOnMobile && "max-[810px]:hidden")}
              >
                <Image
                  src={`${PORTOS_ASSETS}/images/${icon.file}`}
                  alt=""
                  width={icon.width}
                  height={icon.height}
                  className={ICON_IMAGE}
                />
              </div>
            ))}
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
