"use client";

import Image from "next/image";
import { useState } from "react";
import { PORTOS_ASSETS, type JournalEntry } from "@/types/portos";

/**
 * The two slides at the top of the window. The live site repeats this pair four
 * times in the DOM to fake an infinite loop — we reproduce the wrap-around
 * behaviour instead, so each asset appears exactly once.
 *
 * `blurb` is the description that sits to the right of the title.
 */
const SLIDES: JournalEntry[] = [
  {
    title: "LMS Platform · SAPP Academy",
    blurb:
      "The learner-facing side of a large-scale learning platform on Next.js 14 App Router — one of four frontends the lms-fe monorepo builds. I own the frontend technical direction, and took the worst route from 15.2s to 6.1s.",
    image: "journal-hero.png",
    imageHeight: 402,
  },
  {
    title: "Operations back-office · SAPP",
    blurb:
      "Sixteen operations modules running the academy behind the LMS: classes, question bank, grading, scheduling and attendance. The attendance system spans repositories, so reconciliation is where the real work sits.",
    image: "journal-portrait.png",
    imageHeight: 402,
  },
];

/**
 * The cards below the slideshow, in DOM order — rows of two.
 * Here `blurb` carries the category tag that sits opposite the title.
 *
 * These are the four pieces actually published at lengocha.vercel.app/writing,
 * titled in English to match the rest of this site. The template shipped six
 * fictional design essays; there are four real ones, so the grid is now two rows
 * rather than three. The images stay as the template's abstract editorial photos —
 * they are decorative thumbnails, not depictions of the articles.
 *
 * `projects-08.png` is not a typo: the live site reuses that one asset from the
 * Projects window here.
 */
const CARDS: JournalEntry[] = [
  {
    title: "A Modular LMS on a Plugin Architecture",
    blurb: "Writing",
    image: "journal-01.png",
    imageHeight: 282,
  },
  {
    title: "Two Frontends, One Training Ops System",
    blurb: "Writing",
    image: "journal-02.png",
    imageHeight: 361,
  },
  {
    title: "An AppSec Handbook for Frontend",
    blurb: "Writing",
    image: "journal-03.png",
    imageHeight: 361,
  },
  {
    title: "Replacing TinyMCE with a Tiptap Build",
    blurb: "Writing",
    image: "projects-08.png",
    imageHeight: 282,
  },
];

/** Measured slide width; the track step is 704px (680 plus the 24px gap). */
const SLIDE_WIDTH = 680;
const SLIDE_GAP = 24;
/** Measured card column width. */
const CARD_WIDTH = 328;

/**
 * Body of the "Journal" window — the chrome comes from `WindowFrame`, which
 * renders `children` flush against the 44px title bar, so the 50px gap down to
 * the container is supplied here.
 *
 * The slideshow is CLICK-DRIVEN only. Sampling the track position once a second
 * for 8s on the live site showed it never moves on its own, and clicking "Next"
 * advanced it by exactly one slide — so there is no timer and no page dots here,
 * unlike the sibling `WallpaperWindow` carousel which genuinely auto-advances.
 * The cards are equally inert: no hover state, no link, no click target.
 *
 * This window is narrower than the others: the container measures 720px wide
 * (not 864) and is centred, leaving a 680px content column, and the 60px bottom
 * padding sits on the window body rather than on the container.
 *
 * Below 864px the live site clips rather than reflows, so everything under the
 * `min-[760px]` breakpoint — the fluid column, the aspect-ratio crops, the
 * single-column card grid and the smaller stacked slide heading — is our own
 * graceful fallback, not a measurement.
 */
export function JournalWindow() {
  const [index, setIndex] = useState(0);

  return (
    // Window body
    <div className="flex w-full flex-col items-center gap-[50px] pb-[60px] pt-[50px]">
      {/* Container — 720px wide and centred inside the 864px window */}
      <div className="flex w-full max-w-[720px] items-center justify-center px-5">
        {/* Content */}
        <div className="flex w-full flex-col items-center gap-5">
          {/* Title & Slaidshow */}
          <div className="flex w-full flex-col items-center gap-8">
            {/* Slideshow viewport */}
            <div className="relative w-full overflow-hidden min-[760px]:w-[680px]">
              {/* Track — `items-end` keeps every image bottom flush with the
                  viewport bottom, which is what the arrows are anchored to. */}
              <div
                className="flex w-full items-end gap-[24px] transition-transform duration-[600ms] ease-[ease]"
                style={{
                  transform: `translateX(calc(${index} * -100% - ${index * SLIDE_GAP}px))`,
                }}
              >
                {SLIDES.map((slide) => (
                  <div
                    key={slide.title}
                    className="flex w-full shrink-0 flex-col items-center gap-4 min-[760px]:w-[680px]"
                  >
                    {/* Title & Time */}
                    <div className="flex w-full flex-col items-start gap-2 min-[600px]:flex-row min-[600px]:items-center min-[600px]:justify-between min-[600px]:gap-0">
                      <h3 className="w-full font-display text-[24px] font-medium leading-[28.8px] tracking-[-0.32px] text-black/70 min-[600px]:w-1/2 min-[600px]:text-[32px] min-[600px]:leading-[38.4px] min-[760px]:w-[340px]">
                        {slide.title}
                      </h3>
                      <p className="w-full font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black/50 min-[600px]:w-1/2 min-[760px]:w-[340px]">
                        {slide.blurb}
                      </p>
                    </div>
                    {/* Image */}
                    <Image
                      src={`${PORTOS_ASSETS}/images/${slide.image}`}
                      alt=""
                      width={SLIDE_WIDTH}
                      height={slide.imageHeight}
                      sizes="(min-width: 760px) 680px, 100vw"
                      className="aspect-[680/402] w-full rounded-none object-cover min-[760px]:aspect-auto min-[760px]:h-[402px] min-[760px]:w-[680px]"
                    />
                  </div>
                ))}
              </div>
              {/* Previous / Next — overlaid on the bottom-left of the image,
                  32px in from the slide's left edge and 31px above its bottom.
                  `data-no-drag` stops `WindowFrame` starting a window drag. */}
              <div data-no-drag className="absolute bottom-[31px] left-[32px] flex flex-row gap-4">
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() =>
                    setIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length)
                  }
                  className="flex size-[66px] cursor-pointer items-center justify-center rounded-[60px] bg-black/10 p-0"
                >
                  <Image
                    src={`${PORTOS_ASSETS}/images/journal-arrow-back.png`}
                    alt=""
                    width={66}
                    height={66}
                    className="size-[66px]"
                  />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => setIndex((current) => (current + 1) % SLIDES.length)}
                  className="flex size-[66px] cursor-pointer items-center justify-center rounded-[60px] bg-black/10 p-0"
                >
                  <Image
                    src={`${PORTOS_ASSETS}/images/journal-arrow-next.png`}
                    alt=""
                    width={66}
                    height={66}
                    className="size-[66px]"
                  />
                </button>
              </div>
            </div>
            {/* Card grid — 2 x 328px, 24px column gap, 32px row gap, rows
                top-aligned so the shorter crop leaves the gap underneath. */}
            <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 min-[760px]:grid-cols-[328px_328px] min-[760px]:justify-center">
              {CARDS.map((card) => (
                <div key={card.image} className="flex w-full flex-col gap-3 min-[760px]:w-[328px]">
                  <Image
                    src={`${PORTOS_ASSETS}/images/${card.image}`}
                    alt=""
                    width={CARD_WIDTH}
                    height={card.imageHeight}
                    sizes="(min-width: 760px) 328px, 100vw"
                    // Tailwind's JIT never sees a class built from data, and
                    // preflight forces `img { height: auto }` — so the measured
                    // crop has to travel as a custom property instead.
                    style={
                      {
                        "--portos-journal-h": `${card.imageHeight}px`,
                        "--portos-journal-ar": `${CARD_WIDTH} / ${card.imageHeight}`,
                      } as React.CSSProperties
                    }
                    className="aspect-[var(--portos-journal-ar)] w-full rounded-none object-cover min-[760px]:aspect-auto min-[760px]:h-[var(--portos-journal-h)] min-[760px]:w-[328px]"
                  />
                  <div className="flex flex-row items-center justify-between">
                    <p className="font-display text-[20px] font-medium leading-[28px] tracking-[-0.4px] text-black/70">
                      {card.title}
                    </p>
                    <p className="font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black/50">
                      {card.blurb}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
