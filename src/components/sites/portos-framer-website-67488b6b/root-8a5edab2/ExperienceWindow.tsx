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
 * Content is carried VERBATIM (Vietnamese) from the CV at
 * `public/Le-Ngoc-Ha-Senior-Frontend-Developer.pdf`, on request, so the two
 * stay in step. The FPT internship is the one entry the two-page CV cut for
 * space; it is kept here (and on the About timeline) with its own wording.
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
  /** The CV lists bullets only, so most roles carry no summary paragraph. */
  summary?: string;
  highlights: readonly string[];
}

const ROLES: readonly Role[] = [
  {
    period: "03/2025 — Hiện tại",
    title: "Frontend Tech Lead",
    org: "SAPP Academy",
    url: "https://sapp.edu.vn",
    highlights: [
      "Dẫn dắt Frontend LMS + Ops, review 100% Merge Request và mentor 2 Junior Frontend.",
      "Thiết kế Monorepo với pnpm Workspace + Turborepo, hợp nhất 4 frontend và chuẩn hóa hệ thống package dùng chung.",
      "Nâng cấp LMS từ Next.js 12 → 14 App Router, tạo nền tảng cho các cải tiến rendering và hiệu năng.",
      "Thay editor thương mại bằng Tiptap, xây dựng thành private package dùng chung, giảm phụ thuộc nhà cung cấp và chi phí license.",
      "Tối ưu hiệu năng: giảm 60% thời gian tải trang (15.2s → 6.1s), Lighthouse 29 → 65+.",
      "Tích hợp Gitleaks, Trivy, Semgrep, OWASP ZAP vào CI/CD và xây dựng AI Workflow, tăng 30% năng suất, tiết kiệm ~10 giờ/tuần.",
    ],
  },
  {
    period: "03/2023 — 02/2025",
    title: "Fullstack Developer",
    org: "Tweet World Travel Group",
    url: "https://tweetworldtravel.com",
    highlights: [
      "Phát triển 5 nền tảng TravelTech B2B, phục vụ ~1.000 users/tháng, cùng hệ thống quản trị nội bộ đa ngôn ngữ.",
      "Xây dựng và bảo trì Backend Services với Spring Boot / Microservices trong môi trường Monorepo.",
      "Tối ưu SSR và tài nguyên Frontend, giảm page load 3.2s → 1.1s (-66%), duy trì Lighthouse 85.",
      "Mentor 3 Junior Frontend, review Pull Request trước khi merge vào Staging.",
      "Tái cấu trúc và chuẩn hóa codebase, cải thiện khả năng mở rộng và tái sử dụng.",
    ],
  },
  {
    period: "10/2021 — 02/2023",
    title: "Frontend Developer",
    org: "Minastik JSC",
    url: "https://www.minastik.com",
    note: "Onsite tại 3S Intersoft JSC",
    highlights: [
      "Phát triển và bảo trì nhiều ứng dụng web với React.js, xây dựng giao diện đáp ứng (Responsive) và đảm bảo trải nghiệm người dùng trên nhiều nền tảng.",
      "Phối hợp với đội Backend để tích hợp RESTful API, triển khai các tính năng mới và xử lý lỗi trong quá trình phát triển.",
      "Làm việc theo quy trình Agile/Scrum, phối hợp chặt chẽ với các thành viên trong nhóm để đảm bảo tiến độ dự án.",
    ],
  },
  {
    // Not on the two-page CV (cut for space); wording is our own translation of
    // the entry it used to carry, not CV text.
    period: "2021",
    title: "Software Engineer Intern",
    org: "FPT Software",
    url: "https://www.fpt-software.com",
    summary: "Xây dựng ứng dụng quản lý nhân viên bằng C++.",
    highlights: [],
  },
  {
    period: "2018 — 2022",
    title: "Cử nhân Điện tử - Viễn thông",
    org: "Đại học Bách Khoa Hà Nội",
    url: "https://hust.edu.vn",
    summary: "Bài báo khoa học — Kỷ yếu hội nghị REV ECIT 2021.",
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
              {role.note ? (
                <span className={NOTE_CLASS}>{role.note}</span>
              ) : null}
            </div>

            <p className={cn(TITLE_CLASS, "mt-[2px]")}>{role.title}</p>

            {role.summary ? (
              <p className={cn(SUMMARY_CLASS, "mt-3")}>{role.summary}</p>
            ) : null}

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
