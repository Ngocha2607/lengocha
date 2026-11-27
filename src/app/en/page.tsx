import type { Metadata } from "next";
import { HomePage, homeMetadata } from "../_shared/home";

/** `/en` — the English desktop with no window open. See _shared/home.tsx. */
export const metadata: Metadata = homeMetadata("en");

export default function EnglishHome() {
  return <HomePage locale="en" />;
}
