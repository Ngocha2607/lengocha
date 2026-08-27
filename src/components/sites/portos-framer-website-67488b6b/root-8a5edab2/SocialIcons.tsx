/**
 * Monochrome brand glyphs for the Contact window's social row.
 *
 * `lucide-react` — the project's icon library — carries no brand marks at all
 * (5,814 exports, not one of them GitHub or LinkedIn), so these two are drawn
 * here. Everything else in that column uses lucide.
 *
 * Deliberately different from `dock-github.svg` / `dock-linkedin.svg`, which are
 * full-colour rounded-square app badges built for a 76px dock slot. At 13px
 * beside a line of text a badge reads as a smudge, so these are bare glyphs in
 * `currentColor` — they inherit the link's colour and its hover transition for
 * free.
 */

interface SocialIconProps {
  className?: string;
}

export function GitHubGlyph({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function LinkedInGlyph({ className }: SocialIconProps) {
  return (
    // The bare "in" letterform rather than the filled badge: a knocked-out badge
    // needs a second colour to punch the letters through, which cannot be done
    // in `currentColor` alone.
    <svg viewBox="0 0 23 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6 1.12 6 0 4.88 0 3.5 0 2.12 1.12 1 2.49 1c1.38 0 2.49 1.12 2.49 2.5zM.22 8h4.53v14.5H.22V8zm7.2 0h4.34v1.98h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.43 3.01 5.43 6.93v7.93h-4.53v-7.03c0-1.68-.03-3.84-2.34-3.84-2.34 0-2.7 1.83-2.7 3.72v7.15H7.42V8z" />
    </svg>
  );
}
