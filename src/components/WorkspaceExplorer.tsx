"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ArrowUpRightIcon } from "@/components/icons";

/** Top-level workspace folders, in the order the tree renders them. */
const DIRS = ["apps", "libs", "tooling"] as const;

type Dir = (typeof DIRS)[number];

interface WorkspaceNode {
  /** Folder name as it appears in the tree. */
  name: string;
  dir: Dir;
  title: string;
  period: string;
  summary: string;
  /**
   * The talking points a reviewer reads first — keep every line true. Two per
   * node, so there is nothing here I cannot defend in an interview.
   */
  notes: string[];
  tags: string[];
  image?: string;
  imageAlt?: string;
  href?: string;
  /** Internal routes render on this site; external URLs open in a new tab. */
  internal?: boolean;
}

const LMS_WRITEUP =
  "/writing/ben-trong-sapp-lms-hai-frontend-mot-he-van-hanh-dao-tao";
const MODULE_WRITEUP =
  "/writing/ban-lms-theo-module-kien-truc-plugin-trong-monorepo-next-js";

const NODES: WorkspaceNode[] = [
  {
    name: "lms-pro",
    dir: "apps",
    title: "LMS Platform · SAPP Academy",
    period: "2025 — Present",
    summary:
      "The learner-facing side of a large-scale learning-management system, on Next.js 14 with the App Router — one of three apps the lms-fe monorepo builds, alongside lms-test and lms-finhub. I own the frontend technical direction: architecture, coding standards, code review, and two junior engineers.",
    notes: [
      "The router migration was the easy half — around 270 files still carry a use-client directive, so moving the render boundary down to the leaves is the largest structural item left.",
      "Feature modules ship per customer: a module registry plus a codegen step that strips unpurchased features before the build.",
    ],
    tags: [
      "Next.js 14",
      "App Router",
      "Turborepo",
      "React Query",
      "Ant Design",
      "Tailwind CSS",
    ],
    image: "/images/projects/lms-platform.png",
    imageAlt: "SAPP Academy learning-management system dashboard",
    href: MODULE_WRITEUP,
    internal: true,
  },
  {
    name: "ops-fe",
    dir: "apps",
    title: "Ops · SAPP Academy",
    period: "2025 — Present",
    summary:
      "The back-office running the academy behind the LMS: sixteen operations modules covering classes, question bank, grading, scheduling and attendance.",
    notes: [
      "The attendance system spans repositories, so reconciliation — not the screens — is where the actual work sits.",
      "Operational software, not commercial: a coordinator mis-reading a class roster has consequences a marketing page never does.",
    ],
    tags: [
      "React",
      "TypeScript",
      "Vite",
      "TanStack Query",
      "Ant Design",
      "Monorepo",
    ],
    image: "/images/projects/ops-portal.png",
    imageAlt: "SAPP Academy operations portal showing the class list screen",
    href: LMS_WRITEUP,
    internal: true,
  },
  {
    name: "subscriber-erp",
    dir: "apps",
    title: "Subscriber Platform · Tweet World Travel",
    period: "2023 — 2025",
    summary:
      "Travel-business management platform serving roughly 1,000 users a month, on Spring Boot microservices behind a React + Material UI frontend.",
    notes: [
      "I worked both sides of the wire — the Spring Boot services and the React client — which is where the multilingual ERP data model got settled.",
      "Mentored three junior engineers and ran the code reviews that held production quality steady.",
    ],
    tags: ["Spring Boot", "Microservices", "React", "Material UI"],
    image: "/images/projects/subscriber-platform.png",
    imageAlt: "Tweet World Travel subscriber management platform interface",
    href: "https://tweetworldtravel.tkgplatform.com.au/",
  },
  {
    name: "storefront",
    dir: "apps",
    title: "Website B2B & B2C · Tweet World Travel",
    period: "2023 — 2024",
    summary:
      "Multi-language e-commerce platform covering both the agent-facing and consumer-facing side, with authentication, global state and payment integration.",
    notes: [
      "Cut page load from 3.2s to 1.1s and held mobile Lighthouse above 85 — the dry run for the LMS pass two years later.",
      "Small enough to own end to end, which is where I learned to measure before touching anything.",
    ],
    tags: ["Next.js 14", "Zustand", "TypeScript", "Tailwind CSS", "Shadcn/ui"],
    image: "/images/projects/website-b2b.png",
    imageAlt: "Tweet World Travel B2B and B2C e-commerce website homepage",
    href: "https://tweetworldtravel.com",
  },
  {
    name: "newsletter-studio",
    dir: "apps",
    title: "Newsletter System · Tweet World Travel",
    period: "2023 — 2024",
    summary:
      "Drag-and-drop email builder and subscriber-management system for the marketing team.",
    notes: [
      "GrapeJS gave marketing a canvas they could use without a developer in the loop.",
      "Template output has to survive email clients, which rules out most of what a normal web renderer allows.",
    ],
    tags: ["React.js", "GrapeJS", "Laravel API"],
    image: "/images/projects/newsletter.png",
    imageAlt: "Drag-and-drop email newsletter builder interface",
  },
  {
    name: "evn-power",
    dir: "apps",
    title: "EVN Hanoi Power Company · 3S Intersoft",
    period: "2022 — 2023",
    summary:
      "UI/UX for power-management system modules, onsite with 3S Intersoft: API integration and source-code optimization in an Agile/Scrum team.",
    notes: [
      "Dense operational data grids on a .NET Core API — where the Ant Design habits came from.",
      "First codebase I worked in that someone else had to maintain after me, which changed how I write.",
    ],
    tags: [".NET Core API", "React.js", "Redux Toolkit", "Ant Design"],
    image: "/images/projects/evn.png",
    imageAlt: "EVN Hanoi power-management system module interface",
    href: "https://3si.vn/en/",
  },
  {
    name: "portfolio",
    dir: "apps",
    title: "This site",
    period: "2026",
    summary:
      "Next.js 16 App Router on Vercel. The Writing section reads from a Notion database and revalidates hourly, so publishing a post never needs a redeploy.",
    notes: [
      "No animation library — the interactive pieces run on CSS transitions and requestAnimationFrame, because a page that argues about bundle size should not ship 40KB to move a bar.",
      "Notion API to Markdown to react-markdown, with a hardcoded fallback so the build never breaks when the integration is unconfigured.",
    ],
    tags: ["Next.js 16", "React 19", "Tailwind CSS v4", "Notion API", "ISR"],
  },
  {
    name: "ui",
    dir: "libs",
    title: "Shared component layer",
    period: "2025 — Present",
    summary:
      "Where the heavy things live: rich-text editor, document viewer, spreadsheet, charts, video. Each of them is a code-splitting decision before it is a component decision.",
    notes: [
      "Video and audio pull dashjs on demand and the Word preview pulls docx-preview on demand — the pattern the rest of the library is being moved onto.",
      "The spreadsheet stays a static import on the essay-answer form on purpose; the lazy wrapper was removed rather than kept for tidiness.",
    ],
    tags: ["React", "Ant Design", "next/dynamic", "Code splitting"],
  },
  {
    name: "editor",
    dir: "libs",
    title: "Tiptap editor package",
    period: "2025",
    summary:
      "A rich-text editor rebuilt on Tiptap and customized up to the feature set the product had been paying TinyMCE for. It ships across the lms-fe monorepo, which no longer loads TinyMCE anywhere.",
    notes: [
      "TinyMCE is licensed per seat, and the editor sits in front of every student and every teacher — so the bill tracks enrolment, which is the one number nobody can forecast a year out. An unforecastable seat count is an unbudgetable line item.",
      "So the job was matching TinyMCE feature for feature on Tiptap, not picking a nicer library. It turned a variable licence into fixed engineering cost and took the monthly spend down with it.",
    ],
    tags: ["Tiptap", "ProseMirror", "TypeScript", "React"],
  },
  {
    name: "styles",
    dir: "libs",
    title: "Global stylesheet",
    period: "2025 — Present",
    summary:
      "One 31KB global stylesheet plus a pile of vendor CSS that the root layout imported on behalf of every route — all of it render-blocking.",
    notes: [
      "Thirteen global stylesheet imports in the root layout, down to three.",
      "The rest now load inside the lazy component that owns them, verified pixel-identical rather than assumed safe.",
    ],
    tags: ["SCSS", "CSS Modules", "Tailwind CSS", "Critical CSS"],
  },
  {
    name: "ci-security",
    dir: "tooling",
    title: "Security pipeline config",
    period: "2025 — Present",
    summary:
      "The Gitleaks, Trivy, Semgrep and ZAP configuration that gates every merge request in GitLab CI.",
    notes: [
      "Shared rules mean a new app inherits the whole gate on day one instead of negotiating it later.",
      "Frontend engineers rarely get AppSec training, so the pipeline carries the knowledge the team does not have yet.",
    ],
    tags: ["Gitleaks", "Trivy", "Semgrep", "OWASP ZAP", "GitLab CI"],
  },
];

/** Tree order, so arrow keys walk the list the way it looks on screen. */
const ORDER = DIRS.flatMap((dir) =>
  NODES.filter((node) => node.dir === dir).map((node) => node.name),
);

const pathOf = (node: WorkspaceNode) => `${node.dir}/${node.name}`;

export function WorkspaceExplorer() {
  const [selected, setSelected] = useState(ORDER[0]);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /**
   * A selection that no longer matches a node would hide every panel and leave
   * no tab selected, so fall back to the first one instead of rendering blank.
   */
  const activeName = ORDER.includes(selected) ? selected : ORDER[0];

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const current = ORDER.indexOf(activeName);
      let next: number;

      switch (event.key) {
        case "ArrowDown":
          next = Math.min(current + 1, ORDER.length - 1);
          break;
        case "ArrowUp":
          next = Math.max(current - 1, 0);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = ORDER.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      setSelected(ORDER[next]);
      tabRefs.current[ORDER[next]]?.focus();
    },
    [activeName],
  );

  return (
    <div className="grid gap-6 md:grid-cols-[10.5rem_minmax(0,1fr)] md:gap-8">
      <div
        role="tablist"
        aria-label="Workspace"
        aria-orientation="vertical"
        onKeyDown={handleKeyDown}
        className="h-max rounded-lg border border-slate-800 bg-slate-950/40 p-2 font-mono text-xs"
      >
        {DIRS.map((dir) => (
          <div key={dir} className="mb-1 last:mb-0">
            <p
              className="select-none px-2 py-1.5 text-slate-500"
              aria-hidden="true"
            >
              <span className="mr-1 text-slate-600">▾</span>
              {dir}/
            </p>
            {NODES.filter((node) => node.dir === dir).map((node) => {
              const isActive = node.name === activeName;
              return (
                <button
                  key={node.name}
                  ref={(element) => {
                    tabRefs.current[node.name] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`ws-tab-${node.name}`}
                  aria-selected={isActive}
                  aria-controls={`ws-panel-${node.name}`}
                  aria-label={`${pathOf(node)} — ${node.title}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setSelected(node.name)}
                  className={`block w-full truncate rounded px-2 py-1.5 pl-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-300 motion-reduce:transition-none ${
                    isActive
                      ? "bg-teal-400/10 text-teal-300"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  {node.name}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/*
        Every panel stays in the DOM so the copy is crawlable and Ctrl-F works;
        only the visible one mounts an <Image>, so switching tabs costs one
        request instead of ten on first paint.
      */}
      <div className="md:min-h-[30rem]">
        {NODES.map((node) => {
          const isActive = node.name === activeName;
          return (
            <div
              key={node.name}
              role="tabpanel"
              id={`ws-panel-${node.name}`}
              aria-labelledby={`ws-tab-${node.name}`}
              hidden={!isActive}
              tabIndex={0}
            >
              <p className="font-mono text-xs text-slate-500">{pathOf(node)}</p>

              <h3 className="mt-2 font-medium leading-snug text-slate-200">
                {node.href ? (
                  node.internal ? (
                    <Link
                      className="group/link inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300"
                      href={node.href}
                      aria-label={node.title}
                    >
                      <span>
                        {node.title}
                        <ArrowUpRightIcon />
                      </span>
                    </Link>
                  ) : (
                    <a
                      className="group/link inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300"
                      href={node.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${node.title} (opens in a new tab)`}
                    >
                      <span>
                        {node.title}
                        <ArrowUpRightIcon />
                      </span>
                    </a>
                  )
                ) : (
                  <span>{node.title}</span>
                )}
              </h3>

              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {node.period}
              </p>

              {isActive && node.image && (
                <Image
                  src={node.image}
                  alt={node.imageAlt ?? ""}
                  width={1912}
                  height={912}
                  sizes="(min-width: 768px) 420px, 100vw"
                  className="mt-4 h-auto w-full rounded border-2 border-slate-200/10"
                  loading="lazy"
                  decoding="async"
                />
              )}

              <p className="mt-4 text-sm leading-normal">{node.summary}</p>

              <ul className="mt-3 space-y-2 border-l border-slate-800 pl-4">
                {node.notes.map((note) => (
                  <li
                    key={note}
                    className="text-sm leading-normal text-slate-400"
                  >
                    {note}
                  </li>
                ))}
              </ul>

              <ul
                className="mt-3 flex flex-wrap"
                aria-label="Technologies used"
              >
                {node.tags.map((tag) => (
                  <li key={tag} className="mr-1.5 mt-2">
                    <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                      {tag}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
