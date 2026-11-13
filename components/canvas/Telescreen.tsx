"use client";

import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import HalftoneField from "@/components/canvas/HalftoneField";
import { useNarrative } from "@/lib/narrative";

class CanvasBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * El único canvas de la pieza: fijo, detrás del DOM, sin eventos. Solo
 * renderiza mientras hay algo que mirar (escena 01 y el cierre).
 */
export default function Telescreen() {
  const active = useNarrative((s) => s.powered && (s.zoneIntro || s.zoneFinale));
  const setEnv = useNarrative((s) => s.setEnv);

  return (
    <div className="telescreen-canvas" aria-hidden="true">
      <CanvasBoundary onFail={() => setEnv({ webgl: false })}>
        <Canvas
          frameloop={active ? "always" : "never"}
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: true, depth: false, stencil: false, powerPreference: "high-performance" }}
          style={{ pointerEvents: "none" }}
        >
          <HalftoneField />
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
