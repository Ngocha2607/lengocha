import type { PortosAppId } from "@/types/portos";

/**
 * Every window that is also a page, and the URL it lives at.
 *
 * Before this existed the windows had no URLs at all: the desktop icons were
 * buttons, so a crawler that does not run JavaScript found two links on the
 * home page (LinkedIn and GitHub) and nothing behind them. Each entry here is
 * now a real route that boots the desktop with that window open and its
 * content in the server HTML, and every icon that opens the window is an
 * `<a href>` to it.
 *
 * Shared by the server (routes, metadata, sitemap) and the client (icon hrefs,
 * keeping the address bar in step with the front window), so it imports
 * nothing either side cannot.
 *
 * The Recycle Bin is deliberately absent: it holds the template's leftover
 * stock images, which are nobody's content and nothing to index.
 */
export const SECTION_PATHS = {
  about: "/about",
  experience: "/experience",
  projects: "/projects",
  writing: "/writing",
  contact: "/contact",
  resume: "/resume",
  decisions: "/decisions",
  gallery: "/gallery",
} as const satisfies Partial<Record<PortosAppId, string>>;

export type SectionApp = keyof typeof SECTION_PATHS;

export function isSectionApp(app: PortosAppId): app is SectionApp {
  return app in SECTION_PATHS;
}

/** The URL a window lives at, or null for a window that has none. */
export function pathForApp(app: PortosAppId): string | null {
  return isSectionApp(app) ? SECTION_PATHS[app] : null;
}

/**
 * Search copy for the window routes served by `app/[section]`. Writing has
 * its own route (it reads Notion), so it is not in this list.
 *
 * Every description is Vietnamese, like the content, and at most 160
 * characters. Each one only restates what that window already says — no claim
 * here that the window itself does not make.
 */
export const SECTION_PAGES = {
  about: {
    title: "About",
    description:
      "Giới thiệu Lê Ngọc Hà, Frontend Tech Lead tại SAPP Academy: gần 5 năm xây dựng và dẫn dắt hệ thống web EdTech và TravelTech.",
  },
  experience: {
    title: "Experience",
    description:
      "Kinh nghiệm của Lê Ngọc Hà: Frontend Tech Lead tại SAPP Academy, Fullstack Developer tại Tweet World Travel, Frontend Developer tại Minastik.",
  },
  projects: {
    title: "Projects",
    description:
      "Dự án của Lê Ngọc Hà: LMS và hệ vận hành SAPP Academy; nền tảng quản trị, website B2B và newsletter của Tweet World Travel; module quản lý EVN Hà Nội.",
  },
  contact: {
    title: "Contact",
    description:
      "Liên hệ Lê Ngọc Hà qua email, GitHub hoặc LinkedIn. Sẵn sàng làm việc remote, hiện ở Hà Nội, Việt Nam (UTC+7).",
  },
  resume: {
    title: "Resume",
    description:
      "CV của Lê Ngọc Hà: xem trực tiếp trong trình duyệt hoặc tải bản PDF.",
  },
  decisions: {
    title: "Leadership & Technical Decisions",
    description:
      "Cách Lê Ngọc Hà dẫn dắt team và ra quyết định kỹ thuật: dẫn dắt bằng số liệu, chuẩn kỹ thuật, mentoring, monorepo và editor tự xây trên Tiptap.",
  },
  gallery: {
    title: "Gallery",
    description:
      "Ảnh chụp màn hình sáu dự án của Lê Ngọc Hà: LMS Platform, Operations, Subscriber Platform, Website B2B, Newsletter System và EVN Hà Nội.",
  },
} as const satisfies Record<Exclude<SectionApp, "writing">, { title: string; description: string }>;

export type SectionPageApp = keyof typeof SECTION_PAGES;

/** Route param -> app, for `app/[section]`. Null for anything that is not a section page. */
export function sectionPageFromParam(param: string): SectionPageApp | null {
  return param in SECTION_PAGES ? (param as SectionPageApp) : null;
}
