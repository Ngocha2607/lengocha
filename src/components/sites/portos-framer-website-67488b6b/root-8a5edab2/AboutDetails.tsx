/**
 * Lower blocks of the "About" window body, split across TWO layout regions.
 *
 * `AboutBulletBlocks` (Expertise, Stack) stays inside the 470px column that sits
 * beside the portrait, because that column is the portrait's sticky containing
 * block — sticky ends exactly where this component ends.
 *
 * `AboutExperience` is rendered full-width BELOW that row, so the portrait
 * releases and the timeline gets the whole 824px to breathe.
 *
 * Typography of the bullet blocks is the cloned template's, measured from the
 * live site. The CONTENT is Lê Ngọc Hà's own, from his CV. The Experience
 * timeline, the Stack logos and the two-column alignment are OUR OWN, added on
 * request — the live site renders Experience as a plain three-column table and
 * Stack as a bare bullet list.
 *
 * A fourth block, "Tools I Use" (three self-assessed proficiency bars), was
 * removed on request. Its markup and the measured gaps behind it are in git
 * history. See ARTIFACT_MANIFEST.md.
 *
 * Fully static: no hover states, no links.
 */

import type { TimelineEntryCopy } from "@/i18n/types";
import { STACK_ICONS, type StackName } from "./StackIcons";

type ExperienceEntry = TimelineEntryCopy;

/**
 * Read down the left column, then down the right. Frontend first, then the
 * backend and infrastructure work that backs the Fullstack headline, then the
 * cross-cutting skills.
 */
const EXPERTISE: readonly string[] = [
  "Frontend Architecture",
  "Backend & Payment Integration",
  "Cloud Migration & DevOps",
  "Performance Engineering",
  "Design System & Monorepo",
  "Security Engineering",
  "AI-assisted Development",
  "Technical Leadership",
];

/** Same reading order as Expertise: down the left column, then the right. */
const STACK: readonly StackName[] = [
  "React",
  "Next.js",
  "TypeScript",
  "NestJS",
  "Spring Boot",
  "PostgreSQL",
  "Turborepo",
  "Docker",
  "GitLab CI/CD",
  "AWS",
  "Vercel",
];

/** Left column takes the extra item when the count is odd. */
function splitColumns<T>(items: readonly T[]): [readonly T[], readonly T[]] {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}

const [EXPERTISE_LEFT, EXPERTISE_RIGHT] = splitColumns(EXPERTISE);
const [STACK_LEFT, STACK_RIGHT] = splitColumns(STACK);

/**
 * Chronological, oldest first — the reading order a left-to-right timeline
 * implies. This reverses the CV's usual newest-first ordering on purpose.
 *
 * Company names are the SHORT forms ("Minastik", not "Minastik JSC"; "Tweet
 * World", not "Tweet World Travel") because each timeline column is only ~165px
 * wide and the full names wrap onto two lines, breaking the row rhythm.
 *
 * Vietnamese; the English is `EN_ABOUT.timeline` in src/i18n/en.ts, which must
 * keep the same five entries — the rail geometry below is computed from this
 * list's length. The About window picks one and passes it in.
 */
export const VI_TIMELINE: readonly ExperienceEntry[] = [
  { dates: "2018 – 2022", company: "HUST", role: "Cử nhân CTTT ĐTVT" },
  { dates: "2021", company: "FPT Software", role: "Thực tập sinh" },
  { dates: "2021 – 2023", company: "Minastik", role: "Frontend Developer" },
  {
    dates: "2023 – 2025",
    company: "Tweet World Travel",
    role: "Fullstack Developer",
  },
  {
    dates: "2025 – Hiện tại",
    company: "SAPP Academy",
    role: "Frontend Tech Lead",
  },
];

const HEADING_CLASS =
  "font-display text-[18px] leading-[25.2px] tracking-[-0.54px] text-black";

const BULLET_CLASS =
  "font-display text-[14px] leading-[19.6px] tracking-[-0.14px] whitespace-pre text-black/60";
/** The bullet and its run of spaces, as the live site writes them. */
const BULLET = "•   ";

/** Same size and colour as a bullet row, but laid out around a 16px logo. */
const STACK_ROW_CLASS =
  "flex items-center gap-2 font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black/70";

/**
 * The two-column list shared by Expertise and Stack, under a full-width heading.
 *
 * `flex-1` on both halves with a 19px gap is not a guess — it is the SAME rule
 * the counters block above uses, and that is the entire point. The counters split
 * the 470px column into two 225.5px halves, so the second list column now
 * starts at 244.5px: directly under the second counter in each row. Change the
 * counters' gap and these must change with it.
 *
 * This REPLACES a measured 155px width. On the live site the second column is a
 * fixed 155px flush to the right edge, starting at x = 315.4 — which lines up
 * with nothing above it. Aligning the two was requested; see ARTIFACT_MANIFEST.md.
 *
 * The heading sits above BOTH columns and the columns are top-aligned. It used
 * to sit inside the left column, with the row bottom-aligned (`items-end`) so the
 * right list lined up with the left one. That only works while the two lists
 * are the same length: with an odd count (Stack has 11) the right column would
 * start a row lower than the left. Top-aligned, the odd item is simply the left
 * column's last row.
 *
 * Below 560px the halves stack into one list. The gap between them is the
 * list's own row gap, passed in, so the stacked result reads as one continuous
 * list rather than two groups.
 */
const LIST_ROW_CLASS =
  "flex w-full flex-col items-start min-[560px]:flex-row min-[560px]:gap-[19px]";
/**
 * Each half of that frame — half the column, matching one counter cell.
 *
 * The half carries NO padding; the indent below goes on the list inside it.
 * `flex-1` shares out the space left after padding, so an 8px indent on the
 * half itself makes that half 8px wider than the other (measured 230/222
 * instead of 225.5/225.5) and pushes the right column off the second counter.
 */
const LIST_HALF_CLASS = "w-full min-[560px]:flex-1";

/**
 * The left list's 8px indent, which the right list needs ONLY while stacked.
 *
 * The live site gives the left list `padding-left: 8px` and the right list none.
 * Side by side that is invisible — each column starts at its own edge. Below
 * 560px they stack into one column, and the indent that used to be private to
 * the left list would become a visible 8px step halfway down the list.
 *
 * So the indent is matched while stacked and dropped again at 560px, where the
 * measured two-column layout takes over.
 */
const LIST_LEFT_CLASS = "flex flex-col pl-2";
const LIST_RIGHT_CLASS = "flex flex-col pl-2 min-[560px]:pl-0";

interface TwoColumnBlockProps<T> {
  heading: string;
  left: readonly T[];
  right: readonly T[];
  /** Row gap inside each list, and between the two lists while stacked. */
  gapClass: string;
  renderItem: (item: T) => React.ReactNode;
}

function TwoColumnBlock<T extends string>({
  heading,
  left,
  right,
  gapClass,
  renderItem,
}: TwoColumnBlockProps<T>) {
  return (
    <div className="flex w-full flex-col gap-4">
      <p className={HEADING_CLASS}>{heading}</p>
      <div className={`${LIST_ROW_CLASS} ${gapClass}`}>
        <div className={LIST_HALF_CLASS}>
          <div className={`${LIST_LEFT_CLASS} ${gapClass}`}>{left.map(renderItem)}</div>
        </div>
        <div className={LIST_HALF_CLASS}>
          <div className={`${LIST_RIGHT_CLASS} ${gapClass}`}>{right.map(renderItem)}</div>
        </div>
      </div>
    </div>
  );
}

/** The timeline marker colour. Not a token — introduced with the timeline. */
const TIMELINE_ACCENT = "#8B5CF6";
/** Marker diameter; the rail is anchored to marker centres, so both use this. */
const DOT = 11;
/** How far each milestone sits above the one before it — the "climb". */
const RISE_STEP = 18;
/** Headroom above the highest marker, so the arrow has somewhere to point. */
const RAIL_HEADROOM = 14;
/** How far past the last marker the rail runs, as a share of the block width. */
const RAIL_OVERSHOOT_PCT = 14;

/**
 * Rail geometry, derived so the numbers stay honest if the constants move.
 *
 * With `grid-cols-5` each marker sits at its column's left edge, so marker `i` is
 * at `i * 20%` of the block width plus half a dot. Marker 0 is the lowest and
 * marker 4 the highest, which fixes the slope; the rail then carries on past
 * marker 4 by `RAIL_OVERSHOOT_PCT` at that same slope, so the extension reads as
 * the same line continuing rather than a separate flourish.
 */
const LAST_INDEX = VI_TIMELINE.length - 1;
const RAIL_Y_START = RAIL_HEADROOM + LAST_INDEX * RISE_STEP + DOT / 2;
const RAIL_Y_AT_LAST = RAIL_HEADROOM + DOT / 2;
/** Pixels of climb per 1% of block width. Negative: the rail goes up. */
const RAIL_SLOPE = (RAIL_Y_AT_LAST - RAIL_Y_START) / (LAST_INDEX * 20);
const RAIL_Y_END = RAIL_Y_AT_LAST + RAIL_SLOPE * RAIL_OVERSHOOT_PCT;
const RAIL_X_END = `${LAST_INDEX * 20 + RAIL_OVERSHOOT_PCT}%`;

/**
 * The two bullet blocks — top-aligned halves of the 470px column.
 *
 * Column widths, and why they are no longer the live site's measured 155px, are
 * documented on `LIST_ROW_CLASS` above. Below 560px the halves stack; the live
 * site clips rather than reflows, so that fallback is our own.
 */
export function AboutBulletBlocks() {
  return (
    <>
      {/* Expertise — plain bullets, gap 0. */}
      <TwoColumnBlock
        heading="Expertise"
        left={EXPERTISE_LEFT}
        right={EXPERTISE_RIGHT}
        gapClass="gap-0"
        renderItem={(item) => (
          <p key={item} className={BULLET_CLASS}>
            {BULLET}
            {item}
          </p>
        )}
      />

      {/* Stack — same two-column geometry, but each item carries its own logo in
          place of the bullet. Rows gain a 6px gap because a 16px mark does not
          sit comfortably inside a 19.6px line box the way a bullet does. */}
      <TwoColumnBlock
        heading="Stack"
        left={STACK_LEFT}
        right={STACK_RIGHT}
        gapClass="gap-[6px]"
        renderItem={(name) => {
          const Icon = STACK_ICONS[name];
          return (
            <p key={name} className={STACK_ROW_CLASS}>
              <Icon className="size-4" />
              {name}
            </p>
          );
        }}
      />
    </>
  );
}

/**
 * Experience as a CLIMBING timeline — five markers on one rising rail that keeps
 * going past the last of them.
 *
 * Each milestone sits `RISE_STEP` above the one before it, so the rail reads as a
 * career going up rather than a flat list of dates. The whole column moves, dot
 * and text together: lifting only the dots would open a widening gap between each
 * marker and its own label.
 *
 * The rail is an SVG line rather than a rotated `<div>` because the slope depends
 * on the rendered width — markers are placed in percentage columns but lifted in
 * pixels — and an SVG with percentage `x` re-solves that angle at every width for
 * free. The arrowhead is a `<marker orient="auto">`, so it turns with the line
 * instead of needing its own angle.
 *
 * `overflow-visible` matters: SVG clips to its viewport by default, which would
 * shear the arrowhead in half at the end of the line.
 *
 * Below 880px the five columns cannot hold their labels, so the grid drops to
 * three and then two, and both the climb and the rail switch off — they only
 * describe a single row.
 */
export function AboutExperience({ entries }: { entries: readonly ExperienceEntry[] }) {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <p className={HEADING_CLASS}>Experience</p>

      <div className="relative w-full" style={{ paddingTop: RAIL_HEADROOM }}>
        {/* Rail — drawn behind the markers, and only in the 5-across layout. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible min-[880px]:block"
        >
          <defs>
            <linearGradient
              id="portos-xp-rail"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor={TIMELINE_ACCENT}
                stopOpacity="0.18"
              />
              <stop
                offset="100%"
                stopColor={TIMELINE_ACCENT}
                stopOpacity="0.95"
              />
            </linearGradient>
            <marker
              id="portos-xp-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10 Z" fill={TIMELINE_ACCENT} />
            </marker>
          </defs>
          {/* Both ends are PURE percentages and the whole line is then nudged
              right by half a dot. Writing `x1={DOT / 2}` and `x2="94%"` instead
              looks equivalent and is not: the markers sit at `i * 20% + DOT/2`,
              so an x-axis that carries the half-dot at one end and not the other
              is a slightly different affine map, and the markers drift off the
              rail — measured at 0, 0.8, 1.1, 1.4 and 2.1px across the five. SVG
              geometry attributes reject `calc()`, but a transform is applied
              after percentages resolve, so it puts the offset on both ends at
              once and the line passes dead through every marker at any width. */}
          <line
            x1="0"
            y1={RAIL_Y_START}
            x2={RAIL_X_END}
            y2={RAIL_Y_END}
            transform={`translate(${DOT / 2} 0)`}
            stroke="url(#portos-xp-rail)"
            strokeWidth="1.5"
            markerEnd="url(#portos-xp-arrow)"
          />
        </svg>

        {/* `gap-x-0` at the 5-across breakpoint is REQUIRED, not a style choice.
            The rail places its ends with percentages, which assumes marker `i`
            sits at exactly `i * 20%` of the block. A column gap breaks that: with
            `gap-x-4` the five columns are `(824 - 4*16) / 5 = 152px`, not 164.8,
            so the last marker lands 13px right of where 80% predicts and every
            marker drifts off the rail (measured 0.7 to 2.0px). At gap 0 the
            columns are exactly a fifth and the line passes through all five.
            The gap stays on below 880px, where there is no rail to disagree with;
            the widest label is ~118px inside a 164.8px column, so nothing
            collides without it. */}
        <ol className="grid grid-cols-2 gap-x-4 gap-y-8 min-[560px]:grid-cols-3 min-[880px]:grid-cols-5 min-[880px]:gap-x-0 min-[880px]:gap-y-0">
          {entries.map((entry, index) => {
            const isCurrent = index === LAST_INDEX;
            return (
              <li
                key={`${entry.company}-${entry.dates}`}
                // Lifted with a custom property rather than an inline `marginTop`
                // so the climb can be scoped to a breakpoint — inline styles
                // cannot carry a media query.
                style={
                  {
                    "--rise": `${(LAST_INDEX - index) * RISE_STEP}px`,
                  } as React.CSSProperties
                }
                className="flex flex-col items-start min-[880px]:mt-[var(--rise)]"
              >
                <span
                  aria-hidden="true"
                  className="rounded-full"
                  style={{
                    width: DOT,
                    height: DOT,
                    background: TIMELINE_ACCENT,
                    // The current role gets a soft halo — a translucent accent, so
                    // it reads on any background without matching the page colour.
                    boxShadow: isCurrent
                      ? `0 0 0 4px ${TIMELINE_ACCENT}2E`
                      : undefined,
                  }}
                />
                <p className="font-sans mt-4 text-[11px] leading-[15px] font-medium tracking-[0.14em] text-black/45">
                  {entry.dates}
                </p>
                <p className="font-display mt-[6px] text-[17px] leading-[22px] font-bold tracking-[-0.17px] text-black">
                  {entry.company}
                </p>
                <p className="font-display mt-[6px] text-[13px] leading-[18px] tracking-[-0.13px] text-black/55">
                  {entry.role}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
