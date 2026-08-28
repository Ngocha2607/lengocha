"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion, runGenie } from "./genie";
import { PORTOS_ASSETS, type PortosAppId } from "@/types/portos";

interface WindowFrameProps {
  title: string;
  /** Hard-cornered window box, matching the live site's per-app size. */
  width: number;
  height: number;
  /** Distance from the top of the viewport. 68px for every window except Experience (89px). */
  top: number;
  /** Rendered at the right edge of the title bar (the Projects Masonry/Grid toggle). */
  titleBarAccessory?: React.ReactNode;
  /** The About window is the one window whose title uses Inter, not SF Pro Display. */
  titleFont?: "sf" | "inter";
  /** Which app this window is, so the genie knows which dock icon to aim at. */
  app?: PortosAppId;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
  children: React.ReactNode;
}

/**
 * The three traffic lights.
 *
 * Hover behaviour is measured from the live site and is easy to get wrong by
 * assuming macOS conventions:
 *
 * - **The light's colour does NOT change on hover.** Only the icon appears. The
 *   background stays on its base colour throughout (`rgb(253,93,92)` /
 *   `rgb(250,201,0)` / `rgb(52,199,90)` measured while each was hovered).
 * - The icon is revealed on that light's OWN hover, not on hovering the group —
 *   the other two stay empty. It renders 18x18 inside the 12x12 light, absolutely
 *   positioned at `inset: -3px`, so it overflows the dot on every side.
 *
 * CLICK behaviour is an intentional DIVERGENCE from the original. On the live site
 * all three lights simply close the window — yellow and green are not really
 * minimise and maximise (verified with real pointer clicks). Here, at the project
 * owner's request, green toggles a maximised state instead. Red and yellow still
 * close, matching the original.
 */
const TRAFFIC = [
  { key: "close", label: "Close", colour: "#fd5d5c", icon: "traffic-close.svg" },
  { key: "minimize", label: "Minimize", colour: "#fac900", icon: "traffic-minimize.svg" },
  { key: "maximize", label: "Maximize", colour: "#34c75a", icon: "traffic-maximize.svg" },
] as const;

/**
 * Height of the menu bar. A maximised window stops just below it, rather than
 * covering the whole viewport — otherwise the menu bar (z-index 5) would paint
 * over the window's own title bar (z-index 4) and bury the traffic lights, leaving
 * no way to un-maximise.
 */
const MENU_BAR_HEIGHT = 29;

/** How long the maximise / minimise / restore geometry change takes. */
const RESIZE_MS = 260;

/**
 * How wide the content column inside a window may grow, published to the body as
 * `--portos-content-max`.
 *
 * 824 is measured: an 864px window less its 2 x 20px padding, which is exactly
 * what the live site's content spans. Hard-coding it was fine until maximise
 * existed — the window then goes to 100vw while the content stays at 824 and
 * sits marooned in the middle. Measured at a maximised 1440px window: frame
 * 1440, outer container 1152, content 824, cards 404, with ~300px of dead space
 * either side.
 *
 * Maximised is `none`, not a bigger number. A first attempt used 1112 — what the
 * template's own `max-w-[1152px]` outer container resolves to — but that outer
 * container is a SECOND cap in the same chain, so the content still stopped
 * 164px short of each edge and the window still read as padded. Both caps now
 * read this one variable, so `none` releases the whole chain at once and the
 * only thing left holding the content in is the window's own 20px padding.
 *
 * At the normal size this changes nothing measurable: the window is 864 wide, so
 * the 1152 outer cap never bound anyway, and 824 is exactly 864 less padding.
 */
const CONTENT_MAX = "824px";
const CONTENT_MAX_MAXIMIZED = "none";

/**
 * Minimised windows keep this fraction of their original **area** — so 0.1 means
 * "shrunk by 90% of the original area", which is how the change was requested.
 *
 * Because it is an area ratio, the linear scale is its square root: at 0.1 a
 * 864x630 window renders at roughly 273x199. If the intent was instead to *keep*
 * 90% of the area, set this to 0.9 — that is the only change needed.
 */
const MINIMIZED_AREA_RATIO = 0.1;
const MINIMIZED_SCALE = Math.sqrt(MINIMIZED_AREA_RATIO);

/** Gap between a minimised window and the bottom-left corner of the viewport. */
const MINIMIZED_MARGIN = 16;

/**
 * Yellow and green each toggle their own mode against `normal`, so a maximised
 * window that is then minimised goes straight to minimised rather than stacking.
 */
type WindowMode = "normal" | "maximized" | "minimized";

/**
 * Open and close are the macOS genie — see `genie.ts` for why the warp cannot
 * be a keyframe, and for the cost of doing it with clones.
 *
 * This REPLACES the live site's own transition, which is worth recording since
 * the rest of this file is transcribed from it. That was a centred zoom + fade:
 * `scale(0.8) -> scale(1)` with `opacity 0 -> 1`, reversed on close, over
 * roughly 300ms. The 0.8 was measured rather than chosen — an 864x630 window
 * caught mid-animation renders at 691x504, and the 720x596 Experience window at
 * 576x476, both exactly 0.8 about the settled window's own centre. The duration
 * never could be read exactly: the live container declares `transition: all`
 * with no time or curve, and Framer drives it in a way that leaves
 * `getAnimations()` empty.
 *
 * The `portos-window-in` / `portos-window-out` keyframes that implemented it have
 * been removed from globals.css.
 *
 * That CSS carried a warning worth carrying forward: the entrance was written as
 * a keyframe precisely BECAUSE a JS-driven one left the window stuck invisible in
 * a background tab, where the document timeline stops. The genie is JS, so it
 * reintroduces that risk — see the wall-clock guard at the end of `runGenie`,
 * which un-hides the window even when the animation never advances.
 */

/**
 * Where a window collapses to, and unfolds out of.
 *
 * Preference order is deliberate. The dock icon that opens the window is the
 * macOS answer, but only six of the nine windows have one — About and
 * Experience are opened from desktop folders, so those fall back to their
 * folder icon, and anything still unmatched aims at the dock as a whole. The
 * viewport-bottom-centre last resort only fires if the dock has not mounted.
 */
function genieTargetRect(app: PortosAppId | undefined): DOMRect {
  const dockIcon = app ? document.querySelector(`[data-portos-app="${app}"]`) : null;
  if (dockIcon) return dockIcon.getBoundingClientRect();

  const dock = document.querySelector('[data-framer-name="Menu Bar"]');
  if (dock) {
    const r = dock.getBoundingClientRect();
    return new DOMRect(r.left + r.width / 2 - 38, r.top, 76, r.height);
  }
  return new DOMRect(window.innerWidth / 2 - 38, window.innerHeight - 76, 76, 76);
}



/**
 * macOS window chrome: a sticky 44px title bar and a hidden-scrollbar body. The
 * whole window is draggable (`cursor: grab`), not just the title bar.
 *
 * The 10px corner radius is a DEPARTURE from the live site, which had square
 * corners and no shadow — worth saying plainly, since the rest of this file is
 * transcribed from it. 10px is what macOS itself uses on a windowed app.
 *
 * It has to sit on the scrolling element, with `overflow-hidden` alongside it:
 * the title bar and the body both paint `#f7f7f7` right out to the edge, so
 * rounding a parent instead would leave square corners drawn over the curve.
 */
export function WindowFrame({
  title,
  width,
  height,
  top,
  titleBarAccessory,
  titleFont = "sf",
  app,
  onClose,
  onFocus,
  zIndex,
  children,
}: WindowFrameProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<WindowMode>("normal");
  const maximized = mode === "maximized";
  const minimized = mode === "minimized";
  // The genie clones this element, so it has to be the plain block that wraps
  // the chrome — not the positioned shell, whose `left:50%` would misplace a clone.
  const frameRef = useRef<HTMLDivElement>(null);
  // Hidden while a genie is in flight: the clones are what the eye follows, and
  // showing the real window at the same time would double it.
  const [warping, setWarping] = useState(!prefersReducedMotion());
  /**
   * Suppresses the shell's own width/height/top/transform transition for one
   * commit, so a mode change the genie has already animated does not get
   * animated a second time.
   *
   * Without it, minimising played the genie and then the old corner-shrink
   * immediately after, because `setMode` moves the same geometry the transition
   * is watching. A ref rather than state on purpose: it is read during the
   * render that `setMode` triggers, and clearing it must NOT cause another
   * render before paint, or the browser would see the geometry change with
   * transitions back on and animate it after all.
   */
  const geometryJump = useRef(false);
  useEffect(() => {
    geometryJump.current = false;
  });
  const closeRequested = useRef(false);
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

  // Entrance: unfold out of the dock icon. The window is laid out but hidden via
  // `visibility`, not `display`, so it still has the rect the genie measures.
  useEffect(() => {
    if (!warping) return;
    const source = frameRef.current;
    if (!source) {
      setWarping(false);
      return;
    }
    let live = true;
    void runGenie({
      source,
      target: genieTargetRect(app),
      direction: "out",
      onArrive: () => {
        if (live) setWarping(false);
      },
    });
    return () => {
      live = false;
    };
    // Runs once: `warping` starts true and is only ever set false from here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exit: collapse into the dock icon, then unmount. Reduced motion skips
  // straight to the unmount rather than holding an empty frame on screen.
  const requestClose = useCallback(() => {
    if (closeRequested.current) return;
    closeRequested.current = true;
    const source = frameRef.current;
    if (!source || prefersReducedMotion()) {
      onClose();
      return;
    }
    const target = genieTargetRect(app);
    setWarping(true);
    void runGenie({ source, target, direction: "in" }).then(onClose);
  }, [app, onClose]);

  // Green fills the desktop; yellow shrinks into the bottom-left corner. Each
  // toggles against `normal`. The drag offset is kept rather than cleared, so
  // restoring puts the window back where the user had dragged it.
  /**
   * Where a minimised window parks: bottom-left, MINIMIZED_MARGIN in from both
   * edges, at MINIMIZED_SCALE. Computed rather than measured because the genie
   * has to know the destination BEFORE the mode changes and the element moves.
   *
   * Minimise aims here rather than at the dock icon, and that is deliberate.
   * About and Experience have no dock icon — they open from desktop folders —
   * so a window that genied into the dock and vanished would have nothing left
   * to click. Parking it keeps every window recoverable.
   */
  const parkedRect = useCallback(
    () =>
      new DOMRect(
        MINIMIZED_MARGIN,
        window.innerHeight - MINIMIZED_MARGIN - height * MINIMIZED_SCALE,
        width * MINIMIZED_SCALE,
        height * MINIMIZED_SCALE,
      ),
    [height, width],
  );

  /**
   * The window's rect at full size, computed rather than measured, so restoring
   * never has to wait for a layout to settle. Mirrors what the shell's own
   * styles resolve to: centred on the viewport, offset by any drag, and capped
   * the same way `max-w-[calc(100vw-16px)]` caps it.
   */
  const normalRect = useCallback(() => {
    const w = Math.min(width, window.innerWidth - 16);
    return new DOMRect(window.innerWidth / 2 - w / 2 + offset.x, top + offset.y, w, height);
  }, [height, offset.x, offset.y, top, width]);

  const toggleMode = useCallback(
    (target: Exclude<WindowMode, "normal">) => {
      onFocus();
      // Only minimise and restore warp. Maximise already has its own geometry
      // transition, and a genie on top of it would fight that.
      if (target !== "minimized" || prefersReducedMotion() || !frameRef.current) {
        setMode((current) => (current === target ? "normal" : target));
        return;
      }
      const source = frameRef.current;
      const goingDown = mode !== "minimized";
      setWarping(true);
      if (goingDown) {
        // Collapse into the parking space, then take over there. `collapse: rect`
        // means the last frame already matches the parked window exactly, so the
        // swap under the still-visible bands is invisible.
        void runGenie({
          source,
          target: parkedRect(),
          direction: "in",
          collapse: "rect",
          onArrive: () => {
            geometryJump.current = true;
            setMode("minimized");
            setWarping(false);
          },
        });
        return;
      }
      // Restoring unfolds out of the parking space. The shell is put back to full
      // size straight away, jumping rather than transitioning, while still hidden
      // behind the bands; the rect it unfolds into is computed, not measured, so
      // nothing here waits on layout.
      const from = parkedRect();
      geometryJump.current = true;
      setMode("normal");
      void runGenie({
        source,
        target: from,
        direction: "out",
        collapse: "rect",
        sourceRect: normalRect(),
        onArrive: () => setWarping(false),
      });
    },
    [mode, normalRect, onFocus, parkedRect],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      onFocus();
      // Only a normal window is draggable: a maximised one fills the desktop, and
      // a minimised one is parked in the corner on purpose.
      if (mode !== "normal") return;
      // Let interactive controls inside the window keep their own behaviour.
      if ((event.target as HTMLElement).closest("[data-no-drag]")) return;
      drag.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: offset.x,
        originY: offset.y,
      };
      setDragging(true);
    },
    [mode, offset.x, offset.y, onFocus],
  );

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      setOffset({
        x: d.originX + (event.clientX - d.startX),
        y: d.originY + (event.clientY - d.startY),
      });
    };
    const up = () => {
      drag.current = null;
      setDragging(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  return (
    <div
      className={cn(
        "fixed left-1/2",
        maximized ? "max-w-none" : "max-w-[calc(100vw-16px)]",
        minimized
          ? "cursor-pointer"
          : maximized
            ? "cursor-default"
            : dragging
              ? "cursor-grabbing"
              : "cursor-grab",
      )}
      // At MINIMIZED_SCALE the 12px traffic lights render under 4px across, which
      // is not realistically clickable — without this the window could be
      // minimised and then never restored. Clicking anywhere on it restores.
      onClick={minimized ? () => toggleMode("minimized") : undefined}
      style={{
        // Maximised fills the desktop below the menu bar. Minimised keeps its own
        // width/height but is scaled down and parked bottom-left. In every mode the
        // element stays `left: 50%`, so only lengths change and the geometry can
        // transition smoothly instead of jumping.
        width: maximized ? "100vw" : width,
        // Published to the subtree so a window's content can widen when the frame
        // does. Without it maximise grows the chrome and leaves the content
        // stranded at its 824px measured cap. See CONTENT_MAX.
        "--portos-content-max": maximized ? CONTENT_MAX_MAXIMIZED : CONTENT_MAX,
        height: maximized ? `calc(100dvh - ${MENU_BAR_HEIGHT}px)` : height,
        top: maximized
          ? MENU_BAR_HEIGHT
          : minimized
            ? // Bottom edge sits MINIMIZED_MARGIN above the viewport floor. The
              // scale is anchored bottom-left, so the visible box grows upward
              // from here rather than from the element's unscaled top.
              `calc(100dvh - ${MINIMIZED_MARGIN}px - ${height}px)`
            : top,
        zIndex,
        // Anchoring the scale bottom-left keeps the minimised window pinned to the
        // corner. At scale(1) the origin has no visible effect, so it is safe to
        // leave set in every mode.
        transformOrigin: "0% 100%",
        // On THIS element `transform` is reserved for placement — centring, drag,
        // and the minimise scale. The open/close zoom lives on the inner wrapper
        // below, so the two can never fight: a keyframe setting `transform` here
        // would replace this whole value for the animation's duration, dropping
        // the -50% centring and making the window fly in from the right.
        transform: maximized
          ? "translate(-50%, 0)"
          : minimized
            ? // Put the element's left edge at MINIMIZED_MARGIN. It sits at 50vw
              // because of `left: 50%`, so shift it back by that much.
              `translate(calc(${MINIMIZED_MARGIN}px - 50vw), 0px) scale(${MINIMIZED_SCALE})`
            : `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
        // Do not transition while dragging, or the window lags behind the pointer.
        // Nor on a commit the genie has already animated: minimising otherwise
        // played the effect and then the old corner-shrink straight after it.
        transition:
          dragging || geometryJump.current
            ? undefined
            : `width ${RESIZE_MS}ms ease, height ${RESIZE_MS}ms ease, top ${RESIZE_MS}ms ease, transform ${RESIZE_MS}ms ease`,
        // The cast is for `--portos-content-max`: React's CSSProperties has no
        // index signature for custom properties, though it renders them fine.
      } as React.CSSProperties}
      onPointerDown={onPointerDown}
    >
      {/* Zoom + fade wrapper. Separate from the positioning element above so the
          animated `transform: scale()` composes with, rather than overwrites, the
          centring translate. `transform-origin` is the default centre, so the
          window grows and shrinks about its own middle. */}
      <div
        ref={frameRef}
        className="h-full w-full"
        style={{
          // Hidden rather than unmounted while a genie is in flight: the effect
          // measures and clones this element, so it has to keep its layout box.
          visibility: warping ? "hidden" : "visible",
        }}
      >
        <div className="portos-scroll h-full w-full overflow-hidden rounded-[10px] bg-[#f7f7f7]">
          {/* Title bar — sticky so it stays pinned while the body scrolls. */}
          <div className="sticky top-0 z-[1] flex h-11 shrink-0 items-center gap-4 bg-[#f7f7f7] p-3">
            {/* While minimised the lights are under 4px across, so they are taken
                out of the tab order and made click-through: the whole window is
                the restore target instead. */}
            <div
              className={cn("flex items-center gap-2", minimized && "pointer-events-none")}
              data-no-drag
            >
              {TRAFFIC.map((light) => (
                <button
                  key={light.key}
                  type="button"
                  tabIndex={minimized ? -1 : undefined}
                  aria-label={
                    light.key === "maximize"
                      ? maximized
                        ? "Restore"
                        : "Maximize"
                      : light.key === "minimize"
                        ? minimized
                          ? "Restore"
                          : "Minimize"
                        : light.label
                  }
                  aria-pressed={
                    light.key === "maximize"
                      ? maximized
                      : light.key === "minimize"
                        ? minimized
                        : undefined
                  }
                  onClick={
                    light.key === "maximize"
                      ? () => toggleMode("maximized")
                      : light.key === "minimize"
                        ? () => toggleMode("minimized")
                        : requestClose
                  }
                  className="portos-light relative size-3 shrink-0 rounded-full"
                  style={{ background: light.colour }}
                >
                  {/* 18x18 icon inside a 12x12 dot, so it overflows by 3px all round.
                      Hidden until this light itself is hovered. */}
                  <Image
                    src={`${PORTOS_ASSETS}/images/${light.icon}`}
                    alt=""
                    width={18}
                    height={18}
                    className="portos-light-icon pointer-events-none absolute -inset-[3px] size-[18px] max-w-none object-cover opacity-0"
                  />
                </button>
              ))}
            </div>
            <p
              className={cn(
                "truncate",
                titleFont === "inter"
                  ? "text-[16px] leading-[19.2px] text-[#86868b]"
                  : "font-display text-[14px] leading-[19.6px] tracking-[-0.14px] text-black/70",
              )}
            >
              {title}
            </p>
            {titleBarAccessory ? (
              <div className="ml-auto flex items-center" data-no-drag>
                {titleBarAccessory}
              </div>
            ) : null}
          </div>
          {children}
        </div>
      </div>
      <style>{`
        /* The icon is revealed by hovering that light alone — hovering the group
           does not reveal the other two, matching the live site. The dot's own
           colour is deliberately left alone: it does not change on hover there. */
        .portos-light-icon { transition: opacity 0.12s ease-out; }
        .portos-light:hover .portos-light-icon { opacity: 1; }
        .portos-light:focus-visible .portos-light-icon { opacity: 1; }
      `}</style>
    </div>
  );
}
