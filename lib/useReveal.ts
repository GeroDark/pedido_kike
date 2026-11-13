import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Revela una sola vez los elementos `[data-reveal]` de una escena cuando
 * entran en pantalla. El estado oculto inicial está en CSS y la detección es
 * un único IntersectionObserver: ni una lectura de layout. Con movimiento
 * reducido es solo un fundido.
 */
export function useReveal(root: RefObject<HTMLElement | null>): void {
  const reduced = useReducedMotion();

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: reduced ? 0.4 : 1,
            ease: "expo.out",
            overwrite: true,
          });
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    scope.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reduced, root]);
}
