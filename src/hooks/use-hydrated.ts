"use client";

import { useSyncExternalStore } from "react";
import { useProgress } from "@/stores/progress";

const subscribe = (onChange: () => void) =>
  useProgress.persist.onFinishHydration(onChange);
const getSnapshot = () => useProgress.persist.hasHydrated();
const getServerSnapshot = () => false;

/**
 * True once the persisted progress store has been read back from localStorage.
 * Render the server-safe value until then so SSR and the client agree.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
