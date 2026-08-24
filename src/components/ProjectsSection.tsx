import { SectionHeading } from "@/components/SectionHeading";
import { WorkspaceExplorer } from "@/components/WorkspaceExplorer";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-labelledby="projects-title"
    >
      <SectionHeading
        id="projects"
        eyebrow="Projects"
        title="What I've shipped"
        lead="Every project, laid out the way a real codebase is organised rather than as a grid of cards. If you are not an engineer, open anything in the apps/ folder — those are the products people actually log into."
      />

      <p className="mb-6 text-sm leading-normal">
        Click a name on the left to open it. Products sit under{" "}
        <code className="text-teal-300">apps/</code>, the shared code that stops
        them drifting apart under <code className="text-teal-300">libs/</code>,
        the pipeline under <code className="text-teal-300">tooling/</code>.
        Different employers, one way of thinking about structure.
      </p>

      <WorkspaceExplorer />
    </section>
  );
}
