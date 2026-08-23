"use client";

import { useEffect, useState } from "react";

interface Step {
  command: string;
  result: string;
}

/**
 * A replay of the CI pipeline I set up at SAPP — not a live scan of this page.
 * Keep the results qualitative ("no secrets committed") rather than inventing
 * counts, so nothing here can be contradicted in an interview.
 */
const STEPS: Step[] = [
  {
    command: "pnpm turbo run lint typecheck build",
    result: "workspace green — unchanged packages restored from cache",
  },
  {
    command: "gitleaks detect --redact",
    result: "no secrets committed",
  },
  {
    command: "trivy fs --severity HIGH,CRITICAL .",
    result: "no high or critical CVEs in the dependency tree",
  },
  {
    command: "semgrep --config p/react --config p/typescript",
    result: "no insecure patterns flagged",
  },
  {
    command: "zap-baseline.py -t $STAGING_URL",
    result: "no medium-or-above alerts on staging",
  },
];

const STEP_DELAY_MS = 380;

export function PipelineTerminal() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const skip = setTimeout(() => setRevealed(STEPS.length), 0);
      return () => clearTimeout(skip);
    }

    // Counted outside the updater so the interval can stop itself without a
    // side effect inside setState.
    let shown = 0;
    const timer = setInterval(() => {
      shown += 1;
      setRevealed(shown);
      if (shown >= STEPS.length) clearInterval(timer);
    }, STEP_DELAY_MS);

    return () => clearInterval(timer);
  }, []);

  const done = revealed >= STEPS.length;

  return (
    <figure className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60">
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/60 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        </span>
        <p className="ml-1 font-mono text-xs text-slate-500">
          ci · merge-request pipeline
        </p>
        <span
          className={`ml-auto rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-opacity duration-500 motion-reduce:transition-none ${
            done
              ? "border-teal-300/40 bg-teal-300/10 text-teal-300 opacity-100"
              : "border-slate-700 text-slate-600 opacity-0"
          }`}
        >
          passed
        </span>
      </div>

      <ol className="space-y-2.5 p-4 font-mono text-xs leading-relaxed">
        {STEPS.map((step, index) => (
          <li
            key={step.command}
            className={`transition-all duration-300 motion-reduce:transition-none ${
              index < revealed
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0"
            }`}
          >
            <p className="break-all text-slate-400">
              <span className="mr-1.5 select-none text-teal-300">$</span>
              {step.command}
            </p>
            <p className="mt-0.5 pl-4 text-slate-500">
              <span className="mr-1.5 text-teal-300" aria-hidden="true">
                ✓
              </span>
              {step.result}
            </p>
          </li>
        ))}
      </ol>

      <figcaption className="border-t border-slate-800 px-4 py-3 text-xs leading-relaxed text-slate-600">
        A replay of the security pipeline I wired into GitLab CI at SAPP —
        Gitleaks, Trivy, Semgrep and ZAP gate every merge request. Not a live
        scan of this page.
      </figcaption>
    </figure>
  );
}
