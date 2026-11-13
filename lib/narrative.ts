import { create } from "zustand";

export type SceneId = 0 | 1 | 2 | 3 | 4 | 5;

export interface Whisper {
  id: number;
  text: string;
}

/**
 * Estado narrativo. Vive solo en memoria: no hay localStorage, cookies ni red.
 * Recargar la página lo destruye, y eso es parte de lo que la pieza promete.
 */
interface NarrativeState {
  powered: boolean;
  enteredAt: number | null;
  scene: SceneId;
  completed: boolean[];
  audioOn: boolean;

  reduced: boolean;
  webgl: boolean | null;
  zoneIntro: boolean;
  zoneFinale: boolean;
  you: { x: number; y: number } | null;

  diary: string | null;
  diarySkipped: boolean;
  fear: string | null;
  fearDeclined: boolean;
  flips: number;
  erased: number;
  corrections: number;
  tabLeaves: number;
  idles: number;
  whisper: Whisper | null;

  power: (audioOn: boolean) => void;
  setScene: (scene: SceneId) => void;
  complete: (scene: SceneId) => void;
  setAudio: (on: boolean) => void;
  setEnv: (env: Partial<Pick<NarrativeState, "reduced" | "webgl">>) => void;
  setZone: (zone: "intro" | "finale", active: boolean) => void;
  setYou: (you: { x: number; y: number } | null) => void;
  setDiary: (text: string) => void;
  skipDiary: () => void;
  setFear: (text: string) => void;
  declineFear: () => void;
  eraseFear: () => void;
  flip: () => void;
  erase: () => void;
  correct: () => void;
  leftTab: () => void;
  wentIdle: () => void;
  say: (text: string) => void;
  hush: () => void;
}

let whisperId = 0;

export const useNarrative = create<NarrativeState>((set, get) => ({
  powered: false,
  enteredAt: null,
  scene: 0,
  completed: [false, false, false, false, false, false],
  audioOn: false,

  reduced: false,
  webgl: null,
  zoneIntro: false,
  zoneFinale: false,
  you: null,

  diary: null,
  diarySkipped: false,
  fear: null,
  fearDeclined: false,
  flips: 0,
  erased: 0,
  corrections: 0,
  tabLeaves: 0,
  idles: 0,
  whisper: null,

  power: (audioOn) => {
    const completed = get().completed.slice();
    completed[0] = true;
    set({ powered: true, enteredAt: Date.now(), audioOn, scene: 1, completed });
  },
  setScene: (scene) => {
    if (get().scene !== scene) set({ scene });
  },
  complete: (scene) => {
    if (get().completed[scene]) return;
    const completed = get().completed.slice();
    completed[scene] = true;
    set({ completed });
  },
  setAudio: (audioOn) => set({ audioOn }),
  setEnv: (env) => set(env),
  setZone: (zone, active) => set(zone === "intro" ? { zoneIntro: active } : { zoneFinale: active }),
  setYou: (you) => set({ you }),
  setDiary: (text) => {
    set({ diary: text, diarySkipped: false });
    get().complete(2);
  },
  skipDiary: () => {
    set({ diary: null, diarySkipped: true });
    get().complete(2);
  },
  setFear: (text) => {
    set({ fear: text, fearDeclined: false });
    get().complete(4);
  },
  declineFear: () => {
    set({ fear: null, fearDeclined: true });
    get().complete(4);
  },
  eraseFear: () => set({ fear: null, fearDeclined: false }),
  flip: () => {
    set({ flips: get().flips + 1, corrections: get().corrections + 1 });
    get().complete(3);
  },
  erase: () => {
    set({ erased: get().erased + 1, corrections: get().corrections + 1 });
    get().complete(3);
  },
  correct: () => set({ corrections: get().corrections + 1 }),
  leftTab: () => set({ tabLeaves: get().tabLeaves + 1 }),
  wentIdle: () => set({ idles: get().idles + 1 }),
  say: (text) => set({ whisper: { id: ++whisperId, text } }),
  hush: () => set({ whisper: null }),
}));

/** Sin WebGL o con movimiento reducido la pieza se cuenta en DOM plano, sin pins ni scrub. */
export function useSimple(): boolean {
  return useNarrative((s) => s.reduced || s.webgl === false);
}
