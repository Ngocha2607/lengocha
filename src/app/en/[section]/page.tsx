import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sectionPageFromParam } from "@/lib/sections";
import { SectionPage, sectionMetadata, sectionStaticParams } from "../../_shared/section";

/** /en/about, /en/experience, … — a window page. See _shared/section.tsx. */
export const dynamicParams = false;

export function generateStaticParams() {
  return sectionStaticParams();
}

type Params = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const app = sectionPageFromParam((await params).section);
  return app ? sectionMetadata(app, "en") : {};
}

export default async function EnglishSectionPageRoute({ params }: Params) {
  const app = sectionPageFromParam((await params).section);
  if (!app) notFound();
  return <SectionPage app={app} locale="en" />;
}
