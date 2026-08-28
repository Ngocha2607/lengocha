"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { PORTOS_ASSETS } from "@/types/portos";

const BG_SRC = `${PORTOS_ASSETS}/images/preloader-bg.png`;
/**
 * Over-declared on purpose — but no longer by the same amount everywhere, which
 * is the part that broke this on phones.
 *
 * `sizes` describes LAYOUT size, and `next/image` uses it to pick a width off
 * its ladder. This layer animates from `scale(3)`, so for the first second the
 * bitmap is painted three viewports wide; declaring `100vw` fetched w=1920 for a
 * 1440 viewport and stretched it over 4320px, which is the blur this was written
 * to fix.
 *
 * The fix over-declared for EVERY viewport though, and the ladder tops out at
 * 3840. A 390px phone at DPR 3 resolves 200vw to 2340 and so takes the 3840
 * render — the single largest variant on the slowest connection. Measured
 * against the optimiser: 3840 is 210KB where 1920 is 55KB.
 *
 * So 200vw from tablet up, and 150vw below it (390 x 1.5 x DPR 3 = 1755, which
 * lands on w=1920). Mobile still gets far more pixels than it can show at rest.
 * It just stops buying the top of the ladder to cover the first 200ms of a zoom.
 *
 * Both copies use it so they resolve to one URL and one download.
 */
const BG_SIZES = "(max-width: 809px) 150vw, 200vw";

/**
 * A 12px-wide WebP of the same wallpaper, inline so it costs no request and is
 * painted on the very first frame. 86 bytes.
 *
 * This is what actually answers "the splash came up with no background". The
 * desktop renders BEHIND this overlay, so until the real bitmap arrived the
 * intro was simply transparent and the wallpaper and dock showed through it.
 * The worst case now is a blurred version of the right image.
 */
const BG_BLUR =
  "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAQCdASoMAAcAA8BgJbACdAEPDiQa3oAA/uRiehZ8+7WRdsocF+JXoRiufd95tqYmgp/unHqxTu9xck2F/RlMAAA=";

/**
 * 90 rather than the default 75.
 *
 * This wallpaper is dark and smooth — mean brightness 44/255, standard
 * deviation 23 — which is exactly the content WebP bands worst on, and q75
 * squeezed a 1920-wide render to 24KB. Measured at q90: 55KB at 1920, 210KB at
 * 3840. That is a real cost on the first paint, and it buys the one full-screen
 * image every visitor sees before anything else — but see `BG_SIZES` for why
 * phones no longer reach for the 3840 end of that.
 */
const BG_QUALITY = 90;

/** Verbatim copy from the live site. The apostrophe is a straight U+0027. */
const HEADING_KICKER = "Hey, I'm Hà! Welcome to my";
const HEADING_TITLE = "Portfolio";
const TAGLINE = "Explore it like a Mac.";

/** Framer's appear-animation curve, reused by the exit transition. */
const EASE = "cubic-bezier(0.86, 0, 0.14, 1)";
/** 1s entrance + ~0.7s letter stagger + a beat. */
const EXIT_AT = 2600;
const EXIT_DURATION = 1000;
/** Reduced motion: never leave the desktop stuck behind the splash. */
const REDUCED_MOTION_EXIT_AT = 200;

type Phase = "in" | "out" | "done";

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

interface PreLoaderProps {
  onFinish?: () => void;
}

/**
 * Full-screen intro overlay that plays once and removes itself.
 *
 * The exit is driven entirely by `container-wrap` collapsing its height from
 * `100vh` to `2px`. Because `container-mask` is absolutely bottom-anchored
 * inside that wrap, the collapse carries the mask up and out of frame while its
 * border-radius rounds to an ellipse — no manual translation involved. The
 * headline lives *inside* the mask, so the ellipse clips the text and the
 * background together as it closes.
 */
export function PreLoader({ onFinish }: PreLoaderProps) {
  const [phase, setPhase] = useState<Phase>("in");
  const reduced = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionServerSnapshot,
  );

  // Kept in a ref so a changing `onFinish` identity can never re-arm the timers.
  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (reduced) {
      timers.push(
        setTimeout(() => {
          setPhase("done");
          finishRef.current?.();
        }, REDUCED_MOTION_EXIT_AT),
      );
    } else {
      timers.push(setTimeout(() => setPhase("out"), EXIT_AT));
      timers.push(
        setTimeout(() => {
          setPhase("done");
          finishRef.current?.();
        }, EXIT_AT + EXIT_DURATION),
      );
    }

    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [reduced]);

  if (phase === "done") return null;

  const isOut = phase === "out";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-10 flex h-full w-full items-center justify-center overflow-clip"
    >
      <div className="flex h-full w-full flex-col items-center justify-between overflow-clip">
        {/* container-wrap — its height is the animated property that drives the exit. */}
        <div
          className="relative flex w-full flex-col items-center justify-end gap-[10px] overflow-clip"
          style={{
            height: isOut ? "2px" : "100vh",
            transition: reduced ? undefined : `height ${EXIT_DURATION}ms ${EASE}`,
          }}
        >
          {/* container-mask — bleeds 144px past both edges, bottom-anchored at 10px.
              Sole child of container-wrap; everything visible lives inside it. */}
          <div
            className="absolute inset-x-[-144px] bottom-[10px] z-[4] flex h-screen items-center justify-center overflow-clip"
            style={{
              borderRadius: isOut ? "50%" : "0px",
              transition: reduced ? undefined : `border-radius ${EXIT_DURATION}ms ${EASE}`,
            }}
          >
            {/* `preload` replaces `priority`, which Next 16 deprecated. This is the
                one image on the page that is unambiguously the LCP element, so a
                `<link rel="preload">` in the head is exactly right for it — and
                the desktop wallpaper behind the splash has been demoted to
                `fetchPriority="low"` so that it no longer competes. */}
            <Image
              src={BG_SRC}
              alt=""
              fill
              preload
              sizes={BG_SIZES}
              quality={BG_QUALITY}
              placeholder="blur"
              blurDataURL={BG_BLUR}
              className="object-cover"
            />

            {/* content-container — carries the scale(3) → scale(1) entrance. */}
            <div
              className={cn(
                "relative z-[2] flex h-full w-full flex-col items-center justify-center gap-[10px] overflow-clip p-3",
                !reduced && "portos-preloader-content",
              )}
            >
              {/* Same URL as the copy above, so this is a cache hit rather than a
                  second download. `loading="eager"` only skips waiting on the
                  intersection observer; it must NOT preload again. */}
              <Image
                src={BG_SRC}
                alt=""
                fill
                loading="eager"
                sizes={BG_SIZES}
                quality={BG_QUALITY}
                placeholder="blur"
                blurDataURL={BG_BLUR}
                className="object-cover"
              />

              <div className="flex items-center justify-center">
                {/* Title Wrapper */}
                <div className="z-[1] flex w-full max-w-[433px] flex-col items-center justify-center gap-2">
                  <h5
                    className={cn(
                      "whitespace-pre text-center font-sans font-[200] text-white/70",
                      "text-[16px] leading-[20.8px] tracking-[-0.32px]",
                      "min-[810px]:text-[20px] min-[810px]:leading-[26px] min-[810px]:tracking-[-0.4px]",
                      "min-[1200px]:text-[25px] min-[1200px]:leading-[32.5px] min-[1200px]:tracking-[-0.5px]",
                    )}
                  >
                    {HEADING_KICKER}
                  </h5>

                  <h1
                    className={cn(
                      "whitespace-pre text-start font-display font-bold text-white",
                      "text-[70px] leading-[70px] tracking-[-0.7px]",
                      "min-[810px]:text-[100px] min-[810px]:leading-[100px] min-[810px]:tracking-[-1px]",
                      "min-[1200px]:text-[116px] min-[1200px]:leading-[116px] min-[1200px]:tracking-[-1.16px]",
                    )}
                  >
                    {HEADING_TITLE}
                  </h1>

                  <p className="whitespace-pre text-center font-sans text-[12px] font-normal leading-[16.8px] text-white/80">
                    {Array.from(TAGLINE).map((character, index) => (
                      <span
                        // The string is fixed, so index is a stable identity here.
                        key={`${character}-${index}`}
                        className={cn(
                          "inline-block whitespace-pre",
                          !reduced && "portos-preloader-letter",
                        )}
                        style={{ "--i": index } as React.CSSProperties}
                      >
                        {character}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes portos-preloader-zoom {
          from { transform: scale(3) translateY(24px); }
          to { transform: scale(1) translateY(0); }
        }
        .portos-preloader-content {
          opacity: 1;
          animation: portos-preloader-zoom 1s ${EASE} both;
        }
        .portos-preloader-letter {
          animation: portos-letter-in 0.5s ease-out both;
          animation-delay: calc(var(--i) * 30ms);
        }
      `}</style>
    </div>
  );
}
