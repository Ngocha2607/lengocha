import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/site";

/**
 * Per-page metadata, built one way for every route.
 *
 * It exists because of how Next merges metadata: a page's `openGraph`,
 * `twitter` and `alternates` REPLACE the layout's rather than extending them.
 * The old /writing page set its own `openGraph` without images and silently
 * lost the site's OG card, and every page that set a canonical dropped the RSS
 * `alternates.types` along with the layout's. Building the whole object here
 * keeps each page complete.
 */

/** Search results cut descriptions off past this many characters. */
export const META_DESCRIPTION_MAX = 160;

/**
 * Last-resort guard for a description that is still too long — a new Notion
 * post, say, before anyone has written it a shorter one. Cuts at the last word
 * that fits and adds an ellipsis, rather than mid-word.
 */
export function clampDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—–-]+$/, "")}…`;
}

/**
 * Shorter meta descriptions for the posts whose Notion `Description` runs past
 * 160 characters. Same meaning, same language, nothing added — mostly a
 * dropped article or a comma. The card in the Writing window and the RSS feed
 * still show the full Notion text; only `<meta name="description">` and the
 * social cards read from here.
 *
 * Keyed by slug. If a post's Notion description is rewritten, its entry here
 * should be revisited (or deleted, once Notion's own text fits).
 */
export const POST_META_DESCRIPTIONS: Record<string, string> = {
  "so-tay-appsec-cho-frontend-gitleaks-trivy-semgrep":
    "Ba lớp kiểm tra tự động cho frontend: Gitleaks bắt secrets và chặn merge, Trivy quét lỗ hổng thư viện trong CI, Semgrep bắt mẫu mã nguy hiểm ở pre‑commit và CI.",
  "newsletter-system-cong-cu-email-marketing-keo-tha-va-automation":
    "Công cụ email marketing tự xây cho Tweet World Travel: GrapeJS kéo-thả, quản lý subscriber, campaign hẹn giờ, feed automation lấy tour từ API. Tôi làm frontend.",
  "ban-lms-theo-module-kien-truc-plugin-trong-monorepo-next-js":
    "Một codebase build ra bản riêng cho từng khách: AppModule registry, Slot/ExtensionRegistry, script gen cắt feature chưa mua lúc build. Kèm chỗ tôi sẽ làm khác.",
  "tkg-platform-nen-tang-quan-tri-hang-tour-ban-si":
    "Nền tảng quản trị hãng tour bán sỉ Tweet World Travel: CRM, catalogue, booking, purchase order, ba cổng cho vận hành, supplier và đại lý. Phần frontend của tôi.",
  "sapp-ops-he-van-hanh-dao-tao-voi-18-module-nghiep-vu":
    "Back-office của SAPP: lớp học, ngân hàng câu hỏi, chấm bài có AI, xếp lịch, điểm danh resync, đơn hàng và tiền. 19 feature package, 18 module cắm vào registry.",
  "evn-ha-noi-cong-cskh-va-cac-module-quan-ly-dien-luc":
    "Cổng chăm sóc khách hàng và module quản lý điện lực cho EVNHANOI, 2022–2023. React, Redux Toolkit, Ant Design trên nền .NET Core API, onsite tại 3S Intersoft.",
  "khi-editor-tinh-tien-theo-so-hoc-vien-tu-dung-tiptap-thay-tinymce":
    "Vì sao SAPP bỏ TinyMCE và tôi dựng lại editor trên Tiptap thành package dùng chung: 7 extension tự viết, 17 tháng HTML cũ phải đọc được và những món nợ còn lại.",
  "sapp-lms-ops-hai-frontend-cua-mot-he-van-hanh-dao-tao":
    "SAPP vận hành bằng hai frontend: LMS cho người học và OPS cho vận hành. Bài tổng quan hai hệ, một buổi học đi qua cả hai thế nào và phần việc của tôi ở mỗi bên.",
};

/** The description a post advertises to search engines and social cards. */
export function postMetaDescription(slug: string, notionDescription: string): string | undefined {
  const text = POST_META_DESCRIPTIONS[slug] ?? notionDescription;
  return text ? clampDescription(text) : undefined;
}

/**
 * A cover that can stand in as a social card, or null.
 *
 * Animated GIFs are refused: Facebook, LinkedIn and X all take the first frame
 * or reject them, and several covers are multi-megabyte screen recordings. A
 * post without a usable cover gets the site's default 1200x630 card.
 */
export function staticCoverImage(coverUrl: string): string | null {
  if (!coverUrl) return null;
  const path = coverUrl.split(/[?#]/)[0].toLowerCase();
  return /\.(png|jpe?g|webp)$/.test(path) ? coverUrl : null;
}

interface PageMetadataInput {
  /** The full <title>. */
  title: string;
  /** Omitted when there is none, rather than emitted empty. */
  description?: string;
  /** Site path, e.g. "/about". Resolved against `metadataBase`. */
  path: string;
  type?: "website" | "article" | "profile";
  /** Defaults to the site's OG card. */
  image?: string | null;
  /** For articles. */
  publishedTime?: string;
  tags?: string[];
}

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  image,
  publishedTime,
  tags,
}: PageMetadataInput): Metadata {
  const images = [image || DEFAULT_OG_IMAGE];
  return {
    title,
    description,
    alternates: {
      canonical: path,
      // Re-stated on every page: a page-level `alternates` replaces the
      // layout's, and the feed should stay discoverable from all of them.
      types: { "application/rss+xml": "/feed.xml" },
    },
    openGraph: {
      type,
      url: path,
      siteName: SITE_NAME,
      locale: "vi_VN",
      title,
      description,
      images,
      ...(type === "article" ? { publishedTime, tags, authors: [SITE_NAME] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
