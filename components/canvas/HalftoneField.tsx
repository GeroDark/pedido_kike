"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildField } from "@/components/canvas/field";
import { fragmentShader, vertexShader } from "@/components/canvas/shaders";
import { useNarrative } from "@/lib/narrative";
import { stage } from "@/lib/session";

const PAPER = new THREE.Vector3(0xe7 / 255, 0xe1 / 255, 0xd3 / 255);
const PHOSPHOR = new THREE.Vector3(0x7c / 255, 0xff / 255, 0x6b / 255);

export default function HalftoneField() {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const setYou = useNarrative((s) => s.setYou);

  const field = useMemo(() => buildField(width, height), [width, height]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(field.position, 3));
    g.setAttribute("aCity", new THREE.BufferAttribute(field.city, 3));
    g.setAttribute("aMisc", new THREE.BufferAttribute(field.misc, 3));
    return g;
  }, [field]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uRes: { value: new THREE.Vector2(1, 1) },
          uFace: { value: new THREE.Vector3(0, 0, 1) },
          uGaze: { value: new THREE.Vector2(0, 0) },
          uBlink: { value: 0 },
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uPitch: { value: 10 },
          uDpr: { value: 1 },
          uAlpha: { value: 0 },
          uPaper: { value: PAPER },
          uPhosphor: { value: PHOSPHOR },
        },
      }),
    [],
  );

  useEffect(() => {
    setYou(field.you);
    return () => geometry.dispose();
  }, [field, geometry, setYou]);

  useEffect(() => () => material.dispose(), [material]);

  const eye = useRef({ gx: 0, gy: 0, sx: 0, sy: 0, nextSaccade: 1.5, blinkAt: -10, nextBlink: 2.2, alpha: 0, closed: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const u = material.uniforms;
    const e = eye.current;
    const { face } = field;

    // La mirada: sigue al puntero con retardo, nunca del todo quieta.
    let tx = Math.sin(t * 0.21) * 0.035;
    let ty = -0.012;
    if (stage.hasPointer) {
      const dx = (stage.px - face.cx) / face.s;
      const dy = (face.cy - stage.py) / face.s;
      const len = Math.hypot(dx, dy) || 1;
      const k = Math.min(len * 0.75, 1) / len;
      tx = dx * k * 0.108;
      ty = dy * k * 0.042;
    }
    if (t > e.nextSaccade) {
      e.sx = (Math.random() - 0.5) * 0.012;
      e.sy = (Math.random() - 0.5) * 0.006;
      e.nextSaccade = t + 0.6 + Math.random() * 2.2;
    }
    const follow = 1 - Math.exp(-dt * 4.2);
    e.gx += (tx + e.sx - e.gx) * follow;
    e.gy += (ty + e.sy - e.gy) * follow;

    // Parpadeo irregular; a veces doble.
    if (t > e.nextBlink) {
      e.blinkAt = t;
      e.nextBlink = t + (Math.random() < 0.18 ? 0.34 : 2.6 + Math.random() * 4.4);
    }
    const phase = (t - e.blinkAt) / 0.17;
    const blink = phase >= 0 && phase < 1 ? Math.sin(phase * Math.PI) : 0;

    // En el final los ojos están cerrados: no hay nadie mirando.
    e.closed += ((stage.finale ? 1 : 0) - e.closed) * (1 - Math.exp(-dt * 6));
    const targetAlpha = stage.finale ? stage.finaleAlpha : stage.alpha;
    e.alpha += (targetAlpha - e.alpha) * (1 - Math.exp(-dt * 7));

    u.uRes.value.set(state.size.width, state.size.height);
    u.uFace.value.set(face.cx, face.cy, face.s);
    u.uGaze.value.set(e.gx, e.gy);
    u.uBlink.value = Math.max(blink, e.closed);
    u.uMorph.value = stage.finale ? 0 : stage.morph;
    u.uTime.value = t;
    u.uPitch.value = field.pitch;
    u.uDpr.value = state.viewport.dpr;
    u.uAlpha.value = e.alpha;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
