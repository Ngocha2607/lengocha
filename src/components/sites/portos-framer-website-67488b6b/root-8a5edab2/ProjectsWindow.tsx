"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import Image from "next/image";
import { EN_PROJECTS } from "@/i18n/en";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/locale";
import type { ProjectId } from "@/i18n/types";
import { outboundLinkProps } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { PORTOS_ASSETS } from "@/types/portos";
import { WindowLink } from "./WindowLink";

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

export interface Project {
  /** Keys the English period and description in src/i18n/en.ts. */
  id: ProjectId;
  /** Rendered above the title, in the same style as the About timeline dates. */
  period: string;
  title: string;
  description: string;
  /** The stack, in the order the portfolio lists it. */
  tags: readonly string[];
  /** Filename under the page's `images/` namespace. */
  image: string;
  src?: string;
  /** Screenshot alt text, carried over from the portfolio verbatim. */
  alt: string;
  /**
   * Absent for work with nothing public to point at. Internal platforms link to
   * the write-up instead of a login screen — the portfolio's own convention.
   */
  href?: string;
  /**
   * Set instead of `href` when the write-up lives in this site's own Writing
   * window. The card links to `/writing/<slug>` — a real route now — and a
   * plain click opens the article in the Writing window instead of navigating.
   */
  writingSlug?: string;
}

/**
 * Six projects, newest first; screenshots are from the portfolio. Descriptions
 * and tags started as a VERBATIM copy (Vietnamese) of the CV's SELECTED
 * PROJECTS, on request, and the two have since moved apart. The CV, now built
 * from `cv/content.vi.json`, adds the Payoo POS and AWS -> CMC Cloud projects
 * and drops Newsletter System for space; the B2B card here carries the
 * ~1.000 users/tháng figure, which the CV states in the Tweet World Travel
 * role instead. EVN has never been on the CV: its wording is our own
 * translation of the entry it used to hold.
 *
 * Period and description are the only prose; their English is `EN_PROJECTS`
 * in src/i18n/en.ts, keyed by `id`. Use `projectsFor(locale)`.
 */
// Exported for `projectsFor`, which Spotlight uses to search the same six cards.
export const PROJECTS: readonly Project[] = [
  {
    id: "lms",
    period: "2025 — Hiện tại",
    title: "LMS Platform · SAPP Academy",
    description:
      "Hệ thống quản lý học tập trực tuyến; dẫn dắt kỹ thuật Frontend.",
    tags: [
      "Next.js 14",
      "Monorepo",
      "Antd",
      "Tailwind CSS",
      "Redux Toolkit",
      "React Hook Form",
    ],
    image: "lms-gif.gif",
    alt: "SAPP Academy learning-management system dashboard",
    // The learner-side deep dive. The combined "hai frontend" article still
    // exists in the Writing window; this card now opens the LMS-only piece.
    writingSlug: "sapp-lms-nen-tang-hoc-va-luyen-thi-acca-cfa-cma",
  },
  {
    id: "ops",
    period: "2025 — Hiện tại",
    title: "Operations · SAPP Academy",
    description: "18 module vận hành: lớp học, chấm điểm, điểm danh.",
    tags: ["React", "TypeScript", "Vite", "Ant Design"],
    // Pan-through of six Ops screens exported from the team's Figma, at
    // exactly 2.1 so SHOT_ASPECT crops nothing. Gallery still uses the .png.
    image: "",
    src: "https://qgat4v5hrepgvc3n.public.blob.vercel-storage.com/writings/project-ops-portal.gif",
    alt: "SAPP Academy operations portal showing the class list screen",
    // The back-office deep dive, the OPS counterpart of the LMS card's piece.
    writingSlug: "sapp-ops-he-van-hanh-dao-tao-voi-18-module-nghiep-vu",
  },
  {
    id: "subscriber",
    period: "2023 — 2025",
    title: "Subscriber Platform · Tweet World Travel",
    description: "Nền tảng quản trị doanh nghiệp du lịch",
    tags: ["Spring Boot", "Microservices", "React", "Material UI"],
    // Pan-through of seven TKG screens from the team's docs, browser chrome
    // cropped and customer/money fields blurred on request; exactly 2.1 so
    // SHOT_ASPECT crops nothing. Gallery still uses the .png.
    image: "",
    src: "https://qgat4v5hrepgvc3n.public.blob.vercel-storage.com/writings/project-subscriber-platform.gif",
    alt: "Tweet World Travel subscriber management platform interface",
    // Used to link to tweetworldtravel.tkgplatform.com.au — a login screen.
    // Per the convention above, internal platforms open the write-up instead.
    writingSlug: "tkg-platform-nen-tang-quan-tri-hang-tour-ban-si",
  },
  {
    id: "b2b",
    period: "2023 — 2024",
    title: "Website B2B · Tweet World Travel",
    description:
      "Nền tảng TMĐT du lịch đa ngôn ngữ phục vụ ~1.000 users/tháng; page load 3.2s → 1.1s, Lighthouse 85.",
    tags: ["Next.js 14", "Zustand", "TypeScript", "Tailwind", "Shadcn"],
    // Animated scroll-through of the live site, captured at exactly 2.1 so
    // SHOT_ASPECT crops nothing. The Gallery still uses the static .png.
    image: "",
    src: "https://qgat4v5hrepgvc3n.public.blob.vercel-storage.com/writings/project-b2b-storefront.gif",
    alt: "Tweet World Travel B2B e-commerce website homepage",
    // Used to link straight to tweetworldtravel.com; the card now opens the
    // write-up, which links out to the live site in context.
    writingSlug: "website-b2b-website-ban-tour-da-ngon-ngu-tren-next-js",
  },
  {
    id: "newsletter",
    period: "2023 — 2024",
    title: "Newsletter System · Tweet World Travel",
    description: "Công cụ kéo-thả tạo email và hệ thống quản lý người đăng ký.",
    tags: ["React.js", "GrapeJS", "Laravel API"],
    // Pan-through of seven screens lifted from the spec doc's screenshots
    // (dashboard -> audience -> campaigns -> builder), at exactly 2.1 so
    // SHOT_ASPECT crops nothing. Gallery still uses the .png.
    image: "",
    src: "https://qgat4v5hrepgvc3n.public.blob.vercel-storage.com/writings/project-newsletter.gif",
    alt: "Drag-and-drop email newsletter builder interface",
    // Internal tool with no public URL, so the card opens the write-up instead.
    writingSlug: "newsletter-system-cong-cu-email-marketing-keo-tha-va-automation",
  },
  {
    // Not on the two-page CV; wording is our own translation, not CV text.
    id: "evn",
    period: "2022 — 2023",
    title: "EVN Hanoi Power Company",
    description: "UI/UX cho các module quản lý điện lực.",
    tags: [".NET Core API", "React.js", "Redux Toolkit", "Ant Design"],
    image: "",
    src: "https://qgat4v5hrepgvc3n.public.blob.vercel-storage.com/writings/project-evn.png",
    alt: "EVN Hanoi power-management system module interface",
    // Used to link to 3si.vn (the vendor's marketing site, not the product).
    // Per the convention above, the card opens the write-up instead.
    writingSlug: "evn-ha-noi-cong-cskh-va-cac-module-quan-ly-dien-luc",
  },
];

/** The six cards in a language: the Vietnamese prose swapped for the English. */
export function projectsFor(locale: Locale): readonly Project[] {
  if (locale === "vi") return PROJECTS;
  return PROJECTS.map((project) => ({ ...project, ...EN_PROJECTS[project.id] }));
}

/**
 * One uniform ratio keeps the six cards the same height. The static
 * screenshots are ~1913x912 — within 2% of 2.1, which `object-cover` absorbs
 * without visibly cropping any UI — and every GIF was produced at exactly
 * 2.1: the B2B capture and the Ops, Subscriber and Newsletter pan-throughs
 * are 840x400, the LMS recording an 848x404 center-crop of its 848x658 source
 * (the crop bakes in what `object-cover` was discarding, which is most of why
 * that file went from 29.6MB to 3.7MB).
 */
const SHOT_ASPECT = "aspect-[2.1]";

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
/**
 * The two layouts, as a Finder-style segmented control.
 *
 * This replaces a labelled switch — the words "Grid" and "List" either side of a
 * sliding knob — which is what the live site had. Icons say the same thing in a
 * third of the width, and a segmented control is also the honest control here:
 * a switch implies on and off, while these are two peers.
 *
 * `role="radiogroup"` rather than a switch for the same reason. Each segment is
 * a radio, so a screen reader announces which of the two is chosen instead of
 * reading one label and a checked state.
 */
const VIEWS = [
  { mode: "grid" as const, Icon: LayoutGrid, label: "Grid" },
  { mode: "list" as const, Icon: Rows3, label: "List" },
];

/** 22px tall so the 13px glyphs have room; the title bar has 44px to spare. */
const SEGMENT_CLASS =
  "flex h-[22px] w-[28px] cursor-pointer items-center justify-center rounded-[5px] " +
  "transition-colors duration-150 ease-out outline-none " +
  "focus-visible:ring-1 focus-visible:ring-black/40";

export function ProjectsToggle({ mode, onChange }: ProjectsToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Project layout"
      data-no-drag
      className="flex items-center gap-[2px] rounded-[7px] border-[0.5px] border-black/15 bg-black/5 p-[2px]"
    >
      {VIEWS.map(({ mode: value, Icon, label }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(value)}
            className={cn(
              SEGMENT_CLASS,
              active
                ? "bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.16)]"
                : "text-black/35 hover:text-black/60",
            )}
          >
            <Icon size={13} strokeWidth={2} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function ProjectCardBody({
  project,
  isList,
}: {
  project: Project;
  isList: boolean;
}) {
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
          src={project.src || `${PORTOS_ASSETS}/images/${project.image}`}
          alt={project.alt}
          width={1913}
          height={912}
          sizes={
            isList
              ? "(min-width: 880px) 1112px, 100vw"
              : "(min-width: 880px) 548px, 100vw"
          }
          className="h-full w-full rounded-none object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
      </div>

      <p className="font-sans mt-3 text-[11px] leading-[15px] font-medium tracking-[0.14em] text-black/45">
        {project.period}
      </p>

      <p className="font-display mt-[6px] flex items-center gap-1 text-[15px] leading-[21px] font-medium tracking-[-0.3px] text-black">
        {project.title}
        {project.href || project.writingSlug ? (
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
  /** Opens the Writing window on a given article. */
  onOpenWriting: (slug: string) => void;
  mode: ProjectsMode;
}

/**
 * Body of the "Projects" window — the chrome comes from
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
export function ProjectsWindow({ mode, onOpenWriting }: ProjectsWindowProps) {
  const isList = mode === "list";
  const projects = projectsFor(useLocale());

  return (
    <div className="pt-[50px]">
      {/* Container */}
      <div className="flex w-full items-center justify-center px-5 pb-[60px]">
        {/* Content */}
        <div className="flex w-full flex-col items-center justify-center gap-16">
          <div
            className={cn(
              "grid w-full items-start gap-x-4 gap-y-10",
              isList
                ? "grid-cols-1 min-[880px]:max-w-[var(--portos-content-max)]"
                : "grid-cols-1 min-[560px]:grid-cols-2 min-[880px]:grid-cols-3 min-[880px]:max-w-[var(--portos-content-max)]",
            )}
          >
            {projects.map((project, index) => {
              const shared =
                "group flex w-full flex-col items-start text-left transition-opacity duration-200";
              const interactive = cn(shared, "cursor-pointer hover:opacity-95");

              // An internal write-up: a real link to the article's page, whose
              // plain click opens it in the Writing window instead.
              if (project.writingSlug) {
                const slug = project.writingSlug;
                return (
                  <WindowLink
                    key={index}
                    href={`/writing/${slug}`}
                    onOpen={() => onOpenWriting(slug)}
                    data-no-drag
                    className={interactive}
                  >
                    <ProjectCardBody project={project} isList={isList} />
                  </WindowLink>
                );
              }

              return project.href ? (
                <a
                  key={project.image}
                  href={project.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-no-drag
                  className={interactive}
                  {...outboundLinkProps("project", "projects")}
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
