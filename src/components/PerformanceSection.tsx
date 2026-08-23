import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { PerformanceCase } from "@/components/PerformanceCase";
import { PipelineTerminal } from "@/components/PipelineTerminal";

/**
 * Field data, Vercel Speed Insights, P75 desktop on UAT, taken before the
 * optimization pass. `good` is the Core Web Vitals threshold, not my target.
 */
const FIELD_METRICS = [
  { name: "LCP", value: "3.92s", good: "< 2.5s", pass: false },
  { name: "FCP", value: "2.55s", good: "< 1.8s", pass: false },
  { name: "TTFB", value: "1.51s", good: "< 0.8s", pass: false },
  { name: "INP", value: "112ms", good: "< 200ms", pass: true },
  { name: "CLS", value: "0.01", good: "< 0.1", pass: true },
];

const ROOT_CAUSES = [
  {
    cause: "An App Router app rendering almost entirely on the client",
    effect:
      "~270 files carry a use-client directive, so data only starts fetching after hydrate — LCP waits on a chain of download, hydrate, call, render.",
  },
  {
    cause: "revalidate = 0 on the root layout",
    effect:
      "Forces a dynamic render on every request and switches off the Full Route Cache, so TTFB cannot come down however well the client behaves.",
  },
  {
    cause: "Heavy libraries imported statically",
    effect:
      "Editor, document viewer, spreadsheet and charts land in the initial bundle, with the animation libraries riding along on every route.",
  },
  {
    cause: "Duplicate libraries doing the same job",
    effect:
      "echarts alongside recharts, dayjs alongside date-fns, firebase compat — double the bytes for none of the value.",
  },
];

export function PerformanceSection() {
  return (
    <section
      id="performance"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-label="Performance and delivery"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          Performance
        </h2>
      </div>

      <p className="mb-6 text-sm leading-normal">
        I ran a performance pass over the LMS across 15 routes. Drag the slider
        to replay it — the scores are the audit, not a marketing round-up.
      </p>

      <PerformanceCase />

      <h3 className="mb-3 mt-10 text-lg font-semibold text-slate-200">
        Reading the numbers before touching the code
      </h3>
      <p className="mb-4 text-sm leading-normal">
        Field data first, so the work follows real users rather than a lab
        score. Thresholds are the Core Web Vitals targets:
      </p>

      <ul className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {FIELD_METRICS.map((metric) => (
          <li
            key={metric.name}
            className="rounded border border-slate-800 bg-slate-800/25 px-3 py-2.5"
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  metric.pass ? "bg-teal-300" : "bg-rose-400"
                }`}
                aria-hidden="true"
              />
              {metric.name}
            </p>
            <p
              className={`mt-1 text-lg font-bold tabular-nums ${
                metric.pass ? "text-teal-300" : "text-rose-400"
              }`}
            >
              {metric.value}
            </p>
            <p className="text-xs tabular-nums text-slate-600">
              {metric.good}
            </p>
          </li>
        ))}
      </ul>

      <p className="mb-6 text-sm leading-normal">
        Every loading metric is red and both interaction metrics are green. That
        combination is the whole diagnosis: the app is bound by{" "}
        <strong className="font-semibold text-slate-200">loading</strong>, not by
        interactivity or layout stability. So re-render and animation work —
        the usual reflex — went to the bottom of the queue, and server
        rendering, bundle size, CSS and images went to the top.
      </p>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Four causes underneath it
      </p>
      <ol className="mb-10 space-y-3 border-l border-slate-800 pl-4">
        {ROOT_CAUSES.map((item, index) => (
          <li key={item.cause} className="text-sm leading-normal">
            <span className="mr-1.5 font-mono text-xs text-slate-600">
              {index + 1}
            </span>
            <span className="font-medium text-slate-300">{item.cause}.</span>{" "}
            <span className="text-slate-400">{item.effect}</span>
          </li>
        ))}
      </ol>

      <h3 className="mb-3 text-lg font-semibold text-slate-200">
        The fix I measured, then deliberately did not ship
      </h3>
      <div className="rounded-lg border border-amber-300/20 bg-amber-300/4 p-5">
        <p className="text-sm leading-normal text-slate-300">
          Dropping <code className="text-teal-300">revalidate = 0</code> and
          wrapping the provider tree in{" "}
          <code className="text-teal-300">&lt;Suspense&gt;</code> let 20 routes
          static-generate. TTFB on the main routes fell from roughly 60ms to
          3ms locally, with a year-long{" "}
          <code className="text-teal-300">s-maxage</code> and a cache hit. The
          mechanism worked exactly as expected.
        </p>
        <p className="mt-3 text-sm leading-normal text-slate-400">
          It stayed in the working tree anyway. The static HTML is only a shell —{" "}
          <code className="text-slate-300">useSearchParams()</code> sits at the
          top of the provider tree, so the whole thing bails out to client-side
          rendering and the real content still arrives after hydrate. TTFB moves;
          LCP does not. On top of that, a shell cached at the CDN has to be
          provably free of user-specific data before it can go anywhere near
          production.
        </p>
        <p className="mt-3 text-sm leading-normal text-slate-400">
          It is a good change in the wrong order. It ships after the client
          boundary moves down to the leaves and the critical pages fetch on the
          server — otherwise it is a 15× win on a number no user feels.
        </p>
      </div>

      <h3 className="mb-3 mt-10 text-lg font-semibold text-slate-200">
        Keeping it fast, and shut
      </h3>
      <p className="mb-4 text-sm leading-normal">
        A one-off audit decays in a sprint, so performance is tracked per route
        per release rather than re-discovered. The same pipeline blocks leaked
        secrets, vulnerable dependencies and insecure patterns before review
        ever sees them.
      </p>

      <PipelineTerminal />

      <Link
        className="group relative mt-4 inline-flex items-baseline text-sm font-medium leading-tight text-slate-400 hover:text-teal-300 focus-visible:text-teal-300"
        href="/writing/so-tay-appsec-cho-frontend-gitleaks-trivy-semgrep"
      >
        <span>
          I wrote the whole setup up as an AppSec handbook
          <ArrowRightIcon />
        </span>
      </Link>
    </section>
  );
}
