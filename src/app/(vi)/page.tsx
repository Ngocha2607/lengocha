import type { Metadata } from "next";
import { HomePage, homeMetadata } from "../_shared/home";

/** `/` — the Vietnamese desktop with no window open. See _shared/home.tsx. */
export const metadata: Metadata = homeMetadata("vi");

export default function Home() {
  return <HomePage locale="vi" />;
}
