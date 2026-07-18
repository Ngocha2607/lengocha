"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/icons";

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
] as const;

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/Ngocha2607",
    Icon: GitHubIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ng%E1%BB%8Dc-h%C3%A0-l%C3%AA-886aa3228/",
    Icon: LinkedInIcon,
  },
  {
    label: "Email",
    href: "mailto:ngocha2k0.ln@gmail.com",
    Icon: MailIcon,
  },
] as const;

export function Header() {
  const [activeSection, setActiveSection] = useState<string>("about");

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -50% 0px" },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    },
    [],
  );

  return (
    <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[48%] lg:flex-col lg:justify-between lg:py-24">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">
          <Link href="/">Lê Ngọc Hà</Link>
        </h1>
        <h2 className="mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl">
          Senior Frontend Engineer | Frontend Tech Lead
        </h2>
        <p className="mt-2 text-sm font-medium tracking-wide text-teal-300">
          React • Next.js • TypeScript
        </p>
        <p className="mt-4 max-w-xs leading-normal">
          Building scalable frontend platforms focused on architecture,
          performance, and developer experience.
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-teal-300"
            aria-hidden="true"
          />
          Available for Remote
          <span className="text-slate-600">·</span>
          Hanoi, Vietnam
        </p>
        <nav className="nav hidden lg:block" aria-label="In-page jump links">
          <ul className="mt-16 w-max">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    className={`group flex items-center py-3${isActive ? " active" : ""}`}
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                  >
                    <span
                      className={`nav-indicator mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 motion-reduce:transition-none${isActive ? " !w-16 !bg-slate-200" : ""}`}
                    />
                    <span
                      className={`nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200${isActive ? " !text-slate-200" : ""}`}
                    >
                      {item.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <ul className="ml-1 mt-8 flex items-center" aria-label="Social media">
        {SOCIAL_LINKS.map(({ label, href, Icon }) => (
          <li key={label} className="mr-5 shrink-0 text-xs">
            <a
              className="block hover:text-slate-200"
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${label} (opens in a new tab)`}
              title={label}
            >
              <Icon />
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}
