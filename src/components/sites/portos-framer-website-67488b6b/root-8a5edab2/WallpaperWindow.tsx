"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { PORTOS_ASSETS } from "@/types/portos";

/**
 * The four wallpapers, in order. The live site duplicates this set four times
 * in the DOM to fake an infinite loop — we reproduce the wrap-around behaviour
 * instead, so each asset appears exactly once.
 */
const SLIDES = [
  `${PORTOS_ASSETS}/images/wallpaper-01.png`,
  `${PORTOS_ASSETS}/images/wallpaper-02.png`,
  `${PORTOS_ASSETS}/images/wallpaper-03.png`,
  `${PORTOS_ASSETS}/images/wallpaper-04.jpg`,
];

/** Measured by sampling the dot opacities once per second on the live site. */
const SLIDE_INTERVAL = 2000;
/** Horizontal step is 690px at the measured 680px slide width. */
const SLIDE_GAP = 10;
/** Intermediate opacities captured mid-transition confirm a ~0.6s tween. */
const TRANSITION = "duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** The server cannot know the preference; assume full motion and correct on hydration. */
function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * The dot hit areas measured 25 / 20 / 20 / 25 px wide, together filling the
 * 90px pill. The dots themselves stay a uniform 10px apart, so the two outer
 * buttons carry the extra 5px on their outer edge.
 */
function hitAreaClassName(index: number): string {
  if (index === 0) return "w-[25px] pl-[10px] pr-[5px]";
  if (index === SLIDES.length - 1) return "w-[25px] pl-[5px] pr-[10px]";
  return "w-[20px] px-[5px]";
}

/**
 * Body of the "Wallpaper" window — the chrome comes from `WindowFrame`.
 *
 * A time-driven carousel: the track advances every 2s and wraps around, and the
 * page dots jump to a slide (resetting the timer). It is not scroll- or
 * hover-driven, and the slides themselves are inert — clicking one does not
 * change the desktop background on the live site.
 *
 * Framer emits `Previous`/`Next` arrow buttons for this carousel but the config
 * gives them `display: none` at rest and under a genuine pointer hover, so they
 * are not rendered here (their two SVGs in the asset folder go unused).
 *
 * The 32px top padding is this window's gap between the 44px title bar and the
 * container, which starts at y = 76 — narrower than the 50px the other windows
 * use. At 720px wide the maths lands on 44 + 32 + 500 + 20 = 596, the exact
 * window height, so nothing scrolls.
 *
 * Below 720px the live site clips rather than reflows; the fluid viewport and
 * percentage-based track step are our own adaptation.
 */
export function WallpaperWindow() {
  const [index, setIndex] = useState(0);
  // Bumped on a dot click purely to re-arm the auto-advance interval.
  const [restartToken, setRestartToken] = useState(0);
  const reduced = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [reduced, restartToken]);

  return (
    <div className="pt-8">
      {/* Container */}
      <div className="flex w-full items-center justify-center px-5 pb-5">
        {/* Content — the carousel viewport */}
        <div className="relative aspect-[680/500] w-full max-w-[680px] overflow-hidden">
          {/* Track — the 10px gap survives at any width alongside the % step. */}
          <div
            className={cn("flex h-full w-full gap-[10px] transition-transform", TRANSITION)}
            style={{
              transform: `translateX(calc(${index} * -100% - ${index * SLIDE_GAP}px))`,
            }}
          >
            {SLIDES.map((src) => (
              <div key={src} className="relative h-full w-full shrink-0">
                {/* `fill` sidesteps the `img { height: auto }` preflight rule. */}
                <Image
                  src={src}
                  alt=""
                  fill
                  loading="eager"
                  sizes="(min-width: 736px) 680px, 100vw"
                  className="rounded-none object-cover"
                />
              </div>
            ))}
          </div>
          {/* Dot indicator — sits over the image, 10px above its bottom edge. */}
          <div
            data-no-drag
            className="absolute bottom-[10px] left-1/2 flex h-[30px] w-[90px] -translate-x-1/2 items-center justify-center rounded-[50px] bg-black/20"
          >
            {SLIDES.map((src, dotIndex) => (
              <button
                key={src}
                type="button"
                aria-label={`Scroll to page ${dotIndex + 1}`}
                onClick={() => {
                  setIndex(dotIndex);
                  setRestartToken((token) => token + 1);
                }}
                className={cn(
                  "flex h-[30px] cursor-pointer items-center justify-center",
                  hitAreaClassName(dotIndex),
                )}
              >
                <span
                  className={cn(
                    "size-[10px] rounded-full bg-white transition-opacity",
                    TRANSITION,
                    dotIndex === index ? "opacity-100" : "opacity-50",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
