const stats = [
  { value: "~5", label: "Years Experience" },
  { value: "5", label: "B2B/B2C Products" },
  { value: "1K+", label: "Monthly Users" },
  { value: "60%", label: "Faster Loads" },
  { value: "2x", label: "Lighthouse Score" },
  { value: "~30%", label: "AI Productivity" },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-label="About me"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          About
        </h2>
      </div>
      <div>
        <p className="mb-4">
          Hi there! I&apos;m Hà, a Senior Frontend Engineer and Frontend Tech
          Lead with nearly 5 years of experience building scalable web
          applications across EdTech and TravelTech. I specialize in React,
          Next.js, TypeScript, frontend architecture, performance optimization,
          and developer experience.
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
                Reduced page load time by <strong>~60%</strong> (15.2s → 6.1s)
                and improved mobile Lighthouse from <strong>29 → 65+</strong>.
              </li>

              <li>
                Built shared internal packages to standardize developer
                experience.
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
                ZAP.
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
