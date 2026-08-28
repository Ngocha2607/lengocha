"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { PORTOS_ASSETS, type AboutCounter } from "@/types/portos";
import { AboutBulletBlocks, AboutExperience } from "./AboutDetails";

/**
 * `AboutCounter` carries the settled string only. The live site renders these
 * through Framer's Counter, which rolls the number up from zero on mount, so
 * the animated halves live in this local extension rather than in the shared
 * contract.
 */
interface RollingCounter extends AboutCounter {
  /** The number the roll lands on. */
  target: number;
  /** Travels with the number for the whole roll — `+`, ` Years`, or nothing. */
  suffix: string;
}

/**
 * Two rows of two. Every figure below is taken from Lê Ngọc Hà's CV rather than
 * invented: ~5 years' experience, the 60% page-load reduction on the SAPP LMS
 * (15.2s → 6.1s), 5 juniors mentored (2 at SAPP, 3 at Tweet World Travel), and
 * the 30% productivity gain from the AI workflow. Labels are Vietnamese to match
 * the CV, whose body copy this window now carries verbatim.
 */
const ABOUT_COUNTERS: RollingCounter[] = [
  { label: "• Kinh nghiệm", value: "5 năm", target: 5, suffix: " năm" },
  {
    label: "• Giảm thời gian tải trang",
    value: "60%",
    target: 60,
    suffix: "%",
  },
  { label: "• Junior đã mentor", value: "5", target: 5, suffix: "" },
  { label: "• Tăng năng suất", value: "30%", target: 30, suffix: "%" },
];

/**
 * The CV's PROFESSIONAL SUMMARY, verbatim in Vietnamese (requested), split at
 * its own sentence boundary so the window keeps its two-paragraph rhythm.
 */
const INTRO_PARAGRAPHS = [
  "Senior Frontend Engineer — hiện là Frontend Tech Lead tại SAPP Academy — gần 5 năm kinh nghiệm xây dựng và dẫn dắt hệ thống web trong lĩnh vực EdTech và TravelTech.",
  "Sở trường về kiến trúc Frontend, Monorepo, tối ưu hiệu năng và xây dựng quy trình kỹ thuật cho team. Đã dẫn dắt các sáng kiến từ nâng cấp Next.js, chuẩn hóa hệ thống package, tích hợp Security Pipeline đến xây dựng AI Workflow — tập trung vào tác động đo được và khả năng mở rộng của hệ thống.",
];

/** The roll captured on the live site settles in a little over a second. */
const COUNT_DURATION = 1200;

/** Ease-out cubic — fast off the mark, gliding into the final value. */
function easeOut(t: number): number {
  return 1 - (1 - t) ** 3;
}

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
 * Body of the "About" window ("About") — the chrome comes from
 * `WindowFrame`, which renders `children` flush against the 44px title bar, so
 * the 50px gap down to the content (which starts at y = 93) is supplied here.
 *
 * The body is TWO regions stacked on the measured 52px rhythm:
 *
 *   Region 1  the measured 330x371 portrait, a 24px gap, and the 470px column
 *             holding the intro, the counters, Expertise and Stack.
 *   Region 2  Experience, full width across the whole 824px.
 *
 * That split is load-bearing, not cosmetic. A sticky element is confined to its
 * containing block, so region 1's row IS the definition of how far the portrait
 * pins: it releases the moment Stack ends. Merging the regions back into one row
 * would pin the portrait all the way to the bottom of the window.
 *
 * The four counters hold the ONE animation in this window: the live DOM stacks
 * two `<h2>`s inside an `overflow: clip` column and was captured mid-flight at
 * `45+` / `0+`, which is Framer's Counter rolling from zero on mount. Nothing
 * else here reacts — no hover, no clicks, no links.
 *
 * Below 880px the live site clips rather than reflows; stacking the portrait
 * above the column, and dropping the counters to one per row below 560px, are
 * our own graceful fallback rather than measurements.
 *
 * DIVERGENCES FROM THE LIVE SITE, all requested (see ARTIFACT_MANIFEST.md):
 *   - the portrait pins (the live one scrolls away — measured);
 *   - Experience is a climbing timeline, not a three-column table, and runs full
 *     width instead of inside the 470px column;
 *   - Stack items carry brand logos, not bullets;
 *   - the second column of Expertise and Stack is half the 470px column, so it
 *     sits under the second counter, replacing a measured flush-right 155px;
 *   - the template's fourth block, "Tools I Use", is dropped entirely.
 */
export function AboutWindow() {
  const reduced = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionServerSnapshot,
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let start: number | null = null;

    // Driven from rAF rather than the effect body, so no synchronous setState.
    const step = (now: number) => {
      start ??= now;
      const elapsed = Math.min((now - start) / COUNT_DURATION, 1);
      setProgress(easeOut(elapsed));
      if (elapsed < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  const settled = reduced || progress >= 1;

  return (
    <div className="pt-[50px]">
      {/* Content — the two regions, on the same 52px rhythm as everything else. */}
      <div className="flex w-full flex-col gap-[52px] px-5 pb-[60px]">
        {/* Region 1 — portrait beside the 470px column. This row is the
            portrait's sticky containing block, so the pin releases here. */}
        <div className="flex w-full flex-col items-start justify-center gap-6 min-[880px]:flex-row">
          <Image
            src={`${PORTOS_ASSETS}/images/Le_Ngoc_Ha.jpg`}
            alt="Lê Ngọc Hà"
            width={330}
            height={371}
            sizes="(min-width: 880px) 330px, 100vw"
            // Tailwind preflight forces `img { height: auto }`, so the measured
            // 330x371 crop has to be re-stated in CSS.
            //
            // `sticky top-[94px]` is a DIVERGENCE from the live site, added on
            // request. Verified against the original: scrolling its About body by
            // 500px moves the portrait by exactly 500px, and no ancestor in six
            // levels carries `position: sticky`.
            //
            // 94px = 44 (title bar) + 50 (the content gap below it), and the 44 is
            // the part that is easy to get wrong. `.portos-scroll` starts at the
            // WINDOW's top edge with `padding-top: 0`, and the title bar is painted
            // OVER it — so a sticky offset is measured from the top of the title
            // bar, not from below it. `top-[50px]` therefore looks correct and is
            // not: it pins the portrait 6px under the title bar and makes it jump
            // 44px on first scroll. Measured: scrollport top 68, portrait at rest
            // 162, so the offset that holds it perfectly still is 162 - 68 = 94.
            //
            // Scoped to >=880px because below that the row stacks into a column,
            // where pinning the portrait would push all the text off-screen.
            className="aspect-[330/371] w-full rounded-none object-cover min-[880px]:sticky min-[880px]:top-[94px] min-[880px]:aspect-auto min-[880px]:h-[371px] min-[880px]:w-[330px] min-[880px]:shrink-0 min-[880px]:self-start"
          />

          {/* The text column. `flex-1` rather than the measured `w-[470px]`, and
              that is not a loosening — it DERIVES the same 470. The content box
              is 824, the portrait is a fixed 330, the gap is 24, so what is left
              is exactly 470. Writing it as a constraint instead of a constant
              means the column also absorbs the extra width when the window is
              maximised, where a hard 470 would leave the row marooned in the
              middle with the portrait. */}
          <div className="flex w-full flex-col items-start gap-[52px] min-[880px]:flex-1">
            {/* Title Wrapper */}
            <div className="flex w-full flex-col items-start gap-8">
              {/* Intro */}
              <div className="flex w-full flex-col items-start gap-5">
                {/* Title & Details */}
                <div className="flex w-full flex-col gap-4">
                  <h3 className="font-display text-[32px] leading-[38.4px] tracking-[-0.32px] text-black">
                    Xin chào, tôi là Hà.
                  </h3>
                  {/* Details */}
                  <div className="flex w-full flex-col gap-3">
                    {INTRO_PARAGRAPHS.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Signature — Inspiration, not SF Pro. */}
                <h2 className="font-signature text-[72px] leading-[86.4px] tracking-[-2.88px] text-black">
                  Hà
                </h2>
              </div>

              {/* All Counters — two rows of two, 19px apart. */}
              <div className="flex w-full flex-col gap-8">
                {[ABOUT_COUNTERS.slice(0, 2), ABOUT_COUNTERS.slice(2)].map(
                  (row) => (
                    <div
                      key={row[0].label}
                      className="flex w-full flex-col gap-8 min-[560px]:flex-row min-[560px]:gap-[19px]"
                    >
                      {row.map((counter) => (
                        <div
                          key={counter.label}
                          className="flex-1 overflow-clip border-t border-black/10 pt-2"
                        >
                          <div className="flex flex-col items-start gap-[2px]">
                            <p className="font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black/70">
                              {counter.label}
                            </p>
                            <h2 className="font-display text-left text-[20px] leading-[28px] font-bold tracking-[-0.4px] text-black">
                              {settled
                                ? counter.value
                                : `${Math.round(counter.target * progress)}${counter.suffix}`}
                            </h2>
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                )}
              </div>

              {/* The source template had a two-up block of team-member photo cards
                  here (Ethan Carter / Sophia Bennett — stock people). Removed rather
                  than refilled: there is no real content for it, and reusing the
                  stock portraits under a different name would be inventing people.
                  Restore the block if two genuine images turn up (workplace shots,
                  project screenshots) — the markup is in git history. */}
            </div>

            {/* Expertise + Stack — the last blocks the portrait stays beside. */}
            <AboutBulletBlocks />
          </div>
        </div>

        {/* Region 2 — full width, portrait released. */}
        <AboutExperience />
      </div>
    </div>
  );
}
