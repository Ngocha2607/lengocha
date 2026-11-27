/**
 * English titles and summaries for the Writing list on /en/writing, keyed by
 * the article's slug.
 *
 * The articles themselves stay Vietnamese: /en/writing links every card to the
 * Vietnamese article at /writing/<slug> and labels it "In Vietnamese". Notion
 * is not touched; this file is the only place the English lives.
 *
 * A post published in Notion after this file was last edited has no entry
 * here. Nothing breaks: its card shows the Vietnamese title and description,
 * marked `lang="vi"`, with the same label. Add an entry when there is time.
 *
 * Same rules as src/i18n/en.ts: every number exactly as in Vietnamese, no
 * claim the Vietnamese description does not make.
 */

export interface WritingEnglish {
  title: string;
  /** One or two sentences, from the post's Notion description. */
  summary: string;
}

export const WRITING_EN: Readonly<Record<string, WritingEnglish>> = {
  "website-b2b-website-ban-tour-da-ngon-ngu-tren-next-js": {
    title: "Website B2B: A multilingual tour sales website on Next.js",
    summary:
      "Tweet World Travel's public site: a catalogue of tours and cruises, and the entry point for B2B agents. Page load went from 3.2s to 1.1s, Lighthouse 85. The site is still live.",
  },
  "evn-ha-noi-cong-cskh-va-cac-module-quan-ly-dien-luc": {
    title: "EVN Hanoi: A customer service portal and power utility management modules",
    summary:
      "A customer service portal and power utility management modules for EVNHANOI, 2022–2023. React, Redux Toolkit and Ant Design on a .NET Core API, onsite at 3S Intersoft.",
  },
  "sapp-ops-he-van-hanh-dao-tao-voi-18-module-nghiep-vu": {
    title: "SAPP OPS: A training operations system with 18 business modules",
    summary:
      "SAPP's back office: classes, a question bank, AI-assisted grading, scheduling, attendance resync, orders and money. 19 feature packages, 18 modules plugged into one registry.",
  },
  "sapp-lms-nen-tang-hoc-va-luyen-thi-acca-cfa-cma": {
    title: "SAPP LMS: A learning and exam-prep platform for ACCA, CFA and CMA",
    summary:
      "SAPP LMS seen from the code: 4 Next.js apps in one monorepo, an in-house Storyline player, more than 8 question types and an exam-room toolkit. My part of the work since 3/2025.",
  },
  "tkg-platform-nen-tang-quan-tri-hang-tour-ban-si": {
    title: "TKG Platform: A management platform for a wholesale tour operator",
    summary:
      "The management platform of Tweet World Travel, a wholesale tour operator: CRM, catalogue, booking and purchase orders, split into three portals for operations, suppliers and agents. My frontend part of it.",
  },
  "newsletter-system-cong-cu-email-marketing-keo-tha-va-automation": {
    title: "Newsletter System: A drag-and-drop email marketing tool with automation",
    summary:
      "An in-house email marketing tool for Tweet World Travel: a GrapeJS drag-and-drop builder, subscriber management, scheduled campaigns and an automation feed that pulls tour content from an API. I built the frontend, 2023–2024.",
  },
  "khi-editor-tinh-tien-theo-so-hoc-vien-tu-dung-tiptap-thay-tinymce": {
    title: "When the editor is priced per learner: building on Tiptap to replace TinyMCE",
    summary:
      "Why SAPP dropped TinyMCE and I rebuilt the editor on Tiptap as a shared package: 7 custom extensions, 17 months of old HTML that still had to render, and the debts that remain.",
  },
  "sapp-lms-ops-hai-frontend-cua-mot-he-van-hanh-dao-tao": {
    title: "SAPP LMS & OPS: Two frontends of one training operations system",
    summary:
      "SAPP runs on two frontends: the LMS for learners and OPS for operations. An overview of both systems, how one class session passes through both, and my part in each.",
  },
  "ban-lms-theo-module-kien-truc-plugin-trong-monorepo-next-js": {
    title: "Selling the LMS by module: A plugin architecture in a Next.js monorepo",
    summary:
      "One codebase that builds a separate version for each customer: an AppModule registry, a Slot/ExtensionRegistry layer, and a gen script that removes the features a customer has not bought before the build. Plus what I would do differently.",
  },
  "so-tay-appsec-cho-frontend-gitleaks-trivy-semgrep": {
    title: "An AppSec handbook for the frontend: Gitleaks, Trivy, Semgrep",
    summary:
      "Frontend security needs three layers of automated checks: Gitleaks to catch secrets (pre-commit, and it blocks the merge), Trivy to scan library vulnerabilities (CI only, warns) and Semgrep to catch dangerous code patterns (pre-commit and CI, warns).",
  },
};

/** What a card on /en/writing shows, and whether it is the English or the fallback. */
export function englishPostCard(post: { slug: string; title: string; description: string }): {
  title: string;
  summary: string;
  /** False for a post with no entry above: the text is the Vietnamese original. */
  translated: boolean;
} {
  const entry = WRITING_EN[post.slug];
  return entry
    ? { title: entry.title, summary: entry.summary, translated: true }
    : { title: post.title, summary: post.description, translated: false };
}
