/**
 * The macOS genie: a window bending into a funnel as it is sucked toward a
 * point, and unfolding back out of it.
 *
 * WHY THIS IS NOT JUST A KEYFRAME. A genie is a NON-AFFINE warp — every
 * horizontal band of the window takes a different width and a different offset,
 * so the silhouette bends. CSS `transform` is an affine matrix: it scales,
 * rotates, skews and translates, but it cannot bend. No `@keyframes` on a single
 * element can produce this shape.
 *
 * So the window is cut into horizontal bands and each band is animated on its
 * own. Every band holds a full clone of the window, shifted up and clipped so
 * that only its own strip shows. That is the cost of the technique: while the
 * effect runs, the document holds SLICES copies of the window's subtree. They
 * are inert — no React, no listeners, `pointer-events: none` — and each gets its
 * own layer, so after the first frame the work is compositing rather than
 * layout. That first frame is the risk, and it is why SLICES is measured.
 */

/**
 * Horizontal bands. This is the one number that decides whether the effect is
 * smooth or drops frames, so it was measured rather than picked.
 *
 * The cost is the first frame: N deep clones inserted and laid out before
 * anything moves. Measured against the heaviest window (About, 147 nodes),
 * median of three runs each:
 *
 *   6 bands  12.4ms      10 bands  19.7ms      16 bands  22.8ms
 *   8 bands  13.1ms      12 bands  20.2ms
 *
 * A 60fps frame is 16.7ms, so 8 is the most bands that still fit. Ten and up
 * cost a dropped frame at the exact moment the window starts to move, which is
 * the most visible place to spend one. `contain: strict` on the clones was
 * tried and made no difference (20.6ms against 20.2ms at 12 bands).
 */
const SLICES = 8;

/** Total flight time, including the stagger. */
export const GENIE_MS = 420;

/**
 * How long the finished bands stay up after the caller has been told to bring
 * the real element back.
 *
 * The overlap is deliberate and invisible: an inward flight ends exactly on the
 * target rect and an outward one exactly on the window, so for these few frames
 * the clone and the real thing are drawn in the same place. Removing the overlay
 * first is what caused a flash. Three frames is enough for React to commit and
 * the browser to paint.
 */
const HANDOVER_MS = 48;

/**
 * How much of the flight is stagger. The funnel IS the stagger: at 0.55 the top
 * of the window has not begun to move until the bottom is more than half way
 * down, so mid-flight the shape necks. At 0 every band moves together and this
 * degrades into a plain affine shrink.
 */
const STAGGER = 0.55;

/** Sampled positions along the flight. Keyframes are cheap; only bands cost. */
const STEPS = 18;

export type GenieDirection = "in" | "out";

export interface GenieOptions {
  /** The element to warp. It is cloned, never moved. */
  source: HTMLElement;
  /** Where it collapses to, in viewport coordinates. */
  target: DOMRect;
  /** `in` collapses the window into the target; `out` unfolds it back. */
  direction: GenieDirection;
  /**
   * What the window becomes at the end of an inward flight.
   *
   * `point` converges every band on the target's centre, so the window narrows
   * to nothing. Right for closing, where it then disappears.
   *
   * `rect` lands it as a scaled copy filling the target instead. Minimise needs
   * this: a real, parked window takes over the moment the effect ends, and
   * against a `point` finish that swap is a visible jump from a thin sliver to a
   * whole small window.
   */
  collapse?: "point" | "rect";
  /**
   * Overrides the rect read off `source`.
   *
   * Restoring a minimised window needs this. The element is still parked when
   * the effect is set up, and putting it back is not instantaneous — the shell
   * carries a CSS transition on width, height, top and transform, so measuring
   * straight after the state change returns the parked geometry mid-transition,
   * not the full size being unfolded into.
   *
   * Waiting a frame was the obvious fix and the wrong one: `requestAnimationFrame`
   * is throttled, and in a hidden tab suspended, which is the very failure this
   * component was warned about. Passing the rect computed rather than measured
   * removes the timing question altogether.
   */
  sourceRect?: DOMRect;
  /**
   * Fired the moment the bands land, while they are all still on screen.
   *
   * This is where the caller un-hides the real element. Doing it from the
   * returned promise instead leaves a hole: the overlay is already gone and the
   * window is not back yet, so one frame paints neither and it reads as a flash.
   * Handing over under cover of the last frame, and only then tearing the
   * overlay down, keeps something on screen throughout.
   */
  onArrive?: () => void;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A band as a TRAPEZOID rather than a rectangle, which is what stops the funnel
 * looking like a staircase.
 *
 * Scaling a band by one factor gives it a single width down its whole height, so
 * neighbouring bands meet at a visible step. At eight bands those steps ARE the
 * silhouette — the first version of this read as stacked blocks, not a bending
 * sheet. What is needed is a width that varies WITHIN each band, from `sTop` at
 * its top edge to `sBottom` at its bottom, so every band picks up exactly where
 * the one above it left off.
 *
 * An affine matrix cannot do that; a projective one can. `matrix3d` carries a
 * perspective term and CSS divides by w after transforming, so putting y into w
 * makes the horizontal scale fall away down the band:
 *
 *   x' = (a·x + c·y) / (1 + h·y)      y' = (f·y) / (1 + h·y)
 *
 * Solving at the two edges gives 1 + h·H = sTop/sBottom, which fixes h; f and c
 * then follow from the band's target height and how far its centreline drifts.
 * The taper is hyperbolic rather than straight-sided, which is what a real genie
 * does anyway — that one is a perspective effect too.
 *
 * `transform-origin` is the band's top centre, so x is measured from the
 * centreline and y from the top edge, which is what these formulae assume.
 */
function trapezoid(
  bandHeight: number,
  sTop: number,
  sBottom: number,
  destHeight: number,
  centreDrift: number,
): string {
  // A fully collapsed band would divide by zero; hold it just above.
  const ratio = Math.min(sTop / Math.max(sBottom, 1e-4), 1e4);
  const h = (ratio - 1) / bandHeight;
  const f = (destHeight * ratio) / bandHeight;
  const c = (centreDrift * ratio) / bandHeight;
  // Column-major: these are the four columns of the 4x4.
  return `matrix3d(${sTop},0,0,0, ${c},${f},0,${h}, 0,0,1,0, 0,0,0,1)`;
}
/** Smoothstep. Keeps the bands from starting and stopping abruptly. */
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * How far along its journey the point at `yNorm` (0 = window top, 1 = bottom) is
 * when the flight as a whole is at `p`.
 *
 * This is the whole trick, and why the bands stay joined. Progress is a
 * CONTINUOUS function of y, so two bands meeting at some y agree exactly on
 * where that edge has got to — band i's bottom lands where band i+1's top does,
 * at every frame. An earlier attempt gave each band a single shared destination
 * and scaled it about its own centre; the bands drifted apart and it read as
 * loose strips rather than one bending sheet.
 */
function progressAt(yNorm: number, p: number): number {
  const start = (1 - yNorm) * STAGGER;
  return ease(Math.min(Math.max((p - start) / (1 - STAGGER), 0), 1));
}

export function runGenie({
  source,
  target,
  direction,
  collapse = "point",
  sourceRect,
  onArrive,
}: GenieOptions): Promise<void> {
  const rect = sourceRect ?? source.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return Promise.resolve();

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText =
    "position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;" +
    "z-index:2147483000;contain:layout style paint";

  const bandH = rect.height / SLICES;
  const targetCX = target.left + target.width / 2;
  const targetCY = target.top + target.height / 2;
  const rectCX = rect.left + rect.width / 2;
  const minScaleX = Math.max(target.width / rect.width, 0.02);
  const animations: Animation[] = [];

  for (let i = 0; i < SLICES; i++) {
    const srcTop = i * bandH;
    const band = document.createElement("div");
    // The band IS its strip — positioned and sized to it, with the clone pushed
    // up inside so the right slice shows. `transform-origin` at the strip's top
    // centre is what makes the maths below hold.
    band.style.cssText =
      `position:absolute;left:${rect.left}px;top:${rect.top + srcTop}px;` +
      `width:${rect.width}px;height:${bandH}px;overflow:hidden;` +
      "transform-origin:50% 0;will-change:transform;backface-visibility:hidden";

    const clone = source.cloneNode(true) as HTMLElement;
    clone.style.cssText +=
      `;position:absolute;left:0;top:${-srcTop}px;width:${rect.width}px;` +
      `height:${rect.height}px;margin:0;visibility:visible;transform:none;animation:none;transition:none`;
    band.appendChild(clone);
    overlay.appendChild(band);

    const yTop = i / SLICES;
    const yBottom = (i + 1) / SLICES;
    const frames: Keyframe[] = [];
    for (let k = 0; k < STEPS; k++) {
      const p = k / (STEPS - 1);
      const qTop = progressAt(yTop, p);
      const qBottom = progressAt(yBottom, p);
      // Where this strip's own two edges have got to. Under `rect` the strip
      // keeps its share of the target's height, so the window stays a window;
      // under `point` every strip aims at the same spot and it closes up.
      const endTop =
        collapse === "rect" ? target.top + (srcTop / rect.height) * target.height : targetCY;
      const endBottom =
        collapse === "rect"
          ? target.top + ((srcTop + bandH) / rect.height) * target.height
          : targetCY;
      const destTop = lerp(rect.top + srcTop, endTop, qTop);
      const destBottom = lerp(rect.top + srcTop + bandH, endBottom, qBottom);
      // Width and centreline are read at BOTH edges of the band, never averaged
      // across it — averaging is what produced the staircase.
      const sTop = lerp(1, minScaleX, qTop);
      const sBottom = lerp(1, minScaleX, qBottom);
      const cTop = lerp(0, targetCX - rectCX, qTop);
      const cBottom = lerp(0, targetCX - rectCX, qBottom);
      const ty = destTop - (rect.top + srcTop);
      frames.push({
        offset: p,
        transform:
          `translate(${cTop.toFixed(2)}px, ${ty.toFixed(2)}px) ` +
          trapezoid(bandH, sTop, sBottom, Math.max(destBottom - destTop, 0.01), cBottom - cTop),
      });
    }

    animations.push(
      band.animate(direction === "in" ? frames : [...frames].reverse().map((f, k) => ({
        ...f,
        offset: k / (STEPS - 1),
      })), {
        duration: GENIE_MS,
        // Linear: every curve this effect needs is already baked into the
        // sampled frames, and layering another one on top would double-ease it.
        easing: "linear",
        fill: "both",
      }),
    );
  }

  document.body.appendChild(overlay);

  const done = Promise.all(animations.map((a) => a.finished.catch(() => undefined)));
  // A backgrounded tab freezes the document timeline, so `finished` may never
  // settle and the caller would be left holding a hidden window forever. The
  // timer is wall-clock, so it resolves either way.
  const guard = new Promise<void>((resolve) => window.setTimeout(resolve, GENIE_MS + 120));
  return Promise.race([done, guard]).then(() => {
    onArrive?.();
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        for (const a of animations) a.cancel();
        overlay.remove();
        resolve();
      }, HANDOVER_MS);
    });
  });
}
