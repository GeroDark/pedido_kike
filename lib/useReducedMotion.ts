import { useNarrative } from "@/lib/narrative";

/** `prefers-reduced-motion`, detectado una vez por SceneManager y compartido. */
export function useReducedMotion(): boolean {
  return useNarrative((s) => s.reduced);
}
