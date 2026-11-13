"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SceneManager from "@/components/experience/SceneManager";
import Calibration from "@/components/experience/scenes/00-Calibration";
import BigBrother from "@/components/experience/scenes/01-BigBrother";
import Diary from "@/components/experience/scenes/02-Diary";
import Doublethink from "@/components/experience/scenes/03-Doublethink";
import Room101 from "@/components/experience/scenes/04-Room101";
import FileScene from "@/components/experience/scenes/05-File";
import AudioToggle from "@/components/ui/AudioToggle";
import Cursor from "@/components/ui/Cursor";
import SceneIndex from "@/components/ui/SceneIndex";
import SkipLink from "@/components/ui/SkipLink";
import Whisper from "@/components/ui/Whisper";
import { useNarrative } from "@/lib/narrative";

// three y R3F viajan en un chunk aparte que se descarga durante la calibración.
const Telescreen = dynamic(() => import("@/components/canvas/Telescreen"), { ssr: false });

export default function Experience() {
  const powered = useNarrative((s) => s.powered);
  const webgl = useNarrative((s) => s.webgl);
  const reduced = useNarrative((s) => s.reduced);
  const [canvasReady, setCanvasReady] = useState(false);

  // El canvas se monta cuando el navegador queda libre tras la primera pintura,
  // o de inmediato si el visitante enciende antes.
  useEffect(() => {
    if (canvasReady) return;
    if (powered) {
      setCanvasReady(true);
      return;
    }
    const mount = () => setCanvasReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(mount, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(mount, 1200);
    return () => clearTimeout(timer);
  }, [powered, canvasReady]);

  return (
    <>
      <SkipLink />
      <Calibration />
      {canvasReady && webgl === true && !reduced && <Telescreen />}

      {/* Antes de <main> para que el silencio sea lo primero que alcanza el teclado. */}
      {powered && (
        <>
          <AudioToggle />
          <SceneIndex />
        </>
      )}

      <main id="experiencia" inert={!powered}>
        <BigBrother />
        <Diary />
        <Doublethink />
        <Room101 />
        <FileScene />
      </main>

      <SceneManager />
      {powered && <Cursor />}
      <Whisper />
    </>
  );
}
