import type { Metadata } from "next";
import { WritingListPage, writingListMetadata } from "../../_shared/writing-list";

/** `/writing` — the Writing list, Vietnamese. See _shared/writing-list.tsx. */
export const revalidate = 300;

export const metadata: Metadata = writingListMetadata("vi");

export default function WritingIndexPage() {
  return <WritingListPage locale="vi" />;
}
