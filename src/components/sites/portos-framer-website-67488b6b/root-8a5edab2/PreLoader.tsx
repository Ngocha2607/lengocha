"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { PORTOS_ASSETS } from "@/types/portos";

const BG_SRC = `${PORTOS_ASSETS}/images/preloader-bg.png`;

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
            <Image src={BG_SRC} alt="" fill priority sizes="100vw" className="object-cover" />

            {/* content-container — carries the scale(3) → scale(1) entrance. */}
            <div
              className={cn(
                "relative z-[2] flex h-full w-full flex-col items-center justify-center gap-[10px] overflow-clip p-3",
                !reduced && "portos-preloader-content",
              )}
            >
              <Image src={BG_SRC} alt="" fill sizes="100vw" className="object-cover" />

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
