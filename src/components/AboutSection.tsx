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
          Hi there! I&apos;m Hà, a frontend engineer and tech lead with nearly
          five years of experience architecting and building large-scale web
          systems across EdTech and TravelTech. I specialize in React, Next.js,
          and TypeScript, with a deep focus on frontend architecture, performance
          optimization, and developer experience.
        </p>
        <p className="mb-4">
          Currently, I&apos;m a Frontend Tech Lead at{" "}
          <a
            className="font-medium text-slate-200 hover:text-teal-300 focus-visible:text-teal-300"
            href="https://sapp.edu.vn/"
            target="_blank"
            rel="noreferrer noopener"
          >
            SAPP Academy
          </a>
          , where I set the technical direction for the frontend across our
          product ecosystem. I designed and rolled out a Monorepo architecture
          with pnpm Workspace and Turborepo, migrated the LMS from Next.js 12 to
          Next.js 14 (App Router), and cut page load time by ~60% (15.2s → 6.1s)
          while raising the mobile Lighthouse score from 29 to 65+. I also build
          shared internal packages that improve reuse and standardize the
          developer experience across products.
        </p>
        <p className="mb-4">
          Previously, at{" "}
          <a
            className="font-medium text-slate-200 hover:text-teal-300 focus-visible:text-teal-300"
            href="https://tweetworldtravel.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Tweet World Travel Group
          </a>
          , I worked as a full-stack developer — building Spring Boot
          microservices and high-performance React/Next.js interfaces across five
          B2B/B2C e-commerce platforms serving ~1,000 users a month. Earlier, I
          built responsive web apps at Minastik (onsite at 3S Intersoft) and
          interned at{" "}
          <a
            className="font-medium text-slate-200 hover:text-teal-300 focus-visible:text-teal-300"
            href="https://www.fpt-software.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            FPT Software
          </a>
          .
        </p>
        <p className="mb-4">
          I care about the whole delivery pipeline, too — integrating security
          CI/CD (Gitleaks, Trivy, Semgrep, ZAP) and designing AI workflows that
          lift team productivity by ~30%. I hold a B.Eng in Electronics &amp;
          Telecommunications from Hanoi University of Science and Technology and
          published research at the REV-ECIT 2021 conference. Outside of work,
          you&apos;ll usually find me playing badminton, basketball, or billiards.
        </p>
      </div>
    </section>
  );
}
