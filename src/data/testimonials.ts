/**
 * Nhận xét (testimonials) hiển thị trong cửa sổ About.
 *
 * CÁCH THAY MẪU BẰNG NHẬN XÉT THẬT — với từng mục:
 *   1. Thay `quote` bằng đúng lời người đó viết (không sửa ý, không thêm số liệu).
 *   2. Điền `name` và `role` (chức danh của người nhận xét), kiểm tra `company`
 *      và `relation`.
 *   3. Nếu nhận xét có trên LinkedIn (Recommendations), thêm link vào `sourceUrl`.
 *   4. Đổi `status` từ "sample" sang "published".
 *
 * Mục "sample" CHỈ hiện ở môi trường không phải production (máy local và bản
 * preview trên Vercel), luôn kèm nhãn "MẪU". Production chỉ hiện mục
 * "published"; chưa có mục nào "published" thì cả phần Nhận xét bị ẩn. Lý do:
 * các câu mẫu dưới đây là câu giữ chỗ, không phải lời ai đã nói — khách truy
 * cập không bao giờ được thấy chúng như thể là nhận xét thật.
 *
 * Không thêm schema Review / AggregateRating cho phần này.
 */

export type TestimonialStatus = "sample" | "published";

export interface Testimonial {
  /** The words, verbatim. */
  quote: string;
  /** Empty while the entry is a sample. */
  name: string;
  /** The reviewer's own title. Empty while the entry is a sample. */
  role: string;
  company: string;
  /** How they know the owner, e.g. "Quản lý trực tiếp". */
  relation: string;
  /** The LinkedIn recommendation (or other public source), if there is one. */
  sourceUrl?: string;
  status: TestimonialStatus;
}

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "Hà đo trước khi sửa. Trang LMS từ 15.2s xuống 6.1s, và quyết định nào cũng có lý do được ghi lại.",
    name: "",
    role: "",
    company: "SAPP Academy",
    relation: "Quản lý trực tiếp",
    status: "sample",
  },
  {
    quote:
      "Hà nhận phần tích hợp Payoo từ đầu đến lúc nghiệm thu, kể cả đối soát với kế toán.",
    name: "",
    role: "",
    company: "SAPP Academy",
    relation: "Đồng nghiệp",
    status: "sample",
  },
  {
    quote: "Hà review kỹ nhưng không làm thay. Mình học được cách tự tìm lời giải.",
    name: "",
    role: "",
    company: "SAPP Academy",
    relation: "Junior Frontend được mentor",
    status: "sample",
  },
  {
    quote: "Site của chúng tôi từ 3.2s xuống 1.1s sau khi Hà tối ưu SSR.",
    name: "",
    role: "",
    company: "Tweet World Travel",
    relation: "PM",
    status: "sample",
  },
];

/**
 * True on local machines and Vercel previews, false on the production
 * deployment. `SITE_VERCEL_ENV` is stamped into the bundle at build time by
 * next.config.ts, because this is read by a client component (the About
 * window), where a plain server env var does not exist.
 */
export const SHOW_SAMPLE_TESTIMONIALS = process.env.SITE_VERCEL_ENV !== "production";

/** What this deployment may show: published entries, plus samples outside production. */
export function visibleTestimonials(showSamples = SHOW_SAMPLE_TESTIMONIALS): Testimonial[] {
  return TESTIMONIALS.filter((t) => t.status === "published" || (showSamples && t.status === "sample"));
}
