"use client";

/** Served straight from `public/`, so the window works offline with the app. */
const RESUME_PDF = "/Le-Ngoc-Ha-Senior-Frontend-Developer.pdf";
const RESUME_FILENAME = "Le-Ngoc-Ha-Senior-Frontend-Developer.pdf";

/**
 * `#view=FitH` asks the browser's built-in viewer to fit the page to the window
 * width, which is what you want in an 864px frame. It is a hint, not a contract:
 * Chrome and Edge honour it, Firefox mostly does, and anything that ignores it
 * simply opens at its own default zoom.
 */
const VIEWER_SRC = `${RESUME_PDF}#view=FitH`;

const ACTION_CLASS =
  "font-sans rounded-full border border-black/15 px-3 py-[3px] text-[11px] leading-[16px] text-black/70 transition-colors hover:border-black/40 hover:text-black";

/**
 * Body of the "Resume" window — the CV itself, nothing else.
 *
 * COMPLETELY REPLACED, on request. The live site fills this window with eight
 * cards for the template author's design tools (Framer, Figma, Spline, Rive,
 * Raycast, Linear...), which has nothing to do with a resume and nothing to do
 * with this owner. See ARTIFACT_MANIFEST.md.
 *
 * Height is `calc(100% - 44px)`, not `h-full`. `WindowFrame` keeps its 44px title
 * bar INSIDE the scroll container as a `sticky` first child rather than overlaying
 * it, so a `h-full` body would be a full window tall, sit below a title bar that
 * is already taking 44px, and push the window into scrolling by exactly that much.
 * Subtracting it makes the two add up and the outer scrollbar never appears — the
 * PDF viewer does its own scrolling.
 *
 * Below 700px the embed is swapped for a plain panel. That is not a styling
 * preference: iOS Safari and most mobile browsers refuse to render a PDF inside
 * an iframe and paint an empty box instead, so on small screens the buttons ARE
 * the feature.
 */
export function ResumeWindow() {
  return (
    // `data-no-drag` on the whole body: this window is a document, so selecting
    // and scrolling inside it has to win over dragging the window around.
    <div data-no-drag className="bg-os-surface flex h-[calc(100%-44px)] w-full flex-col">
      {/* Viewer — `min-h-0` because a flex item's automatic minimum is its
          content height, which for an iframe is a 150px default that would stop
          `flex-1` from ever shrinking it to fit. */}
      <div className="min-h-0 flex-1">
        <iframe
          src={VIEWER_SRC}
          title="Lê Ngọc Hà — Senior Frontend Engineer, resume"
          className="hidden h-full w-full border-0 min-[700px]:block"
        />

        {/* Small-screen fallback — see the note above. */}
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center min-[700px]:hidden">
          <p className="font-display text-[16px] leading-[22.4px] tracking-[-0.16px] text-black">
            Résumé
          </p>
          <p className="font-sans max-w-[280px] text-[12px] leading-[16.8px] text-black/60">
            Mobile browsers cannot display a PDF inline. Open it in a new tab or save it.
          </p>
          <div className="flex items-center gap-2">
            <a href={RESUME_PDF} target="_blank" rel="noreferrer noopener" className={ACTION_CLASS}>
              Open ↗
            </a>
            <a href={RESUME_PDF} download={RESUME_FILENAME} className={ACTION_CLASS}>
              Download ↓
            </a>
          </div>
        </div>
      </div>

      {/* Status bar — the filename, and the two things anyone wants from a CV. */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-black/10 px-4 py-[7px]">
        <p className="font-sans truncate text-[11px] leading-[16px] text-black/45">
          {RESUME_FILENAME}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <a href={RESUME_PDF} target="_blank" rel="noreferrer noopener" className={ACTION_CLASS}>
            Open ↗
          </a>
          <a href={RESUME_PDF} download={RESUME_FILENAME} className={ACTION_CLASS}>
            Download ↓
          </a>
        </div>
      </div>
    </div>
  );
}
