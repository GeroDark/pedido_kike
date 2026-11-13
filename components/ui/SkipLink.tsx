"use client";

import { copy } from "@/content/copy.es";
import { useNarrative } from "@/lib/narrative";

/** Primer elemento enfocable: salta la calibración y entra sin sonido. */
export default function SkipLink() {
  const powered = useNarrative((s) => s.powered);
  const power = useNarrative((s) => s.power);
  if (powered) return null;

  return (
    <a
      href="#experiencia"
      className="skip-link sr-only-focusable"
      onClick={(event) => {
        event.preventDefault();
        power(false);
      }}
    >
      {copy.ui.skipIntro}
    </a>
  );
}
