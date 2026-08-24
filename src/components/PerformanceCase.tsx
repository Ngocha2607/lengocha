"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * Lab Lighthouse, desktop, cold cache, measured against `next build &&
 * next start` — never the dev server. "Before" is the baseline audit; "after"
 * is the re-run once the items in LEVERS had shipped.
 */
const GROUPS = [
  { name: "Student", routes: 8, before: 49, after: 67 },
  { name: "Teacher", routes: 7, before: 72, after: 89 },
];

/**
 * The route the pass was aimed at. The internal audit page attributes these
 * numbers to `/` — that is an error in the document. `/` only redirects here;
 * the measurements were taken on /courses itself.
 */
const TARGET = {
  route: "/courses",
  load: { before: 15.2, after: 6.1 },
  score: { before: 29, after: 65 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TRANSITION_MS = 900;

/** Lighthouse's own banding: red under 50, amber under 90, green above. */
function scoreTone(score: number) {
  if (score >= 90) return "text-teal-300";
  if (score >= 50) return "text-amber-300";
  return "text-rose-400";
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Only what actually shipped. Roadmap items live further down the page. */
const LEVERS = [
  "13 render-blocking stylesheets in the root layout down to 3 — the rest moved into the lazy component that owns them, verified pixel-identical",
  "PinnedNotifications lazy-loaded, taking react-fast-marquee out of the initial bundle on every route",
  "next/font self-hosted with display optional and adjustFontFallback — field CLS holds at 0.01",
  "Auth bootstrap consolidated behind a single authReady gate, replacing loading fallbacks scattered across the tree",
  "Lottie moved to API-driven load-and-cache; the tour-guide animation became a video",
  "Build config: optimizePackageImports, swcMinify, removeConsole and optimizeCss in production",
];

function ScoreDonut({ score, label }: { score: number; label: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className="h-18 w-18 shrink-0 -rotate-90"
      role="img"
      aria-label={`${label}: ${score}`}
    >
      <circle
        cx="40"
        cy="40"
        r={RADIUS}
        fill="none"
        strokeWidth="6"
        className="stroke-slate-800"
      />
      <circle
        cx="40"
        cy="40"
        r={RADIUS}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
        className={`${scoreTone(score)} stroke-current transition-colors motion-reduce:transition-none`}
      />
      <text
        x="40"
        y="40"
        textAnchor="middle"
        dominantBaseline="central"
        transform="rotate(90 40 40)"
        className={`${scoreTone(score)} fill-current text-xl font-bold tabular-nums`}
      >
        {score}
      </text>
    </svg>
  );
}

export function PerformanceCase() {
  const sliderId = useId();
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const commit = useCallback((value: number) => {
    progressRef.current = value;
    setProgress(value);
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  /** Animate the counters toward a preset so the numbers visibly tick over. */
  const animateTo = useCallback(
    (target: number) => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        commit(target);
        return;
      }

      const from = progressRef.current;
      const startedAt = performance.now();

      const step = (now: number) => {
        const t = Math.min((now - startedAt) / TRANSITION_MS, 1);
        commit(lerp(from, target, easeOutCubic(t)));
        frameRef.current = t < 1 ? requestAnimationFrame(step) : null;
      };

      frameRef.current = requestAnimationFrame(step);
    },
    [commit],
  );

  const handleDrag = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      commit(Number(event.target.value) / 100);
    },
    [commit],
  );

  const t = progress;
  const load = lerp(TARGET.load.before, TARGET.load.after, t);
  const targetScore = Math.round(lerp(TARGET.score.before, TARGET.score.after, t));

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-800/25 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Lighthouse performance · lms-pro
      </p>
      {/* The donuts are meaningless to anyone who has not run Lighthouse. */}
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        Google&apos;s page-quality score out of 100 — higher is better.
        Lighthouse bands it red under 50, amber under 90, green above.
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {GROUPS.map((group) => {
          const score = Math.round(lerp(group.before, group.after, t));
          return (
            <div key={group.name} className="flex items-center gap-4">
              <ScoreDonut
                score={score}
                label={`${group.name} routes, Lighthouse performance`}
              />
              <div className="min-w-0">
                <p className="font-medium text-slate-200">{group.name}</p>
                <p className="text-xs tabular-nums text-slate-500">
                  {group.routes} routes · {group.before} → {group.after}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* The route the whole pass was aimed at, so it gets its own readout. */}
      <div className="mt-5 rounded border border-teal-300/20 bg-teal-300/4 p-4">
        <p className="text-xs text-slate-500">
          <span className="font-mono text-teal-300">{TARGET.route}</span> — the
          route the pass was aimed at
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Page load
            </p>
            <p className="mt-1 flex items-baseline gap-1 text-3xl font-bold tabular-nums text-slate-200">
              {load.toFixed(1)}
              <span className="text-lg font-medium text-slate-400">s</span>
            </p>
            <p className="text-xs tabular-nums text-slate-500">
              {TARGET.load.before.toFixed(1)}s → {TARGET.load.after.toFixed(1)}s
            </p>
            {/* Faint bar = the 15.2s starting point; teal = where it sits now. */}
            <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-teal-400/80"
                style={{ width: `${(load / TARGET.load.before) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ScoreDonut
              score={targetScore}
              label={`${TARGET.route} Lighthouse performance`}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lighthouse
              </p>
              <p className="mt-1 text-xs tabular-nums text-slate-500">
                {TARGET.score.before} → {TARGET.score.after}
              </p>
              <p className="mt-1 text-xs text-slate-500">LCP 6.4s at baseline</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        <span className="font-mono text-slate-400">/teachers</span> is the honest
        counterweight: still 66, LCP still 5.9s. The teacher side never moved,
        because none of the shipped items touched what makes that route slow.
      </p>

      <div className="mt-5 border-t border-slate-800 pt-5">
        <label
          htmlFor={sliderId}
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Drag to replay the pass
        </label>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => animateTo(0)}
            className="shrink-0 rounded border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-400 transition hover:border-slate-500 hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 motion-reduce:transition-none"
          >
            Baseline
          </button>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(t * 100)}
            onChange={handleDrag}
            aria-valuetext={`${TARGET.route}: ${load.toFixed(1)} second load, Lighthouse performance ${targetScore}`}
            className="w-full min-w-0 cursor-ew-resize accent-teal-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
          />
          <button
            type="button"
            onClick={() => animateTo(1)}
            className="shrink-0 rounded border border-teal-300/40 px-2.5 py-1 text-xs font-semibold text-teal-300 transition hover:border-teal-300 hover:bg-teal-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 motion-reduce:transition-none"
          >
            Shipped
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
        What shipped
      </p>
      <ul className="mt-3 space-y-2.5">
        {LEVERS.map((lever, index) => {
          const applied = t > index / LEVERS.length;
          return (
            <li key={lever} className="flex gap-3">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                  applied ? "bg-teal-300" : "bg-slate-700"
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-sm leading-normal transition-colors duration-300 motion-reduce:transition-none ${
                  applied ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {lever}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-relaxed text-slate-600">
        Lab Lighthouse, desktop, cold cache, run against{" "}
        <code>next build &amp;&amp; next start</code> — never the dev server.
      </p>
    </div>
  );
}
