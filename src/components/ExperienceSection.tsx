import { ArrowUpRightIcon, ArrowRightIcon } from "@/components/icons";

interface ExperienceEntry {
  period: string;
  title: string;
  url?: string;
  ariaLabel?: string;
  subtitles?: string[];
  description: string;
  tags: string[];
}

const experiences: ExperienceEntry[] = [
  {
    period: "2025 — Present",
    title: "Frontend Tech Lead · SAPP Academy",
    url: "https://sapp.edu.vn",
    ariaLabel: "Frontend Tech Lead at SAPP Academy (opens in a new tab)",
    description:
      "Lead the frontend technical direction and architecture across SAPP’s product ecosystem (LMS, Ops) — setting coding standards, reviewing 100% of merge requests, and mentoring two junior engineers. Designed a Monorepo with pnpm Workspace and Turborepo, migrated the LMS to Next.js 14 App Router, cut page load time by 60% (15.2s → 6.1s), and raised the mobile Lighthouse score from 29 to 65+. Built a shared Tiptap-based rich text editor package to replace TinyMCE — eliminating monthly subscription costs, improving code reuse, and standardizing the editing experience across products. Integrated a security pipeline (Gitleaks, Trivy, Semgrep, ZAP) and AI workflows that save the team ~10 hours per week.",
    tags: [
      "Next.js",
      "TypeScript",
      "Turborepo",
      "pnpm Workspace",
      "Tiptap",
      "Redux Toolkit",
      "Tailwind CSS",
    ],
  },
  {
    period: "2023 — 2025",
    title: "Fullstack Developer · Tweet World Travel Group",
    url: "https://tweetworldtravel.com",
    ariaLabel:
      "Fullstack Developer at Tweet World Travel Group (opens in a new tab)",
    description:
      "Built and maintained Spring Boot microservices and high-performance React/Next.js interfaces across five B2B/B2C e-commerce platforms and an internal multi-language ERP serving ~1,000 users a month. Applied SSR and resource-optimization strategies to cut page load from 3.2s to 1.1s (Lighthouse 85+), mentored three junior engineers, and reviewed every pull request before staging.",
    tags: [
      "Java",
      "Spring Boot",
      "Microservices",
      "React",
      "Next.js",
      "TypeScript",
      "Material UI",
    ],
  },
  {
    period: "2021 — 2023",
    title: "Frontend Developer · Minastik JSC",
    url: "https://www.minastik.com",
    ariaLabel: "Frontend Developer at Minastik JSC (opens in a new tab)",
    subtitles: ["Onsite at 3S Intersoft"],
    description:
      "Developed and maintained multiple React.js web applications, building responsive UIs and integrating RESTful APIs with the backend team. Optimized performance and code quality while working in an Agile/Scrum process. Key work included the UI/UX for EVN Hanoi’s power-management system modules.",
    tags: ["React.js", "Redux Toolkit", "RESTful API", "Ant Design", "Agile"],
  },
  {
    period: "2021",
    title: "Software Engineer Intern · FPT Software",
    url: "https://www.fpt-software.com",
    ariaLabel: "Software Engineer Intern at FPT Software (opens in a new tab)",
    description:
      "Built an employee-management application in C++ and learned core software-development best practices.",
    tags: ["C++"],
  },
  {
    period: "2018 — 2022",
    title: "B.Eng, Electronics & Telecommunications · HUST",
    url: "https://hust.edu.vn",
    ariaLabel:
      "Bachelor of Engineering at Hanoi University of Science and Technology (opens in a new tab)",
    description:
      "Advanced Program in Electronics & Telecommunications at Hanoi University of Science and Technology. Published research in the proceedings of the REV-ECIT 2021 conference.",
    tags: [],
  },
];

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-label="Work experience"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          Experience
        </h2>
      </div>
      <ol className="group/list">
        {experiences.map((experience) => (
          <li key={experience.title} className="mb-12">
            <div className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
              <header
                className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2"
                aria-label="period"
              >
                {experience.period}
              </header>
              <div className="z-10 sm:col-span-6">
                <h3 className="font-medium leading-snug text-slate-200">
                  {experience.url ? (
                    <a
                      className="group/link inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300"
                      href={experience.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={experience.ariaLabel}
                    >
                      <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                      <span>
                        {experience.title}
                        <ArrowUpRightIcon />
                      </span>
                    </a>
                  ) : (
                    <span className="inline-flex items-baseline font-medium leading-tight text-slate-200">
                      {experience.title}
                    </span>
                  )}
                </h3>
                {experience.subtitles && (
                  <div>
                    {experience.subtitles.map((subtitle) => (
                      <div
                        key={subtitle}
                        className="text-slate-500"
                        aria-hidden="true"
                      >
                        {subtitle}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-sm leading-normal">
                  {experience.description}
                </p>
                {experience.tags.length > 0 && (
                  <ul
                    className="mt-2 flex flex-wrap"
                    aria-label="Technologies used"
                  >
                    {experience.tags.map((tag) => (
                      <li key={tag} className="mr-1.5 mt-2">
                        <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                          {tag}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-12">
        <a
          className="group inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 font-semibold"
          href="/resume.pdf"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="View Full R&#233;sum&#233; (opens in a new tab)"
        >
          <span>
            View Full R&eacute;sum&eacute;
            <ArrowRightIcon />
          </span>
        </a>
      </div>
    </section>
  );
}
