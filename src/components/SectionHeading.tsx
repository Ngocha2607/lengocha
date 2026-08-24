interface SectionHeadingProps {
  /**
   * The section's id. The heading renders as `${id}-title` so the section can
   * point `aria-labelledby` at it instead of duplicating the name in a label.
   */
  id: string;
  /** Short nav label, matching the sidebar. Doubles as the mobile wayfinder. */
  eyebrow: string;
  /** The visible title — plain English, no jargon. */
  title: string;
  /**
   * One or two sentences a reader who does not write frontend code can follow.
   * Recruiters and hiring managers read this and skip the rest; it has to stand
   * on its own.
   */
  lead: string;
}

/**
 * Renders as a fragment on purpose: `position: sticky` is bounded by its
 * containing block, so the wayfinder has to be a direct child of the
 * <section> to stay pinned for the section's full height. Wrapping the two
 * blocks in one div pins it for the height of the heading and no further.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
}: SectionHeadingProps) {
  return (
    <>
      {/*
        On mobile this is the sticky wayfinder, since the sidebar nav is desktop
        only; from lg it settles inline as an eyebrow above the title. Hidden
        from assistive tech because the <h2> underneath already names the
        section — otherwise every section announces its name twice.

        No `w-screen` here: 100vw includes the scrollbar, which pushes the bar
        past the viewport and gives the whole page a horizontal scroll. The
        negative margin already spans the container's padding exactly.
      */}
      <div
        className="sticky top-0 z-20 -mx-6 bg-slate-900/85 px-6 py-4 backdrop-blur md:-mx-12 md:px-12 lg:static lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
        aria-hidden="true"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-teal-300">
          {eyebrow}
        </p>
      </div>

      <div className="mb-8">
        <h2
          id={`${id}-title`}
          className="mt-4 text-2xl font-bold tracking-tight text-slate-200 lg:mt-3"
        >
          {title}
        </h2>

        <p className="mt-3 leading-relaxed text-slate-400">{lead}</p>
      </div>
    </>
  );
}
