"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Body of the "Leadership & Technical Decisions" window — the chrome comes from
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
 * The two groups mirror the CV's own two sections — LEADERSHIP and TECHNICAL
 * DECISIONS — and carry its Vietnamese text VERBATIM, on request
 * (`public/Le-Ngoc-Ha-Senior-Frontend-Developer.pdf`). The option lists, most
 * consequence lists and the fourth decision (a stub the CV cut for space) have
 * no CV counterpart; that wording is our own Vietnamese rendering of the
 * portfolio content this window used to carry in English. A third group of six
 * working practices was removed with the rename — it is in git history.
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

type Entry = Highlight | Decision;

const HIGHLIGHTS: readonly Highlight[] = [
  {
    kind: "highlight",
    id: "h-metrics",
    title: "Dẫn dắt bằng số liệu",
    period: "2025",
    org: "LMS · SAPP Academy",
    detail:
      "Ưu tiên các hạng mục tối ưu dựa trên dữ liệu đo đạc thực tế trên 15 trang: giảm 60% thời gian tải trang (15.2s → 6.1s), Lighthouse nhóm học viên 49 → 67, giảng viên 72 → 89.",
  },
  {
    kind: "highlight",
    id: "h-standards",
    title: "Đặt chuẩn kỹ thuật cho team",
    period: "2026",
    org: "Pipeline CI/CD · SAPP Academy",
    detail:
      "Thiết lập chuẩn code và bảo mật, tự động hóa kiểm tra trong CI/CD và trực tiếp review 100% Merge Request — để máy bắt lỗi lặp lại, con người tập trung vào kiến trúc và chất lượng.",
  },
  {
    kind: "highlight",
    id: "h-mentor",
    title: "Mentoring & phát triển kỹ sư trẻ",
    period: "2023 — 2025",
    org: "SAPP Academy · Tweet World Travel",
    detail:
      "Trực tiếp mentor 5 Junior Frontend, tập trung hướng dẫn cách phân tích và tự tìm lời giải thay vì đưa đáp án sẵn.",
  },
];

const DECISIONS: readonly Decision[] = [
  {
    kind: "decision",
    id: "d-ttfb",
    status: "Held",
    year: "2026",
    title: "Ưu tiên hiệu năng người dùng thay vì chỉ số server",
    upshot:
      "Chỉ số server đẹp lên rõ rệt nhưng trải nghiệm thực tế của người dùng không đổi, nên chưa triển khai.",
    context:
      "Một cải tiến giúp thời gian phản hồi server giảm 60ms → 3ms trên 20 trang. Tuy nhiên, đo lường thực tế cho thấy người dùng gần như không nhận thấy cải thiện.",
    options: [
      "Ship — cơ chế đã được chứng minh là hoạt động",
      "Ship sau một flag trên vài route ít rủi ro",
      "Giữ lại cho đến khi client boundary được đẩy xuống lá",
    ],
    chosen: 2,
    decision:
      "Tôi quyết định không triển khai, chuyển nguồn lực sang xử lý đúng điểm nghẽn ảnh hưởng đến trải nghiệm thực tế. Thay đổi vẫn nằm trong working tree cùng các số liệu đo bên cạnh.",
    consequences: [
      "Hai mươi route có thể static-generate, và thời gian phản hồi server trên các route chính giảm từ ~60ms xuống 3ms khi đo local.",
      "Nhưng một hook đọc search-params nằm trên đỉnh provider tree khiến toàn bộ bail out về client rendering, nội dung thật vẫn đến sau hydrate. Chỉ số server thay đổi; thứ người dùng phải chờ thì không.",
      "Một thay đổi tốt nhưng sai thứ tự. Nó sẽ ship sau khi client boundary được đẩy xuống lá — nếu không thì đó là cải thiện 15 lần trên một con số không người dùng nào cảm nhận được.",
    ],
  },
  {
    kind: "decision",
    id: "d-monorepo",
    status: "Shipped",
    year: "2025",
    title: "Gộp 4 sản phẩm vào một nền tảng chung",
    upshot:
      "Giảm công việc lặp lại, thống nhất chất lượng và giúp sản phẩm mới kế thừa ngay các chuẩn kỹ thuật và bảo mật.",
    context:
      "Bốn sản phẩm trước đây nằm ở bốn repository riêng, khiến các tính năng dùng chung phải triển khai lặp lại.",
    options: [
      "Các repo riêng với một package component được publish",
      "Một monorepo với task graph trên một lớp dùng chung",
      "Một ứng dụng duy nhất với feature flag theo từng khách hàng",
    ],
    chosen: 1,
    decision:
      "Tôi quyết định đưa về Monorepo với pnpm Workspace + Turborepo, tập trung hóa UI, editor và styles dùng chung.",
    consequences: [
      "App mới kế thừa lớp dùng chung và toàn bộ cổng bảo mật ngay từ ngày đầu, thay vì phải đàm phán cả hai sau này.",
      "Package không thay đổi được khôi phục từ cache, nên pipeline vẫn dùng tốt khi số app tăng lên.",
      "Lớp dùng chung trở thành nơi phải ra các quyết định code-splitting, vì đó là nơi những thứ nặng nhất sống.",
    ],
  },
  {
    kind: "decision",
    id: "d-editor",
    status: "Shipped",
    year: "2025",
    title: "Thay editor trả phí bằng giải pháp tự xây dựa trên Tiptap",
    upshot:
      "Một chi phí tăng theo quy mô học viên trở thành một lần đầu tư kỹ thuật.",
    context:
      "Editor cũ tính phí theo số lượng người dùng, khiến chi phí tăng theo quy mô học viên.",
    options: [
      "Gia hạn, và đàm phán số seat mỗi năm",
      "Giới hạn editor cho ít vai trò hơn để giữ số seat thấp",
      "Tự xây trên nền mã nguồn mở (Tiptap / ProseMirror)",
    ],
    chosen: 2,
    decision:
      "Tôi quyết định chuyển sang Tiptap, xây dựng và đóng gói thành package dùng chung trong Monorepo.",
    consequences: [
      "Chi phí license biến đổi trở thành chi phí kỹ thuật cố định, và chi tiêu hàng tháng giảm theo.",
      "Monorepo không còn load TinyMCE ở bất kỳ đâu.",
      "Đánh đổi: team chủ động toàn bộ việc phát triển và bảo trì editor, đổi lại giảm phụ thuộc nhà cung cấp và kiểm soát tốt hơn chi phí dài hạn.",
    ],
  },
];

/** Group labels follow the CV's own English section headers. */
const GROUPS: readonly { label: string; items: readonly Entry[] }[] = [
  { label: "Leadership", items: HIGHLIGHTS },
  { label: "Technical Decisions", items: DECISIONS },
];

const ALL: readonly Entry[] = GROUPS.flatMap((g) => g.items);

/** The one line under each title in the list — a notes app's preview snippet. */
function previewOf(entry: Entry): string {
  switch (entry.kind) {
    case "highlight":
      return entry.detail;
    case "decision":
      return entry.upshot;
  }
}

function metaOf(entry: Entry): string {
  switch (entry.kind) {
    case "highlight":
      return `${entry.period} · ${entry.org}`;
    case "decision":
      return `${STATUS_LABEL[entry.status]} · ${entry.year}`;
  }
}

const GROUP_LABEL =
  "font-display px-3 pt-4 pb-1 text-[13px] leading-[18px] font-bold tracking-[-0.13px] text-black";
const ROW_TITLE =
  "font-display text-[12px] leading-[16px] font-medium tracking-[-0.12px]";
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

/** The chip text, exactly as the CV prints each state. */
const STATUS_LABEL: Record<DecisionStatus, string> = {
  Shipped: "Đã triển khai",
  Held: "Đã đo, chưa triển khai",
  Reverted: "Đã gỡ bỏ",
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

  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(CHIP_CLASS, STATUS_TONE[entry.status])}>
          {STATUS_LABEL[entry.status]}
        </span>
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
            {i === entry.chosen ? (
              <span className="sr-only"> (chosen)</span>
            ) : null}
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
        aria-label="Leadership and technical decisions"
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
                  <span className={cn(ROW_TITLE, "line-clamp-2 text-black")}>
                    {item.title}
                  </span>
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
