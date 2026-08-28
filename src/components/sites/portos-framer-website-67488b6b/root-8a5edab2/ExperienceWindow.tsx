import { cn } from "@/lib/utils";

/**
 * Body of the "Experience" window — the chrome comes from `WindowFrame`.
 *
 * REPLACES the template's "Wallpaper" window, which was a four-image carousel for
 * changing the desktop background. Requested; see ARTIFACT_MANIFEST.md.
 *
 * This is the LONG form of the career. The About window already carries the
 * climbing timeline, which is a five-second scan — period, employer, role. This
 * is what that timeline is an index of: the exact ranges, what each job actually
 * was, and what came out of it. The two disagree on order on purpose. The
 * timeline runs oldest-first because a trajectory reads left to right; these
 * cards run newest-first because that is what a reviewer wants at the top.
 *
 * Content is Lê Ngọc Hà's own, carried across from the career section of his
 * portfolio rather than rewritten, so the two stay in step.
 *
 * The window keeps the measured 720x596 geometry rather than the standard
 * 864x630. That was sized for a wallpaper carousel, but it happens to leave a
 * 680px text column, which is a better reading width than 824 would be.
 */

interface Role {
  /** The exact range from the CV. Do not widen these to whole years. */
  period: string;
  title: string;
  org: string;
  /** The employer's site, where there is one. */
  url?: string;
  /** Anything the job title alone would misrepresent. */
  note?: string;
  summary: string;
  highlights: readonly string[];
}

const ROLES: readonly Role[] = [
  {
    period: "03/2025 — Present",
    title: "Frontend Tech Lead",
    org: "SAPP Academy",
    url: "https://sapp.edu.vn",
    summary:
      "Own the frontend technical direction across the product ecosystem — the learning platform, the test platform, a finance product and the operations back-office — plus the standards and the people.",
    highlights: [
      "Consolidated four frontends into one pnpm + Turborepo workspace over a shared component, editor and styles layer",
      "Migrated the LMS to Next.js 14 App Router, then ran a measured pass over 15 routes: worst route 15.2s → 6.1s, Lighthouse 29 → 65",
      "Replaced a per-seat editor licence with an in-house Tiptap package across the whole workspace",
      "Gitleaks, Trivy, Semgrep and OWASP ZAP on every merge request; AI workflows returning ~10 hours a week to the team",
      "Mentoring two junior engineers; own coding standards and code review",
    ],
  },
  {
    period: "03/2023 — 02/2025",
    title: "Fullstack Developer",
    org: "Tweet World Travel Group",
    url: "https://tweetworldtravel.com",
    summary:
      "Both sides of the wire: Spring Boot microservices and the React / Next.js clients in front of them, for a travel group's agent and consumer products.",
    highlights: [
      "Five B2B products and a multilingual ERP serving roughly 1,000 users a month",
      "Page load 3.2s → 1.1s with mobile Lighthouse held at 85",
      "Mentored three junior engineers and ran the code reviews that held production quality steady",
    ],
  },
  {
    period: "10/2021 — 02/2023",
    title: "Frontend Developer",
    org: "Minastik JSC",
    url: "https://www.minastik.com",
    note: "Onsite at 3S Intersoft",
    summary:
      "React applications for operational software, to an Agile/Scrum process, with a backend team on the other side of the API.",
    highlights: [
      "Built the UI/UX for EVN Hanoi's power-management modules on a .NET Core API",
      "First codebase someone else had to maintain after me — where the habits about naming and structure came from",
    ],
  },
  {
    period: "2021",
    title: "Software Engineer Intern",
    org: "FPT Software",
    url: "https://www.fpt-software.com",
    summary:
      "Built an employee-management application in C++ and learned how software gets built by more than one person.",
    highlights: [],
  },
  {
    period: "2018 — 2022",
    title: "B.Eng, Electronics & Telecommunications",
    org: "Hanoi University of Science and Technology",
    url: "https://hust.edu.vn",
    summary: "Engineering degree at HUST, with published research at REV-ECIT 2021.",
    highlights: [],
  },
];

const PERIOD_CLASS =
  "font-sans text-[11px] leading-[15px] font-medium tracking-[0.14em] text-black/45";
const ORG_CLASS =
  "font-display text-[17px] leading-[23px] font-bold tracking-[-0.17px] text-black";
const TITLE_CLASS =
  "font-display text-[13px] leading-[18px] tracking-[-0.13px] text-black/55";
const SUMMARY_CLASS = "font-sans text-[12px] leading-[17.5px] text-black/70";
const HIGHLIGHT_CLASS = "font-sans text-[12px] leading-[17.5px] text-black/70";
const NOTE_CLASS =
  "font-sans rounded-full border border-black/10 px-2 py-[2px] text-[11px] leading-[15px] text-black/55";

export function ExperienceWindow() {
  return (
    <div className="px-5 pt-[50px] pb-[60px]">
      <div className="mx-auto flex w-full flex-col gap-8">
        {ROLES.map((role, index) => (
          <article
            key={`${role.org}-${role.period}`}
            className={cn(
              "flex w-full flex-col items-start",
              // A rule between entries, not around them: the first card sits
              // under the title bar and needs no line above it.
              index > 0 && "border-t border-black/10 pt-8",
            )}
          >
            <p className={PERIOD_CLASS}>{role.period}</p>

            <div className="mt-[6px] flex flex-wrap items-center gap-x-2 gap-y-1">
              {role.url ? (
                <a
                  // `data-no-drag` so a click on the link is not swallowed as a
                  // window drag — `WindowFrame` checks for it.
                  data-no-drag
                  href={role.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(ORG_CLASS, "group/org flex items-center gap-1")}
                >
                  {role.org}
                  <span
                    aria-hidden="true"
                    className="text-[13px] text-black/35 transition-colors group-hover/org:text-black"
                  >
                    ↗
                  </span>
                </a>
              ) : (
                <p className={ORG_CLASS}>{role.org}</p>
              )}
              {role.note ? <span className={NOTE_CLASS}>{role.note}</span> : null}
            </div>

            <p className={cn(TITLE_CLASS, "mt-[2px]")}>{role.title}</p>

            <p className={cn(SUMMARY_CLASS, "mt-3")}>{role.summary}</p>

            {role.highlights.length > 0 ? (
              <ul className="mt-3 flex list-disc flex-col gap-[6px] pl-[18px]">
                {role.highlights.map((item) => (
                  <li key={item} className={HIGHLIGHT_CLASS}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
