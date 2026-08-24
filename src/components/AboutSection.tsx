import { SectionHeading } from "@/components/SectionHeading";

const stats = [
  { value: "~5", label: "Years Experience" },
  { value: "5", label: "B2B/B2C Products" },
  { value: "1K+", label: "Monthly Users" },
  { value: "60%", label: "Faster Loads" },
  { value: "15", label: "LMS Routes Audited" },
  { value: "~30%", label: "AI Productivity" },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-labelledby="about-title"
    >
      <SectionHeading
        id="about"
        eyebrow="About"
        title="What I do, and the numbers behind it"
        lead="Nearly five years of frontend work in education and travel tech, the last two leading a team. In short: I build the web side of large products, make them faster, and set the standards the other engineers work to."
      />
      <div>
        <p className="mb-4">
          Hi there! I&apos;m Hà. I lead frontend at SAPP Academy, where I own
          the architecture of a learning platform students and teachers use
          every day — the technical direction, the coding standards, the code
          reviews, and two junior engineers. Before that, five B2B/B2C products
          at a travel group, working both the React frontend and the Spring Boot
          services behind it. React, Next.js and TypeScript are the day-to-day;
          architecture, performance and developer experience are the part
          I&apos;m actually hired for.
        </p>

        <ul className="mb-6 grid grid-cols-2 gap-4 border-y border-slate-800 py-5 sm:grid-cols-3">
          {stats.map((stat) => (
            <li key={stat.label}>
              <p className="text-2xl font-bold text-teal-300">{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>

        <div className="space-y-8">
          {/* Current */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-200">
              Frontend Tech Lead · SAPP Academy
            </h3>

            <ul className="list-disc space-y-2 pl-5 text-slate-400">
              <li>Led frontend architecture across the product ecosystem.</li>

              <li>
                Built a <strong>Monorepo</strong> with{" "}
                <strong>pnpm Workspace</strong> and <strong>Turborepo</strong>.
              </li>

              <li>
                Migrated the LMS from{" "}
                <strong>Next.js 12 → Next.js 14 (App Router)</strong>.
              </li>

              <li>
                Ran a performance pass across 15 LMS routes — took{" "}
                <code>/courses</code> from <strong>15.2s → 6.1s</strong> with
                Lighthouse Performance <strong>29 → 65</strong>, lifting the
                student route group to <strong>49 → 67</strong> —{" "}
                <a
                  className="font-medium text-slate-200 underline decoration-slate-600 underline-offset-2 hover:text-teal-300 hover:decoration-teal-300 focus-visible:text-teal-300"
                  href="#performance"
                >
                  the audit, and the fix I held back
                </a>
                .
              </li>

              <li>
                Replaced a <strong>per-seat TinyMCE licence</strong> with a
                custom <strong>Tiptap</strong> package across the monorepo. The
                editor sits in front of every student and teacher, so the bill
                tracked enrolment — the one number nobody can forecast a year
                out, and an unforecastable seat count is an unbudgetable line
                item.
              </li>
            </ul>
          </div>

          {/* Previous */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-200">
              Full-stack Developer · Tweet World Travel Group
            </h3>

            <ul className="list-disc space-y-2 pl-5 text-slate-400">
              <li>
                Developed Spring Boot microservices and high-performance React /
                Next.js applications.
              </li>

              <li>
                Delivered <strong>5 B2B/B2C products</strong> serving
                approximately <strong>1,000 monthly users</strong>.
              </li>
            </ul>
          </div>

          {/* Additional */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-200">
              Additional Highlights
            </h3>

            <ul className="list-disc space-y-2 pl-5 text-slate-400">
              <li>
                Integrated security CI/CD with Gitleaks, Trivy, Semgrep, and
                ZAP — gating{" "}
                <a
                  className="font-medium text-slate-200 underline decoration-slate-600 underline-offset-2 hover:text-teal-300 hover:decoration-teal-300 focus-visible:text-teal-300"
                  href="#performance"
                >
                  every merge request
                </a>
                .
              </li>

              <li>
                Designed AI workflows that improved engineering productivity by
                <strong> ~30%</strong>.
              </li>

              <li>
                B.Eng in Electronics & Telecommunications (HUST) · Published
                research at <strong>REV-ECIT 2021</strong>.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
