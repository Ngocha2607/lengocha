"use client";

import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/**
 * "Are we past hydration yet?" as an external-store read — the lint-clean way
 * to branch on client-ness without a setState-in-effect.
 *
 * False on the server AND during the hydration render (React uses the server
 * snapshot there, so the markup matches), then true. A component that mounts
 * after hydration sees true on its very first render, which is what lets a
 * window opened later read `window` straight away while a window rendered on
 * the server waits one commit.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
