import Image from "next/image";
import { ArrowUpRightIcon } from "@/components/icons";

interface Project {
  title: string;
  period: string;
  url?: string;
  image: string;
  imageAlt: string;
  description: string;
  tags: string[];
}

const projects: Project[] = [
  {
    title: "LMS Platform · SAPP Academy",
    period: "2025 — Present",
    url: "https://sapp.edu.vn",
    image: "/images/projects/lms-platform.png",
    imageAlt: "SAPP Academy learning-management system dashboard",
    description:
      "Large-scale online learning-management system; led the frontend technical direction, Monorepo architecture, and performance overhaul.",
    tags: [
      "Next.js 14",
      "Monorepo",
      "Ant Design",
      "Tailwind CSS",
      "Redux Toolkit",
      "React Hook Form",
    ],
  },
  {
    title: "Subscriber Platform · Tweet World Travel",
    period: "2023 — 2025",
    url: "https://tweetworldtravel.tkgplatform.com.au/",
    image: "/images/projects/subscriber-platform.png",
    imageAlt: "Tweet World Travel subscriber management platform interface",
    description:
      "Travel-business management platform serving ~1,000 users a month, powered by Spring Boot microservices and a React + Material UI frontend.",
    tags: ["Spring Boot", "Microservices", "React", "Material UI"],
  },
  {
    title: "Website B2B & B2C · Tweet World Travel",
    period: "2023 — 2024",
    url: "https://tweetworldtravel.com",
    image: "/images/projects/website-b2b.png",
    imageAlt: "Tweet World Travel B2B and B2C e-commerce website homepage",
    description:
      "Multi-language e-commerce platform with authentication, global state, and payment integration; cut page load from 3.2s to 1.1s (Lighthouse 85+).",
    tags: ["Next.js 14", "Zustand", "TypeScript", "Tailwind CSS", "Shadcn/ui"],
  },
  {
    title: "Newsletter System · Tweet World Travel",
    period: "2023 — 2024",
    image: "/images/projects/newsletter.png",
    imageAlt: "Drag-and-drop email newsletter builder interface",
    description:
      "Drag-and-drop email builder and subscriber-management system.",
    tags: ["React.js", "GrapeJS", "Laravel API"],
  },
  {
    title: "EVN — Hanoi Power Company · 3S Intersoft",
    period: "2022 — 2023",
    url: "https://3si.vn/en/",
    image: "/images/projects/evn.png",
    imageAlt: "EVN Hanoi power-management system module interface",
    description:
      "Built the UI/UX for power-management system modules; API integration and source-code optimization.",
    tags: [".NET Core API", "React.js", "Redux Toolkit", "Ant Design"],
  },
];

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-label="Selected projects"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          Projects
        </h2>
      </div>
      <ul className="group/list">
        {projects.map((project) => (
          <li key={project.title} className="mb-12">
            <div className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
              <div className="order-1 sm:order-none sm:col-span-2">
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  width={1912}
                  height={912}
                  sizes="(min-width: 640px) 200px, 100vw"
                  className="h-auto w-full rounded border-2 border-slate-200/10 transition group-hover:border-slate-200/30 sm:translate-y-1"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="z-10 sm:col-span-6">
                <p className="z-10 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {project.period}
                </p>
                <h3 className="font-medium leading-snug text-slate-200">
                  {project.url ? (
                    <a
                      className="group/link inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300"
                      href={project.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${project.title} (opens in a new tab)`}
                    >
                      <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block" />
                      <span>
                        {project.title}
                        <ArrowUpRightIcon />
                      </span>
                    </a>
                  ) : (
                    <span className="inline-flex items-baseline font-medium leading-tight text-slate-200">
                      {project.title}
                    </span>
                  )}
                </h3>
                <p className="mt-2 text-sm leading-normal">
                  {project.description}
                </p>
                {project.tags.length > 0 && (
                  <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
                    {project.tags.map((tag) => (
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
      </ul>
    </section>
  );
}
