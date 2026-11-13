"use client";

import { copy } from "@/content/copy.es";
import { audio } from "@/lib/audio";
import { useNarrative } from "@/lib/narrative";

/** Siempre visible. El sonido nunca empieza solo y siempre se puede callar. */
export default function AudioToggle() {
  const on = useNarrative((s) => s.audioOn);
  const setAudio = useNarrative((s) => s.setAudio);

  const toggle = () => {
    if (on) {
      audio.mute();
      setAudio(false);
      return;
    }
    const ok = audio.unmute();
    if (ok) audio.setScene(useNarrative.getState().scene);
    setAudio(ok);
  };

  return (
    <button
      type="button"
      className="hud kicker right-3 top-3 p-2 md:right-6 md:top-5"
      aria-pressed={on}
      aria-label={copy.ui.soundLabel}
      onClick={toggle}
    >
      <span aria-hidden="true">{on ? copy.ui.soundOn : copy.ui.soundOff}</span>
    </button>
  );
}
