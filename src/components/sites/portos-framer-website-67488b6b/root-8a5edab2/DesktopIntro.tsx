"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { EN_DESKTOP_INTRO } from "@/i18n/en";
import { useLocale } from "@/i18n/LocaleProvider";
import type { DesktopIntroCopy } from "@/i18n/types";
import { cn } from "@/lib/utils";
import { pathForApp, type SectionApp } from "@/lib/sections";
import { SITE_TITLE } from "@/lib/site";
import { PORTOS_ASSETS, type PortosAppId } from "@/types/portos";
import { WindowLink } from "./WindowLink";

interface DesktopIntroProps {
  /**
   * The H1 only while no window is open. A window that is open is the page
   * (it owns the URL and its own H1), and a page gets exactly one H1.
   */
  isPageHeading: boolean;
  onOpen: (app: PortosAppId) => void;
}

/** The Vietnamese copy. The English is `EN_DESKTOP_INTRO` in src/i18n/en.ts. */
const VI_COPY: DesktopIntroCopy = {
  closeLabel: "Đóng phần giới thiệu",
  tagline: "Frontend Tech Lead tại SAPP Academy. React, Next.js, TypeScript, backend NestJS và cloud.",
  navLabel: "Các mục",
};

/** The sections the widget links to, in the order a first-time visitor wants them. */
const LINKS: { app: SectionApp; label: string }[] = [
  { app: "about", label: "About" },
  { app: "experience", label: "Experience" },
  { app: "projects", label: "Projects" },
  { app: "writing", label: "Writing" },
  { app: "contact", label: "Contact" },
];

/**
 * Whether the visitor has closed the widget, remembered across visits.
 *
 * Read through an external store so the server and the hydration render both
 * see "open" (the widget is ALWAYS in the server HTML, for the crawlers that
 * read nothing else), and the stored answer only applies after hydration.
 *
 * Storage can be unavailable (private windows, blocked site data) and every
 * access can throw, so each one is wrapped. `closedThisVisit` is the fallback:
 * without it, a visitor whose storage throws would click close and see nothing
 * happen.
 */
const STORAGE_KEY = "portos.desktopIntro.closed";
const storeListeners = new Set<() => void>();
let closedThisVisit = false;

function readStoredClosed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeToClosed(onChange: () => void): () => void {
  storeListeners.add(onChange);
  // Closing it in one tab closes it in the others.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    storeListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getClosed(): boolean {
  return closedThisVisit || readStoredClosed();
}

function getClosedServerSnapshot(): boolean {
  return false;
}

function closeIntro(): void {
  closedThisVisit = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Remembered for this visit only.
  }
  storeListeners.forEach((listener) => listener());
}

/**
 * A small desktop widget that says who this is: name and title as the page's
 * H1, one line on the role and stack, and a link to each section.
 *
 * It exists for the visitors that see the server HTML and nothing else —
 * crawlers and AI agents that run no JavaScript. Before it, the home page said
 * a few dozen words to them, none of them a job title, and linked nowhere. It
 * is real visible text, not a hidden SEO block: everything in it is also
 * something a person sees on the desktop.
 *
 * It started as a 440px card beside the folders, which the owner found
 * intrusive, so it is now widget-sized (300px, about half the area) and sits
 * out of the way: under the Experience folder at the desktop's right edge
 * from 810px, and at the top of the empty space between the folders and the
 * dock on a phone. DesktopShell places it; this file only draws it.
 *
 * The red light closes it, and that choice is remembered (see the store
 * above). Closing is the ONLY way it hides: it is never `display: none` on the
 * first render and never visually hidden, so the H1, the line and the five
 * links are always in the server HTML. Hiding it after hydration moves nothing
 * else on the page, because neither placement lets its size affect any other
 * element (see DesktopShell), so it costs no layout shift.
 *
 * The material — translucent black over a blur, a hairline white border — is
 * the one the dock tooltip, the folder hover plate and the logo menu already
 * share, so it reads as part of the desktop rather than a banner on top of it.
 * It sits behind every window (it is in the desktop layer, like the icons).
 */
export function DesktopIntro({ isPageHeading, onOpen }: DesktopIntroProps) {
  const closed = useSyncExternalStore(subscribeToClosed, getClosed, getClosedServerSnapshot);
  const locale = useLocale();
  if (closed) return null;
  const copy = locale === "en" ? EN_DESKTOP_INTRO : VI_COPY;

  const Heading = isPageHeading ? "h1" : "p";

  return (
    <section
      aria-labelledby="desktop-intro-title"
      className={cn(
        "w-full rounded-[14px] border border-white/15 bg-black/25 px-[14px] pt-3 pb-[14px] text-white",
        "shadow-[0_8px_28px_rgba(0,0,0,0.25)] backdrop-blur-[14px]",
        "min-[810px]:w-[300px]",
      )}
    >
      <div className="flex items-center gap-2">
        {/* The window close light, reused: the same red, the same 12px dot,
            the same × that appears on hover. On a phone the × is always shown
            (there is no hover to reveal it) and the invisible hit area grows
            to 32px, because a 12px dot is hopeless under a thumb. */}
        <button
          type="button"
          aria-label={copy.closeLabel}
          onClick={closeIntro}
          className={cn(
            "group/close relative size-3 shrink-0 rounded-full bg-[#fd5d5c]",
            "before:absolute before:-inset-[6px] before:content-[''] max-[809px]:before:-inset-[10px]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          )}
        >
          <Image
            src={`${PORTOS_ASSETS}/images/traffic-close.svg`}
            alt=""
            width={18}
            height={18}
            className={cn(
              "pointer-events-none absolute -inset-[3px] size-[18px] max-w-none opacity-0 transition-opacity duration-150",
              "group-hover/close:opacity-100 group-focus-visible/close:opacity-100 max-[809px]:opacity-100",
            )}
          />
        </button>
        <Heading
          id="desktop-intro-title"
          className="font-display min-w-0 text-[14px] leading-[19px] font-bold tracking-[-0.2px]"
        >
          {SITE_TITLE}
        </Heading>
      </div>
      <p className="font-sans mt-[6px] text-[12px] leading-[17px] text-white/80">
        {copy.tagline}
      </p>
      <nav aria-label={copy.navLabel} className="mt-[10px]">
        <ul className="flex flex-wrap gap-[5px]">
          {LINKS.map((link) => (
            <li key={link.app}>
              <WindowLink
                href={pathForApp(link.app, locale) ?? "/"}
                onOpen={() => onOpen(link.app)}
                className={cn(
                  "font-sans block rounded-full border border-white/25 px-[10px] py-[2px] text-[11px] leading-[16px] text-white/90",
                  "transition-colors hover:border-white/50 hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none",
                  // Tap-target ergonomics, as with the Writing window's pills.
                  "max-[809px]:px-3 max-[809px]:py-[6px] max-[809px]:text-[12px]",
                )}
              >
                {link.label}
              </WindowLink>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
