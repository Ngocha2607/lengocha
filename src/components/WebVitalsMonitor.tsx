"use client";

import { useEffect, useState } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

type Rating = Metric["rating"];

interface Reading {
  value: number;
  rating: Rating;
}

const seconds = (value: number) => `${(value / 1000).toFixed(2)}s`;

/**
 * The same five metrics the Performance section quotes as lab data, so the two
 * strips can be compared directly. `good` is the Core Web Vitals threshold and
 * `plain` is the same wording FIELD_METRICS uses over there — the acronyms mean
 * nothing to most readers, and the pair only works if both sides match.
 */
const METRICS = [
  { name: "LCP", plain: "main content appears", good: "< 2.5s", format: seconds },
  { name: "FCP", plain: "page starts drawing", good: "< 1.8s", format: seconds },
  { name: "TTFB", plain: "server answers", good: "< 0.8s", format: seconds },
  {
    name: "INP",
    plain: "taps respond",
    good: "< 200ms",
    format: (value: number) => `${Math.round(value)}ms`,
    /** INP cannot exist until the visitor interacts, so say so rather than sit blank. */
    pending: "needs a click",
  },
  {
    name: "CLS",
    plain: "layout holds still",
    good: "< 0.1",
    format: (value: number) => value.toFixed(3),
  },
] as const;

const TEXT_TONE: Record<Rating, string> = {
  good: "text-teal-300",
  "needs-improvement": "text-amber-300",
  poor: "text-rose-400",
};

const DOT_TONE: Record<Rating, string> = {
  good: "bg-teal-300",
  "needs-improvement": "bg-amber-300",
  poor: "bg-rose-400",
};

export function WebVitalsMonitor() {
  const [readings, setReadings] = useState<Record<string, Reading>>({});

  useEffect(() => {
    const record = (metric: Metric) =>
      setReadings((current) => ({
        ...current,
        [metric.name]: { value: metric.value, rating: metric.rating },
      }));

    // reportAllChanges keeps the readout live. The default only reports once the
    // page is hidden, which is useless for something rendered on screen.
    const options = { reportAllChanges: true };
    onLCP(record, options);
    onFCP(record, options);
    onTTFB(record, options);
    onINP(record, options);
    onCLS(record, options);
  }, []);

  return (
    <section aria-labelledby="vitals-title">
      <p className="text-xs font-bold uppercase tracking-widest text-teal-300">
        Live
      </p>
      <h2
        id="vitals-title"
        className="mt-2 text-lg font-semibold tracking-tight text-slate-200"
      >
        This page, measured in your browser right now
      </h2>
      <p className="mt-2 text-sm leading-normal text-slate-400">
        The same five checks the Performance section reports on the LMS — run
        against this page, on your device, as you read it.
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {METRICS.map((metric) => {
          const reading = readings[metric.name];
          const pending = "pending" in metric ? metric.pending : "measuring";
          return (
            <li
              key={metric.name}
              className="rounded border border-slate-800 bg-slate-800/25 px-3 py-2.5"
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    reading ? DOT_TONE[reading.rating] : "bg-slate-700"
                  }`}
                  aria-hidden="true"
                />
                {metric.name}
              </p>
              <p className="mt-0.5 min-h-7 text-[11px] leading-tight text-slate-500">
                {metric.plain}
              </p>
              {/*
                Both states occupy one line, so the readout filling in cannot
                shift the page — a CWV widget that causes CLS is self-refuting.
              */}
              <p
                className={`mt-1 text-lg font-bold tabular-nums ${
                  reading ? TEXT_TONE[reading.rating] : "text-slate-600"
                }`}
              >
                {reading ? metric.format(reading.value) : "—"}
              </p>
              <p className="text-xs tabular-nums text-slate-600">
                {reading ? metric.good : pending}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        Measured with{" "}
        <a
          className="text-slate-500 underline decoration-slate-700 underline-offset-2 hover:text-teal-300 hover:decoration-teal-300 focus-visible:text-teal-300"
          href="https://github.com/GoogleChrome/web-vitals"
          target="_blank"
          rel="noreferrer noopener"
        >
          web-vitals
        </a>{" "}
        in your browser and rendered here, against the Core Web Vitals
        thresholds — nothing leaves the page. It is one
        sample on your device and your network, not a p75, so read it as a spot
        check rather than a score. Everything in the Performance section is lab
        data from a codebase you can&apos;t open; this is the one reading on the
        site you can take yourself.
      </p>
    </section>
  );
}
