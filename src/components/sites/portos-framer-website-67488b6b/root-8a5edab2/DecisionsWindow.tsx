"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Body of the "Highlights & Decisions" window — the chrome comes from
 * `WindowFrame`.
 *
 * A NEW window with no counterpart on the live site. The Notes dock icon used to
 * open About; it opens this instead, and About stays reachable from its own
 * desktop folder.
 *
 * Laid out as a two-pane browser on request: a grouped list on the left, the
 * selected entry on the right, the way a notes app arranges things. That suits
 * this content better than the accordion it replaces — fifteen entries across
 * three kinds is a lot to scroll past, and a list makes the whole set visible at
 * once while the pane carries one record at full length.
 *
 * The three groups mirror the CV's own sections — Highlights, Leadership, Key
 * Decisions — but the wording is the English version from the owner's portfolio
 * rather than a transcription of the PDF, whose text layer uses subset fonts
 * across nine per-font ToUnicode maps and does not decode cleanly. Every figure
 * was cross-checked against the portfolio source rather than read off an image.
 *
 * The decision log keeps the entry that did NOT ship. That is the point of
 * keeping one at all: a log with no rejections is a brag sheet, and "what did
 * you decide not to do" is the question this window exists to answer.
 */

type DecisionStatus = "Shipped" | "Held" | "Reverted";

interface Highlight {
  kind: "highlight";
  id: string;
  title: string;
  period: string;
  org: string;
  detail: string;
}

interface Practice {
  kind: "practice";
  id: string;
  title: string;
  body: string;
  /** What makes the practice checkable rather than aspirational. */
  mechanism: string;
}

interface Decision {
  kind: "decision";
  id: string;
  status: DecisionStatus;
  year: string;
  title: string;
  /** One line a non-engineer takes away without opening the entry. */
  upshot: string;
  context: string;
  options: readonly string[];
  /** Index into `options` of the one taken, so the choice is unambiguous. */
  chosen: number;
  decision: string;
  consequences: readonly string[];
}

type Entry = Highlight | Practice | Decision;

const HIGHLIGHTS: readonly Highlight[] = [
  {
    kind: "highlight",
    id: "h-load",
    title: "60% faster page load",
    period: "2025",
    org: "LMS · SAPP Academy",
    detail: "The learner route went from 15.2s to 6.1s, and Lighthouse from 29 to 65.",
  },
  {
    kind: "highlight",
    id: "h-audit",
    title: "15 routes audited",
    period: "2025",
    org: "LMS · SAPP Academy",
    detail: "Eight student routes moved 49 → 67 and seven teacher routes 72 → 89 on Lighthouse.",
  },
  {
    kind: "highlight",
    id: "h-mentor",
    title: "5 juniors mentored",
    period: "2023 — 2025",
    org: "SAPP Academy · Tweet World Travel",
    detail: "Two engineers at SAPP Academy and three at Tweet World Travel.",
  },
];

const PRACTICES: readonly Practice[] = [
  {
    kind: "practice",
    id: "p-pipeline",
    title: "Standards live in the pipeline, not in a document",
    body: "A rule everyone agrees with decays in a sprint; a rule the pipeline enforces does not. Coding standards, the security gate and the build config are defined once in the workspace and inherited by every app in it.",
    mechanism: "Shared GitLab CI config · Turborepo task graph",
  },
  {
    kind: "practice",
    id: "p-measure",
    title: "Measure before touching anything",
    body: "The LMS pass started with field data, not a lab score. Every loading metric was failing and both interaction metrics were passing, which put re-render and animation work — the usual reflex — at the bottom of the queue.",
    mechanism: "Field CWV first · per-route, per-release tracking",
  },
  {
    kind: "practice",
    id: "p-hygiene",
    title: "Automate the hygiene so review can be about design",
    body: "Leaked secrets, vulnerable dependencies and insecure patterns are caught before a human opens the branch. That buys back the review conversation for architecture, naming and edge cases.",
    mechanism: "Gitleaks · Trivy · Semgrep · ZAP on every merge request",
  },
  {
    kind: "practice",
    id: "p-no",
    title: "Say no in public, with the numbers attached",
    body: "The most useful thing I did to the LMS this year was not ship a change. Writing up why — with the measurements next to it — teaches the team more than another green graph, and stops the same idea coming back untested.",
    mechanism: "Decision records, kept with the evidence",
  },
  {
    kind: "practice",
    id: "p-write",
    title: "Write it down so it outlives me",
    body: "Two junior engineers should not have to ask me the same question twice, and the answer should survive my leaving. Setups I introduce get a handbook; architecture that took a week to reason about gets a write-up.",
    mechanism: "Internal handbooks · published architecture write-ups",
  },
  {
    kind: "practice",
    id: "p-leverage",
    title: "Give the team leverage, not answers",
    body: "The largest single productivity change was not a library choice. It was designing AI workflows around the work the team was already doing, then measuring what came back.",
    mechanism: "~30% productivity gain · ~10 hours/week returned",
  },
];

const DECISIONS: readonly Decision[] = [
  {
    kind: "decision",
    id: "d-monorepo",
    status: "Shipped",
    year: "2025",
    title: "One monorepo for four frontends, over a layer that can be enforced",
    upshot: "Four products stopped re-implementing the same interface four times.",
    context:
      "Three learning apps plus the operations back-office were drifting apart — the same components, editor and stylesheets rebuilt per app, and no single place to fix anything.",
    options: [
      "Separate repos with a published component package",
      "One monorepo with a task graph over a shared layer",
      "One application with per-customer feature flags",
    ],
    chosen: 1,
    decision:
      "A pnpm workspace with Turborepo running the task graph: apps over a shared libs layer (ui, editor, styles), with the CI gate defined once.",
    consequences: [
      "A new app inherits the shared layer and the whole security gate on day one instead of negotiating both later.",
      "Unchanged packages restore from cache, so the pipeline stays usable as apps are added.",
      "The shared layer becomes where code-splitting decisions have to be made, because it is where the heavy things live.",
    ],
  },
  {
    kind: "decision",
    id: "d-editor",
    status: "Shipped",
    year: "2025",
    title: "Rebuild the editor rather than renew a per-seat licence",
    upshot: "A cost that grew with student numbers became a one-off piece of engineering.",
    context:
      "The editor sits in front of every student and every teacher, and TinyMCE is licensed per seat — so the bill tracked enrolment, which is the one number nobody can forecast a year out.",
    options: [
      "Renew, and negotiate the seat count each year",
      "Restrict the editor to fewer roles to hold seats down",
      "Rebuild on an open-source core (Tiptap / ProseMirror)",
    ],
    chosen: 2,
    decision:
      "Rebuild on Tiptap, matched feature for feature against what the product was already paying for, shipped as a package across the monorepo.",
    consequences: [
      "A variable licence became fixed engineering cost, and the monthly spend came down with it.",
      "The monorepo no longer loads TinyMCE anywhere.",
      "We own editor bugs now. That is the price of the decision, and it was worth paying — but it is a real cost, not a free win.",
    ],
  },
  {
    kind: "decision",
    id: "d-modules",
    status: "Shipped",
    year: "2025",
    title: "Sell the platform by module, and strip what isn't bought at build time",
    upshot:
      "Each customer's build contains only the features they paid for, rather than all of them with some hidden.",
    context:
      "Customers buy different feature sets. Hiding a feature behind a runtime flag still ships its code to every one of them.",
    options: [
      "Runtime feature flags per customer",
      "A branch per customer",
      "A module registry plus a codegen step before the build",
    ],
    chosen: 2,
    decision:
      "A module registry plus a codegen step that strips unpurchased features before the build runs.",
    consequences: [
      "Per-customer white-label builds come out of one repository.",
      "The build gains a generation step, so the registry is now load-bearing — if it lies, a customer ships with the wrong feature set.",
    ],
  },
  {
    kind: "decision",
    id: "d-ttfb",
    status: "Held",
    year: "2025",
    title: "Prove out the server-response fix, then keep it out of production",
    upshot:
      "It made one server number look dramatically better without making the page feel faster to a single user, so it waits.",
    context:
      "A zero revalidate on the root layout forced a dynamic render on every request and switched off the route cache, so server response time could not come down however well the client behaved. It was the most obvious item in the audit.",
    options: [
      "Ship it — the mechanism demonstrably works",
      "Ship it behind a flag on a few low-risk routes",
      "Hold it until the client boundary moves down to the leaves",
    ],
    chosen: 2,
    decision: "Hold it. The change stayed in the working tree with the measurements beside it.",
    consequences: [
      "Twenty routes could static-generate, and server response on the main routes fell from roughly 60ms to 3ms locally.",
      "But a search-params hook sits at the top of the provider tree, so the whole thing bails out to client rendering and the real content still arrives after hydrate. The server number moves; what the user waits for does not.",
      "A good change in the wrong order. It ships after the client boundary moves down — otherwise it is a 15x win on a number no user feels.",
    ],
  },
];

const GROUPS: readonly { label: string; items: readonly Entry[] }[] = [
  { label: "Highlights", items: HIGHLIGHTS },
  { label: "Leadership", items: PRACTICES },
  { label: "Key Decisions", items: DECISIONS },
];

const ALL: readonly Entry[] = GROUPS.flatMap((g) => g.items);

/** The one line under each title in the list — a notes app's preview snippet. */
function previewOf(entry: Entry): string {
  switch (entry.kind) {
    case "highlight":
      return entry.detail;
    case "practice":
      return entry.body;
    case "decision":
      return entry.upshot;
  }
}

function metaOf(entry: Entry): string {
  switch (entry.kind) {
    case "highlight":
      return `${entry.period} · ${entry.org}`;
    case "practice":
      return entry.mechanism;
    case "decision":
      return `${entry.status} · ${entry.year}`;
  }
}

const GROUP_LABEL =
  "font-display px-3 pt-4 pb-1 text-[13px] leading-[18px] font-bold tracking-[-0.13px] text-black";
const ROW_TITLE = "font-display text-[12px] leading-[16px] font-medium tracking-[-0.12px]";
const ROW_META = "font-sans text-[11px] leading-[15px]";
const SECTION_LABEL =
  "font-sans text-[11px] leading-[15px] font-medium tracking-[0.14em] text-black/45";
const BODY_CLASS = "font-sans text-[12px] leading-[17.5px] text-black/70";
const CHIP_CLASS =
  "font-sans shrink-0 rounded-full border px-2 py-[2px] text-[11px] leading-[15px]";

/** Only the two non-shipped states earn a colour; shipped is the default. */
const STATUS_TONE: Record<DecisionStatus, string> = {
  Shipped: "border-black/10 text-black/55",
  Held: "border-[#b8860b]/30 text-[#8a6508]",
  Reverted: "border-[#b03a2e]/30 text-[#a03225]",
};

function Detail({ entry }: { entry: Entry }) {
  if (entry.kind === "highlight") {
    return (
      <article>
        <p className={SECTION_LABEL}>
          {entry.period} · {entry.org}
        </p>
        <h1 className="font-display mt-2 text-[24px] leading-[30px] font-bold tracking-[-0.48px] text-black">
          {entry.title}
        </h1>
        <p className={cn(BODY_CLASS, "mt-4")}>{entry.detail}</p>
      </article>
    );
  }

  if (entry.kind === "practice") {
    return (
      <article>
        <p className={SECTION_LABEL}>PRACTICE</p>
        <h1 className="font-display mt-2 text-[22px] leading-[29px] font-bold tracking-[-0.44px] text-black">
          {entry.title}
        </h1>
        <p className={cn(BODY_CLASS, "mt-4")}>{entry.body}</p>
        <p className={cn(SECTION_LABEL, "mt-6")}>MECHANISM</p>
        <p className={cn(BODY_CLASS, "mt-1")}>{entry.mechanism}</p>
      </article>
    );
  }

  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(CHIP_CLASS, STATUS_TONE[entry.status])}>{entry.status}</span>
        <span className={cn(ROW_META, "text-black/45")}>{entry.year}</span>
      </div>
      <h1 className="font-display mt-2 text-[22px] leading-[29px] font-bold tracking-[-0.44px] text-black">
        {entry.title}
      </h1>
      <p className={cn(BODY_CLASS, "mt-3")}>{entry.upshot}</p>

      <p className={cn(SECTION_LABEL, "mt-6")}>CONTEXT</p>
      <p className={cn(BODY_CLASS, "mt-1")}>{entry.context}</p>

      <p className={cn(SECTION_LABEL, "mt-5")}>OPTIONS</p>
      <ul className="mt-1 flex flex-col gap-1">
        {entry.options.map((option, i) => (
          <li
            key={option}
            className={cn(
              BODY_CLASS,
              "flex gap-2",
              // The taken option is marked rather than merely listed, so the
              // choice cannot be misread.
              i === entry.chosen && "font-medium text-black",
            )}
          >
            <span aria-hidden="true" className="shrink-0">
              {i === entry.chosen ? "→" : "·"}
            </span>
            {option}
            {i === entry.chosen ? <span className="sr-only"> (chosen)</span> : null}
          </li>
        ))}
      </ul>

      <p className={cn(SECTION_LABEL, "mt-5")}>DECISION</p>
      <p className={cn(BODY_CLASS, "mt-1")}>{entry.decision}</p>

      <p className={cn(SECTION_LABEL, "mt-5")}>CONSEQUENCES</p>
      <ul className="mt-1 flex list-disc flex-col gap-1 pl-[18px]">
        {entry.consequences.map((c) => (
          <li key={c} className={BODY_CLASS}>
            {c}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function DecisionsWindow() {
  const [selectedId, setSelectedId] = useState(ALL[0].id);
  const selected = ALL.find((e) => e.id === selectedId) ?? ALL[0];

  return (
    // `calc(100% - 44px)`: WindowFrame keeps its 44px title bar INSIDE the scroll
    // container as a sticky first child rather than overlaying it, so `h-full`
    // here would be a full window tall underneath a bar already taking 44 — and
    // the window would scroll by exactly that much. Subtracting it lets the two
    // panes own their own scrolling instead.
    <div data-no-drag className="flex h-[calc(100%-44px)] w-full">
      {/* List. Below 700px the detail pane would have nothing left, so the list
          takes the whole window and the pane is hidden — the same fallback a
          notes app makes on a phone. */}
      <nav
        aria-label="Highlights, leadership and decisions"
        className="portos-scroll w-full shrink-0 border-black/10 min-[700px]:w-[250px] min-[700px]:border-r"
      >
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className={GROUP_LABEL}>{group.label}</p>
            {group.items.map((item) => {
              const active = item.id === selected.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "mx-2 flex w-[calc(100%-16px)] cursor-pointer flex-col items-start gap-[3px] rounded-[6px] px-2 py-2 text-left transition-colors",
                    active ? "bg-black/[0.07]" : "hover:bg-black/[0.035]",
                  )}
                >
                  <span className={cn(ROW_TITLE, "line-clamp-2 text-black")}>{item.title}</span>
                  <span className={cn(ROW_META, "line-clamp-1 text-black/45")}>
                    {metaOf(item)}
                  </span>
                  <span className={cn(ROW_META, "line-clamp-2 text-black/55")}>
                    {previewOf(item)}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="h-4" />
      </nav>

      {/* Detail pane — `min-w-0` so a long unbroken string cannot widen the flex
          item past its share and push the list off. */}
      <section className="portos-scroll hidden min-w-0 flex-1 px-6 py-6 min-[700px]:block">
        <Detail entry={selected} />
      </section>
    </div>
  );
}
