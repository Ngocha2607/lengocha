import { WorkspaceExplorer } from "@/components/WorkspaceExplorer";

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

      <p className="mb-6 text-sm leading-normal">
        Everything I&apos;ve shipped, laid out the way I lay out a workspace —
        products under <code className="text-teal-300">apps/</code>, the shared
        code that stops them drifting apart under{" "}
        <code className="text-teal-300">libs/</code>, the pipeline under{" "}
        <code className="text-teal-300">tooling/</code>. Different employers,
        one way of thinking about structure.
      </p>

      <WorkspaceExplorer />
    </section>
  );
}
