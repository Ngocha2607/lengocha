"use client";

import { cn } from "@/lib/utils";
import { SECTION_PATHS, type SectionApp } from "@/lib/sections";
import { SITE_TITLE } from "@/lib/site";
import type { PortosAppId } from "@/types/portos";
import { WindowLink } from "./WindowLink";

interface DesktopIntroProps {
  /**
   * The H1 only while no window is open. A window that is open is the page
   * (it owns the URL and its own H1), and a page gets exactly one H1.
   */
  isPageHeading: boolean;
  onOpen: (app: PortosAppId) => void;
}

/** The sections the widget links to, in the order a first-time visitor wants them. */
const LINKS: { app: SectionApp; label: string }[] = [
  { app: "about", label: "About" },
  { app: "experience", label: "Experience" },
  { app: "projects", label: "Projects" },
  { app: "writing", label: "Writing" },
  { app: "contact", label: "Contact" },
];

/**
 * A desktop widget that says who this is: name and title as the page's H1, a
 * few sentences, and a link to each section.
 *
 * It exists for the visitors that see the server HTML and nothing else —
 * crawlers and AI agents that run no JavaScript. Before it, the home page said
 * a few dozen words to them, none of them a job title, and linked nowhere. It is real
 * visible text, not a hidden SEO block: everything in it is also something a
 * person sees on the desktop.
 *
 * The heading is the site title. The role, years and fields come from the About
 * window (the CV's own wording); the stack line is the owner's, supplied with
 * the "Fullstack Developer" title. Nothing here is a claim beyond those.
 *
 * The material — translucent black over a blur, a hairline white border — is
 * the one the dock tooltip, the folder hover plate and the logo menu already
 * share, so it reads as part of the desktop rather than a banner on top of it.
 * It sits behind every window (it is in the desktop layer, like the icons).
 */
export function DesktopIntro({ isPageHeading, onOpen }: DesktopIntroProps) {
  const Heading = isPageHeading ? "h1" : "p";

  return (
    <section
      aria-labelledby="desktop-intro-title"
      className={cn(
        "my-auto w-full rounded-[18px] border border-white/15 bg-black/25 p-4 text-white",
        "shadow-[0_8px_28px_rgba(0,0,0,0.25)] backdrop-blur-[14px]",
        // 440px: wide enough for the five links to sit on one row.
        "min-[810px]:w-[440px] min-[810px]:p-5",
      )}
    >
      <Heading
        id="desktop-intro-title"
        className="font-display text-[19px] leading-[24px] font-bold tracking-[-0.38px] min-[810px]:text-[22px] min-[810px]:leading-[28px] min-[810px]:tracking-[-0.44px]"
      >
        {SITE_TITLE}
      </Heading>
      <p className="font-sans mt-2 text-[13px] leading-[19px] text-white/80">
        Frontend Tech Lead tại SAPP Academy, gần 5 năm kinh nghiệm xây dựng và dẫn dắt hệ
        thống web trong lĩnh vực EdTech và TravelTech.
      </p>
      <p className="font-sans mt-2 text-[13px] leading-[19px] text-white/80">
        Frontend với React, Next.js, TypeScript; backend với NestJS và Spring Boot
        microservices; chuyển hạ tầng từ AWS sang CMC Cloud.
      </p>
      {/* Dropped on short phones (an iPhone SE), where the widget would
          otherwise run under the dock; the links below say the same thing. */}
      <p className="font-sans mt-2 text-[13px] leading-[19px] text-white/80 [@media(max-width:809px)_and_(max-height:719px)]:hidden">
        Portfolio này mở như một chiếc Mac: giới thiệu, kinh nghiệm, dự án, bài viết, CV và
        liên hệ nằm trong các thư mục và dock.
      </p>
      <nav aria-label="Các mục" className="mt-3">
        <ul className="flex flex-wrap gap-[6px]">
          {LINKS.map((link) => (
            <li key={link.app}>
              <WindowLink
                href={SECTION_PATHS[link.app]}
                onOpen={() => onOpen(link.app)}
                className={cn(
                  "font-sans block rounded-full border border-white/25 px-3 py-[3px] text-[12px] leading-[17px] text-white/90",
                  "transition-colors hover:border-white/50 hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none",
                  // Tap-target ergonomics, as with the Writing window's pills.
                  "max-[809px]:py-[7px]",
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
