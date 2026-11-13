"use client";

import { useEffect } from "react";
import { useNarrative } from "@/lib/narrative";

/** La voz baja del aparato: avisa de que sigue ahí, o de que te has ido. */
export default function Whisper() {
  const whisper = useNarrative((s) => s.whisper);
  const hush = useNarrative((s) => s.hush);

  useEffect(() => {
    if (!whisper) return;
    const timer = window.setTimeout(hush, 4600);
    return () => window.clearTimeout(timer);
  }, [whisper, hush]);

  return (
    <div role="status" aria-live="polite">
      {whisper && (
        <p key={whisper.id} className="whisper">
          {whisper.text}
        </p>
      )}
    </div>
  );
}
