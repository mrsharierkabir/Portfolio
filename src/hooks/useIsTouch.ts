"use client";
import { useSyncExternalStore } from "react";

const q = "(hover: none), (pointer: coarse)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(q);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
export function useIsTouch() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(q).matches, () => false);
}
