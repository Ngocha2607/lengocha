/**
 * Section icons, as inline SVG bodies.
 *
 * Raster icons were the obvious route — the portfolio this pattern came from
 * ships a 3D glass set as PNG — but that site serves 9 icons for 4.8MB, with a
 * 1295x1214 file rendered at 34px. This page argues about bundle size, so the
 * icons are stroke paths on a 24x24 grid instead: they inline into the HTML,
 * cost no request, inherit `currentColor`, and stay sharp at any size.
 *
 * Bodies only, no `<svg>` wrapper — `SectionHeading.astro` supplies the
 * viewBox, the stroke settings and the accessibility attributes so every icon
 * is drawn the same way.
 */
export const SECTION_ICONS = {
  /** About — a single figure. */
  person: `<circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" />`,

  /** Performance — a dial, since the section is about a measured pass. */
  gauge: `<path d="M4 17a8 8 0 1 1 16 0" /><path d="M12 17 15.5 10.5" /><circle cx="12" cy="17" r="1.25" />`,

  /** Decisions — a fork, one stem and two outcomes. */
  fork: `<path d="M12 21v-8" /><path d="M12 13 7 8" /><path d="m12 13 5-5" /><circle cx="5.6" cy="6.6" r="2" /><circle cx="18.4" cy="6.6" r="2" />`,

  /** How I lead — two figures, one behind the other. */
  people: `<circle cx="9.5" cy="8" r="3.2" /><path d="M3.5 19.5a6 6 0 0 1 12 0" /><path d="M16 5.4a3.2 3.2 0 0 1 0 5.2" /><path d="M17.4 14.4a6 6 0 0 1 3.1 4.4" />`,

  /** Career — a briefcase. */
  briefcase: `<rect x="3" y="7.5" width="18" height="12" rx="2.5" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" /><path d="M3 13h18" />`,

  /** Work — a grid of built things. */
  grid: `<rect x="3.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />`,

  /** Writing — a nib. */
  pen: `<path d="M4 20.5 4.9 17a2 2 0 0 1 .52-.92L16.1 5.4a2.2 2.2 0 0 1 3.1 3.1L8.5 19.2a2 2 0 0 1-.92.52Z" /><path d="m14.6 6.9 2.5 2.5" />`,

  /** Get in touch — an envelope. */
  mail: `<rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.8 7 8.2 5.8L20.2 7" />`,
} as const;

export type SectionIconName = keyof typeof SECTION_ICONS;

/**
 * Interface icons, kept apart from the section set because they are picked by
 * code rather than by an author and are never decorative — the theme toggle is
 * an icon-only control, so its icon carries the whole meaning and the button
 * supplies the accessible name.
 */
export const UI_ICONS = {
  sun: `<circle cx="12" cy="12" r="4" /><path d="M12 2.5v2" /><path d="M12 19.5v2" /><path d="m5.1 5.1 1.4 1.4" /><path d="m17.5 17.5 1.4 1.4" /><path d="M2.5 12h2" /><path d="M19.5 12h2" /><path d="m6.5 17.5-1.4 1.4" /><path d="m18.9 5.1-1.4 1.4" />`,

  moon: `<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5Z" />`,
} as const;

export type UiIconName = keyof typeof UI_ICONS;
