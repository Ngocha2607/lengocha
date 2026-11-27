"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

/**
 * A real link that opens a window in place.
 *
 * Every icon, card and menu entry that opens a window used to be a `<button>`,
 * which left the site with no crawlable internal links at all. This renders an
 * ordinary `<a href>` to the window's own URL — so crawlers, "open in new tab",
 * middle-click and copy-link all work — and intercepts only the plain left
 * click, which opens the window without leaving the desktop.
 *
 * Why the click is intercepted rather than navigated: a router navigation
 * between two routes remounts the whole desktop and replays the pre-loader,
 * when all that should change is which window is open. The shell keeps the
 * address bar in step itself (see DesktopShell).
 *
 * `prefetch={false}` because nothing ever navigates through these: in the App
 * Router that switches prefetching off entirely, so a desktop full of links
 * does not fetch a dozen route payloads in the background. `draggable={false}`
 * keeps a mouse drag on a desktop icon from lifting a link ghost, which a
 * button never did.
 */
export function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

type WindowLinkProps = Omit<ComponentProps<typeof Link>, "onClick" | "prefetch"> & {
  /** Opens the window. Called instead of navigating, for plain left clicks only. */
  onOpen: () => void;
};

export function WindowLink({ onOpen, ...props }: WindowLinkProps) {
  return (
    <Link
      prefetch={false}
      draggable={false}
      {...props}
      onClick={(event) => {
        if (!isPlainLeftClick(event)) return;
        event.preventDefault();
        onOpen();
      }}
    />
  );
}
