"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { PORTOS_ASSETS } from "@/types/portos";

/**
 * The two layouts the title-bar switch flips between.
 *
 * The live site's switch reads "Masonry / Grid" and toggles twelve 194px cards
 * between their own crop heights and a flat 161px. Those cards held stock
 * photography, where a tall ragged crop is the point. These hold UI screenshots
 * at 1913x912, which a 194px portrait crop would destroy — so the switch now
 * picks a column count instead. Requested change; see ARTIFACT_MANIFEST.md.
 */
export type ProjectsMode = "grid" | "list";

interface Project {
  /** Rendered above the title, in the same style as the About timeline dates. */
  period: string;
  title: string;
  description: string;
  /** The stack, in the order the portfolio lists it. */
  tags: readonly string[];
  /** Filename under the page's `images/` namespace. */
  image: string;
  /** Screenshot alt text, carried over from the portfolio verbatim. */
  alt: string;
  /**
   * Absent for work with nothing public to point at. Internal platforms link to
   * the write-up instead of a login screen — the portfolio's own convention.
   */
  href?: string;
}

const PORTFOLIO = "https://lengocha.vercel.app";

/**
 * Six projects, newest first — content, wording and screenshots all taken from
 * Lê Ngọc Hà's own portfolio at lengocha.vercel.app rather than invented.
 *
 * Note for whoever updates this: the portfolio's own copy says "Seven products
 * across four employers" but renders six cards, and neither Minastik JSC nor FPT
 * Software has a project card despite both appearing in the career timeline. Six
 * is what actually exists; the seventh is unaccounted for.
 */
const PROJECTS: readonly Project[] = [
  {
    period: "2025 — Present",
    title: "LMS Platform · SAPP Academy",
    description:
      "The learner-facing side of a large-scale learning platform on Next.js 14 App Router — one of four frontends the lms-fe monorepo builds. I own the frontend technical direction, and took the worst route from 15.2s to 6.1s.",
    tags: ["Next.js 14", "App Router", "Turborepo", "TanStack Query"],
    image: "project-lms-platform.png",
    alt: "SAPP Academy learning-management system dashboard",
    href: `${PORTFOLIO}/writing/ban-lms-theo-module-kien-truc-plugin-trong-monorepo-next-js`,
  },
  {
    period: "2025 — Present",
    title: "Operations back-office · SAPP",
    description:
      "Sixteen operations modules running the academy behind the LMS: classes, question bank, grading, scheduling and attendance. The attendance system spans repositories, so reconciliation is where the real work sits.",
    tags: ["React", "TypeScript", "Vite", "Ant Design"],
    image: "project-ops-portal.png",
    alt: "SAPP Academy operations portal showing the class list screen",
    href: `${PORTFOLIO}/writing/ben-trong-sapp-lms-hai-frontend-mot-he-van-hanh-dao-tao`,
  },
  {
    period: "2023 — 2025",
    title: "Subscriber Platform · Tweet World",
    description:
      "Travel-business management platform serving roughly 1,000 users a month, on Spring Boot microservices behind a React frontend. I worked both sides of the wire, which is where the multilingual ERP data model got settled.",
    tags: ["Spring Boot", "Microservices", "React", "Material UI"],
    image: "project-subscriber-platform.png",
    alt: "Tweet World Travel subscriber management platform interface",
    href: "https://tweetworldtravel.tkgplatform.com.au/",
  },
  {
    period: "2023 — 2024",
    title: "B2B storefront · Tweet World",
    description:
      "Multi-language travel commerce for the agent side, with authentication, global state and payments. Cut page load from 3.2s to 1.1s and held mobile Lighthouse at 85 — the dry run for the LMS pass.",
    tags: ["Next.js 14", "Zustand", "TypeScript", "Tailwind CSS"],
    image: "project-b2b-storefront.png",
    alt: "Tweet World Travel B2B e-commerce website homepage",
    href: "https://tweetworldtravel.com",
  },
  {
    period: "2023 — 2024",
    title: "Newsletter builder · Tweet World",
    description:
      "A drag-and-drop email builder and subscriber system that gave marketing a canvas they could use without a developer in the loop. Template output has to survive email clients, which rules out most of what a browser allows.",
    tags: ["React.js", "GrapeJS", "Laravel API"],
    image: "project-newsletter.png",
    alt: "Drag-and-drop email newsletter builder interface",
    // No public URL and no write-up — the one card that stays inert.
  },
  {
    period: "2022 — 2023",
    title: "EVN Hanoi Power Company",
    description:
      "UI/UX for power-management modules, onsite with 3S Intersoft — dense operational data grids on a .NET Core API. The first codebase I worked in that someone else had to maintain after me, which changed how I write.",
    tags: [".NET Core API", "React.js", "Redux Toolkit", "Ant Design"],
    image: "project-evn.png",
    alt: "EVN Hanoi power-management system module interface",
    href: "https://3si.vn/en/",
  },
];

/**
 * Every screenshot is ~1913x912. One uniform ratio keeps the six cards the same
 * height; the widest and narrowest source differ by 2%, which `object-cover`
 * absorbs without visibly cropping any UI.
 */
const SHOT_ASPECT = "aspect-[2.1]";

/** Knob travel and the label cross-fade share one duration. */
const TOGGLE_TRANSITION = "duration-[250ms] ease-[ease]";

interface ProjectsToggleProps {
  mode: ProjectsMode;
  onChange: (mode: ProjectsMode) => void;
}

/**
 * The switch that lives in the Projects window title bar, passed to
 * `WindowFrame` as `titleBarAccessory`.
 *
 * Only the 33x17 outline pill is clickable — on the live site the two labels
 * inherit `cursor: grab` from the draggable window and do nothing. The knob is
 * moved by swapping the track's own padding (4/20 to 20/4), exactly as Framer
 * does it, so the transition runs on `padding`. All of that is kept; only the
 * labels and what they switch have changed.
 */
export function ProjectsToggle({ mode, onChange }: ProjectsToggleProps) {
  const isList = mode === "list";

  return (
    <div className="flex h-[17px] items-center justify-center gap-1">
      <span
        className={cn(
          "font-sans text-[12px] leading-[16.8px] font-normal tracking-normal transition-colors",
          TOGGLE_TRANSITION,
          isList ? "text-black/20" : "text-black",
        )}
      >
        Grid
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isList}
        aria-label="Switch between the two-column and single-column project layouts"
        data-no-drag
        onClick={() => onChange(isList ? "grid" : "list")}
        className={cn(
          "flex h-[17px] w-[33px] cursor-pointer items-center rounded-[46px] border-[0.57px] border-black bg-transparent py-1 transition-[padding]",
          TOGGLE_TRANSITION,
          isList ? "pr-1 pl-5" : "pr-5 pl-1",
        )}
      >
        {/* Black Dot */}
        <span className="size-[9px] shrink-0 rounded-full bg-black" />
      </button>
      <span
        className={cn(
          "font-sans text-[12px] leading-[16.8px] font-normal tracking-normal transition-colors",
          TOGGLE_TRANSITION,
          isList ? "text-black" : "text-black/20",
        )}
      >
        List
      </span>
    </div>
  );
}

function ProjectCardBody({ project, isList }: { project: Project; isList: boolean }) {
  return (
    <>
      {/* `min-h-0` is load-bearing. This box is a flex item, so it carries
          `min-height: auto`, which resolves to the image's intrinsic height —
          and for any screenshot flatter than SHOT_ASPECT that minimum is TALLER
          than the ratio asks for, so it silently wins and the card grows. Two of
          the six are flatter (Newsletter 2.061, EVN 2.093), which is exactly how
          this showed up: four cards at 192.53px and two at 196.31 / 193.16. */}
      <div className={cn("w-full min-h-0 overflow-clip", SHOT_ASPECT)}>
        <Image
          src={`${PORTOS_ASSETS}/images/${project.image}`}
          alt={project.alt}
          width={1913}
          height={912}
          sizes={isList ? "(min-width: 880px) 824px, 100vw" : "(min-width: 880px) 404px, 100vw"}
          className="h-full w-full rounded-none object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
      </div>

      <p className="font-sans mt-3 text-[11px] leading-[15px] font-medium tracking-[0.14em] text-black/45">
        {project.period}
      </p>

      <p className="font-display mt-[6px] flex items-center gap-1 text-[15px] leading-[21px] font-medium tracking-[-0.3px] text-black">
        {project.title}
        {project.href ? (
          // Only ever an affordance — the whole card is the link.
          <span
            aria-hidden="true"
            className="translate-y-[-1px] text-[13px] text-black/35 transition-colors group-hover:text-black"
          >
            ↗
          </span>
        ) : null}
      </p>

      <p className="font-sans mt-2 text-[12px] leading-[16.8px] font-normal tracking-normal text-black/70">
        {project.description}
      </p>

      <ul className="mt-3 flex flex-wrap gap-[6px]">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="font-sans rounded-full border border-black/10 px-2 py-[2px] text-[11px] leading-[15px] text-black/55"
          >
            {tag}
          </li>
        ))}
      </ul>
    </>
  );
}

interface ProjectsWindowProps {
  mode: ProjectsMode;
}

/**
 * Body of the "Overview of the Project" window — the chrome comes from
 * `WindowFrame`, which renders `children` flush against the 44px title bar, so
 * the 50px gap down to the container is supplied here.
 *
 * REDESIGNED ON REQUEST; this no longer matches the live site. The original is
 * twelve 194px cards of stock photography with a Masonry/Grid switch and no
 * interaction of any kind. This is six real projects at 404px (two-up) or 824px
 * (single), each linking out where there is something public to point at.
 *
 * `data-no-drag` on every card is not optional: the window is draggable, and
 * without it a click that moves a pixel becomes a drag and the link never fires.
 *
 * Below 880px both modes collapse to one column. The live site clips instead of
 * reflowing, so that step is an adaptation rather than a measurement.
 */
export function ProjectsWindow({ mode }: ProjectsWindowProps) {
  const isList = mode === "list";

  return (
    <div className="pt-[50px]">
      {/* Container */}
      <div className="mx-auto flex w-full max-w-[1152px] items-center justify-center px-5 pb-[60px]">
        {/* Content */}
        <div className="flex w-full flex-col items-center justify-center gap-16">
          <div
            className={cn(
              "grid w-full items-start gap-x-4 gap-y-10",
              isList
                ? "grid-cols-1 min-[880px]:max-w-[824px]"
                : "grid-cols-1 min-[880px]:grid-cols-2 min-[880px]:max-w-[824px]",
            )}
          >
            {PROJECTS.map((project) => {
              const shared =
                "group flex w-full flex-col items-start text-left transition-opacity duration-200";

              return project.href ? (
                <a
                  key={project.image}
                  href={project.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-no-drag
                  className={cn(shared, "cursor-pointer hover:opacity-95")}
                >
                  <ProjectCardBody project={project} isList={isList} />
                </a>
              ) : (
                <div key={project.image} data-no-drag className={shared}>
                  <ProjectCardBody project={project} isList={isList} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
