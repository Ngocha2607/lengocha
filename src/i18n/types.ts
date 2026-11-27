/**
 * The shapes of the site's translatable copy, shared by the Vietnamese text
 * (which stays in the component that shows it) and the English text (all of
 * it in `src/i18n/en.ts`). A window picks one or the other by locale, so the
 * compiler is what keeps the two in step: an English entry that is missing a
 * field, or a window that gains one, fails the typecheck.
 *
 * Types only — nothing here ends up in a bundle.
 */

export interface PageCopy {
  title: string;
  description: string;
}

/** The windows that are pages at `/<section>` and `/en/<section>`. */
export type SectionPageId =
  | "about"
  | "experience"
  | "projects"
  | "contact"
  | "resume"
  | "decisions"
  | "gallery";

export interface MetaCopy {
  /** The home page's meta description, at most 160 characters. */
  siteDescription: string;
  /** Per window page. Titles are the window titles, the same in both languages. */
  sections: Record<SectionPageId, string>;
  /** The Writing list page. */
  writing: string;
}

export interface MenuBarCopy {
  /** Accessible name of the VI | EN switch. */
  languageLabel: string;
}

export interface DesktopIntroCopy {
  closeLabel: string;
  /** The one line under the name and title. */
  tagline: string;
  /** Accessible name of the row of section links. */
  navLabel: string;
}

export interface AboutCounterCopy {
  label: string;
  /** The settled text. */
  value: string;
  /** The number the roll lands on. */
  target: number;
  /** Travels with the number for the whole roll. */
  suffix: string;
}

export interface TimelineEntryCopy {
  dates: string;
  company: string;
  role: string;
}

export interface AboutCopy {
  greeting: string;
  paragraphs: readonly string[];
  counters: readonly AboutCounterCopy[];
  /** Oldest first, as the climbing timeline draws it. */
  timeline: readonly TimelineEntryCopy[];
}

export interface TestimonialsCopy {
  heading: string;
  sampleBadge: string;
  sampleTitle: string;
  sourceLink: string;
  /**
   * A translation per testimonial id, or nothing to show the original words.
   * Only the English page uses this.
   */
  translations: Partial<Record<string, { quote: string; relation: string }>>;
}

export interface RoleCopy {
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

export type ProjectId = "lms" | "ops" | "subscriber" | "b2b" | "newsletter" | "evn";

/** The two lines of a project card that are prose; the rest is names and tags. */
export interface ProjectCopy {
  period: string;
  description: string;
}

export interface ContactCopy {
  /** Under "Let's talk". */
  availability: string;
  location: string;
  sent: string;
  /** The failure line is split around the email link. */
  failedBefore: string;
  failedAfter: string;
}

export interface ResumeCopy {
  /** Shown beside the file name; null when the CV is in the page's language. */
  languageNote: string | null;
}

export type DecisionStatus = "Shipped" | "Held" | "Reverted";

export interface HighlightCopy {
  kind: "highlight";
  id: string;
  title: string;
  period: string;
  org: string;
  detail: string;
}

export interface DecisionCopy {
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

export interface DecisionsCopy {
  statusLabels: Record<DecisionStatus, string>;
  highlights: readonly HighlightCopy[];
  decisions: readonly DecisionCopy[];
}

export interface WritingCopy {
  /**
   * The label on every article card and article header on the English pages
   * ("In Vietnamese"); null on the Vietnamese pages, where it goes without
   * saying.
   */
  languageLabel: string | null;
}
