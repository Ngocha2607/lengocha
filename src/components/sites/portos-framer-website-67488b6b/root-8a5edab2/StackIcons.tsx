/**
 * Brand marks for the "Stack" list in the About window.
 *
 * Drawn here rather than pulled from a package: the clone is deliberately free
 * of external asset hosts (verified — every runtime request is same-origin), and
 * `lucide-react`, the project's icon library, dropped brand logos years ago.
 * Adding `react-icons` or `simple-icons` for eight glyphs would be a heavy
 * dependency for something that renders at 16px.
 *
 * Fidelity varies by mark, and that is a deliberate trade:
 *   - React, Vercel and GitLab are drawn from the real construction (concentric
 *     ellipses, a triangle, and the tanuki's seven polygons), so they are
 *     essentially exact.
 *   - Next.js and TypeScript use stroked letterforms rather than `<text>`, so
 *     they never depend on a font being installed.
 *   - Docker, Spring and Turborepo are SIMPLIFIED silhouettes. At 16px the whale,
 *     the leaf and the gradient ring read correctly; do not enlarge them past
 *     ~24px and expect brand-accurate detail.
 *
 * All eight share a 24x24 viewBox so one size class governs them all.
 */

interface StackIconProps {
  className?: string;
}

const BASE = "shrink-0";

function ReactIcon({ className }: StackIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${BASE} ${className ?? ""}`} aria-hidden="true">
      <circle cx="12" cy="12" r="2.05" fill="#61DAFB" />
      <g fill="none" stroke="#61DAFB" strokeWidth="1">
        <ellipse cx="12" cy="12" rx="10.2" ry="3.9" />
        <ellipse cx="12" cy="12" rx="10.2" ry="3.9" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10.2" ry="3.9" transform="rotate(120 12 12)" />
      </g>
    </svg>
  );
}

function NextjsIcon({ className }: StackIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${BASE} ${className ?? ""}`} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#000000" />
      {/* Three strokes: up the left stem, down the diagonal, up the right stem. */}
      <path
        d="M8 17.2V6.8l8 10.4V6.8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TypeScriptIcon({ className }: StackIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${BASE} ${className ?? ""}`} aria-hidden="true">
      <rect width="24" height="24" rx="2" fill="#3178C6" />
      {/* T — two rects, so the crossbar and stem stay exactly square. */}
      <rect x="3.4" y="11.1" width="7.4" height="1.9" fill="#ffffff" />
      <rect x="6.2" y="11.1" width="1.9" height="7.7" fill="#ffffff" />
      {/* S — one stroked curve. */}
      <path
        d="M20.4 12.5c-.8-.6-1.8-.9-2.9-.9-1.7 0-3 .9-3 2.2 0 1.3.9 1.9 2.6 2.5 1.6.5 2.2 1 2.2 1.8 0 1-.9 1.6-2.1 1.6-1.2 0-2.2-.4-3-1.1"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpringIcon({ className }: StackIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${BASE} ${className ?? ""}`} aria-hidden="true">
      {/* Simplified leaf: a teardrop with the stem curling back under it. */}
      <path
        d="M20.4 2.9c-.4.9-.9 1.6-1.5 2.3A10.4 10.4 0 1 0 20.1 20a10.2 10.2 0 0 0 1.7-5.1c.3-3.7-.9-9.1-1.4-12zM5.7 19.3a1 1 0 1 1 .1-1.4 1 1 0 0 1-.1 1.4zm13.9-3c-2.6 3.5-8.2 2.3-11.8 2.5l-1.2.1c1-.4 1.8-.6 2.7-.9 1.6-.5 2.4-.6 3.5-1.2 2.7-1.3 5.4-4.4 6-7.6-1.1 3.1-4.3 5.8-7.1 6.8-2 .8-5.6 1.5-5.6 1.5l-.1-.1c-2.4-1.2-2.5-6.4 1.9-8.1 1.9-.8 3.8-.3 5.9-.9 2.2-.6 4.8-2.3 5.9-4.5 1.2 3.5 2.6 8.9.7 12.2z"
        fill="#6DB33F"
      />
    </svg>
  );
}

function TurborepoIcon({ className }: StackIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${BASE} ${className ?? ""}`} aria-hidden="true">
      <defs>
        {/* Static id: exactly one Turborepo icon renders per page, so there is
            nothing to collide with.

            `gradientUnits="userSpaceOnUse"` is required, not decorative. Without
            it a gradient defaults to `objectBoundingBox`, where the coordinates
            are fractions of the shape's box — so `x2="24"` would mean 24x the
            width, stretching the ramp so far that only its first colour is ever
            visible. The mark rendered flat pink until this was set. */}
        <linearGradient
          id="portos-turbo-gradient"
          gradientUnits="userSpaceOnUse"
          x1="2"
          y1="2"
          x2="22"
          y2="22"
        >
          <stop offset="0%" stopColor="#FF1E56" />
          <stop offset="100%" stopColor="#0096FF" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="9.9"
        fill="none"
        stroke="url(#portos-turbo-gradient)"
        strokeWidth="2.4"
      />
      <circle cx="12" cy="12" r="4.2" fill="url(#portos-turbo-gradient)" />
    </svg>
  );
}

function DockerIcon({ className }: StackIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${BASE} ${className ?? ""}`} aria-hidden="true">
      <g fill="#2496ED">
        {/* Container stack — six boxes in the whale's cargo. */}
        <rect x="6.1" y="10.5" width="2.6" height="2.4" rx="0.2" />
        <rect x="9.2" y="10.5" width="2.6" height="2.4" rx="0.2" />
        <rect x="12.3" y="10.5" width="2.6" height="2.4" rx="0.2" />
        <rect x="9.2" y="7.8" width="2.6" height="2.4" rx="0.2" />
        <rect x="12.3" y="7.8" width="2.6" height="2.4" rx="0.2" />
        <rect x="12.3" y="5.1" width="2.6" height="2.4" rx="0.2" />
        {/* Body and blowhole. */}
        <path d="M22.6 11.5c-.6-.4-1.9-.5-2.9-.3-.1-.9-.6-1.7-1.4-2.3l-.5-.4-.4.5c-.4.7-.5 1.7-.1 2.4.2.3.4.6.7.8-.5.3-1.3.4-1.8.4H2.3c-.3 1.5.1 3.4 1.3 4.7 1.3 1.3 3.1 2 5.4 2 5 0 8.7-2.3 10.4-6.5 1 .1 2.4 0 3-1.1z" />
      </g>
    </svg>
  );
}

function GitLabIcon({ className }: StackIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${BASE} ${className ?? ""}`} aria-hidden="true">
      {/* The tanuki is seven flat polygons — this is the real construction. */}
      <path fill="#E24329" d="M12 21.6 15.7 10.2H8.3z" />
      <path fill="#FC6D26" d="M12 21.6 8.3 10.2H3.1z" />
      <path fill="#FCA326" d="M3.1 10.2 2 13.7a.8.8 0 0 0 .3.9L12 21.6z" />
      <path fill="#E24329" d="M3.1 10.2h5.2L6.1 3.3a.4.4 0 0 0-.8 0z" />
      <path fill="#FC6D26" d="M12 21.6 15.7 10.2h5.2z" />
      <path fill="#FCA326" d="M20.9 10.2 22 13.7a.8.8 0 0 1-.3.9L12 21.6z" />
      <path fill="#E24329" d="M20.9 10.2h-5.2l2.2-6.9a.4.4 0 0 1 .8 0z" />
    </svg>
  );
}

function VercelIcon({ className }: StackIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${BASE} ${className ?? ""}`} aria-hidden="true">
      <path d="M12 2.4 22.8 21.6H1.2z" fill="#000000" />
    </svg>
  );
}

/** Every mark used by the Stack list, keyed by the label rendered beside it. */
export const STACK_ICONS = {
  React: ReactIcon,
  "Next.js": NextjsIcon,
  TypeScript: TypeScriptIcon,
  "Spring Boot": SpringIcon,
  Turborepo: TurborepoIcon,
  Docker: DockerIcon,
  "GitLab CI/CD": GitLabIcon,
  Vercel: VercelIcon,
} as const;

export type StackName = keyof typeof STACK_ICONS;
