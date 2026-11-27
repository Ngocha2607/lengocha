"use client";

import { visibleTestimonials, type Testimonial } from "@/data/testimonials";
import { EN_TESTIMONIALS } from "@/i18n/en";
import { useLocale } from "@/i18n/LocaleProvider";
import type { TestimonialsCopy } from "@/i18n/types";
import { cn } from "@/lib/utils";

/**
 * "Nhận xét" — what people who worked with the owner say, at the foot of the
 * About window. Driven by `src/data/testimonials.ts`; see the note there for
 * how a sample becomes a published entry.
 *
 * Samples render only outside production, each wearing a "MẪU" badge, and
 * the whole block disappears when this deployment has nothing to show — so
 * production never displays a placeholder quote as if someone had said it.
 *
 * Deliberately no Review / AggregateRating markup: these are recommendations,
 * not product reviews, and self-hosted review schema is not something search
 * engines will honour for a person anyway.
 *
 * Typography follows the About window: the 18px block heading of Expertise and
 * Experience, 14px display text for the quote, and the 11px tracked label the
 * timeline dates use for who said it.
 */

const HEADING_CLASS = "font-display text-[18px] leading-[25.2px] tracking-[-0.54px] text-black";
const LABEL_CLASS =
  "font-sans text-[11px] leading-[15px] font-medium tracking-[0.14em] text-black/45";
/** The amber "not shipped" tone the Decisions window uses — here, "not real yet". */
const SAMPLE_BADGE_CLASS =
  "font-sans shrink-0 rounded-full border border-[#b8860b]/30 px-2 py-[2px] text-[11px] leading-[15px] font-medium text-[#8a6508]";

/** The Vietnamese labels. The English, with the quotes' translations, is `EN_TESTIMONIALS`. */
const VI_COPY: TestimonialsCopy = {
  heading: "Nhận xét",
  sampleBadge: "MẪU",
  sampleTitle: "Nhận xét mẫu — chưa phải lời thật",
  sourceLink: "Nguồn ↗",
  translations: {},
};

function attribution(t: Testimonial, relation: string): string {
  const who = [t.name, t.role].filter(Boolean).join(", ");
  return [who, relation, t.company].filter(Boolean).join(" · ");
}

export function AboutTestimonials() {
  const locale = useLocale();
  const copy = locale === "en" ? EN_TESTIMONIALS : VI_COPY;
  const entries = visibleTestimonials();
  if (entries.length === 0) return null;

  /**
   * On the English page, the translation when there is one; otherwise the
   * original words, marked as Vietnamese (every entry so far was written in
   * Vietnamese).
   */
  const textOf = (t: Testimonial) => {
    const translation = copy.translations[t.id];
    return {
      quote: translation?.quote ?? t.quote,
      relation: translation?.relation ?? t.relation,
      lang: locale === "en" && !translation ? "vi" : undefined,
    };
  };

  return (
    <section aria-labelledby="about-testimonials" className="flex w-full flex-col items-start gap-6">
      <h2 id="about-testimonials" className={HEADING_CLASS}>
        {copy.heading}
      </h2>
      <div className="grid w-full grid-cols-1 gap-4 min-[560px]:grid-cols-2">
        {entries.map((t) => (
          <figure
            key={t.id}
            className={cn(
              "flex flex-col justify-between gap-4 rounded-[10px] border bg-white p-4",
              t.status === "sample" ? "border-dashed border-[#b8860b]/35" : "border-black/10",
            )}
          >
            <blockquote
              lang={textOf(t).lang}
              className="font-display text-[14px] leading-[20px] tracking-[-0.14px] text-black"
            >
              “{textOf(t).quote}”
            </blockquote>
            <figcaption className="flex flex-wrap items-center gap-2">
              {t.status === "sample" ? (
                <span className={SAMPLE_BADGE_CLASS} title={copy.sampleTitle}>
                  {copy.sampleBadge}
                </span>
              ) : null}
              <span className={LABEL_CLASS}>{attribution(t, textOf(t).relation)}</span>
              {t.sourceUrl ? (
                <a
                  // `data-no-drag` so the click is not taken for a window drag.
                  data-no-drag
                  href={t.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-sans text-[11px] leading-[15px] text-black/55 underline-offset-2 hover:text-black hover:underline"
                >
                  {copy.sourceLink}
                </a>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
