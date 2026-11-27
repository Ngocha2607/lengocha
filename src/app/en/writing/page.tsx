import type { Metadata } from "next";
import { WritingListPage, writingListMetadata } from "../../_shared/writing-list";

/**
 * `/en/writing` — the Writing list with English titles and summaries, every
 * card linking to its Vietnamese article. There is no /en/writing/<slug>.
 * See _shared/writing-list.tsx.
 */
export const revalidate = 300;

export const metadata: Metadata = writingListMetadata("en");

export default function EnglishWritingIndexPage() {
  return <WritingListPage locale="en" />;
}
