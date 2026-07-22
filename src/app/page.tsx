import { SpotlightEffect } from "@/components/SpotlightEffect";
import { Header } from "@/components/Header";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { WritingSection } from "@/components/WritingSection";
import { Footer } from "@/components/Footer";
import { FloatingCTA } from "@/components/FloatingCTA";

// Revalidate the homepage hourly so newly published Notion posts appear in the
// Writing list without a redeploy (ISR).
export const revalidate = 3600;

export default function Home() {
  return (
    <SpotlightEffect>
      <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 font-sans md:px-12 md:py-16 lg:py-0">
        <div className="lg:flex lg:justify-between lg:gap-4">
          <Header />
          <main id="content" className="pt-24 lg:w-[52%] lg:py-24">
            <AboutSection />
            <ExperienceSection />
            <ProjectsSection />
            <WritingSection />
            <Footer />
          </main>
        </div>
      </div>
      <FloatingCTA />
    </SpotlightEffect>
  );
}
