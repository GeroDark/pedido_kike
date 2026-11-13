import type { SceneId } from "@/lib/narrative";

/**
 * Motor de sonido del telescreen. Todo es síntesis con Web Audio: no se
 * descarga ningún archivo. Solo arranca tras un gesto del visitante.
 *
 * Capas: zumbido de red (50 Hz y armónicos), siseo de válvula y un drone
 * grave. Un filtro maestro «estrecha» el sonido en la Habitación 101.
 */

interface Mix {
  hum: number;
  drone: number;
  cutoff: number;
}

const MIX: Record<SceneId, Mix> = {
  0: { hum: 0, drone: 0, cutoff: 16000 },
  1: { hum: 1, drone: 0.35, cutoff: 16000 },
  2: { hum: 0.22, drone: 0.5, cutoff: 5200 },
  3: { hum: 0.34, drone: 0.72, cutoff: 7000 },
  4: { hum: 0.04, drone: 0.85, cutoff: 300 },
  5: { hum: 0.85, drone: 0.3, cutoff: 14000 },
};

const MASTER_LEVEL = 0.55;

class TelescreenAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private bus: GainNode | null = null;
  private hum: GainNode | null = null;
  private drone: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted = true;
  private silenced = false;
  private scene: SceneId = 0;

  get running(): boolean {
    return !!this.ctx && !this.muted;
  }

  /** Debe llamarse dentro de un gesto del usuario. */
  start(): boolean {
    try {
      if (!this.ctx) this.build();
      void this.ctx?.resume();
      this.muted = false;
      this.rampMaster();
      this.applyMix(0.4);
      return true;
    } catch {
      return false;
    }
  }

  mute(): void {
    this.muted = true;
    this.rampMaster();
  }

  unmute(): boolean {
    return this.start();
  }

  setScene(scene: SceneId): void {
    this.scene = scene;
    this.silenced = false;
    this.applyMix(0.7);
  }

  /** Silencio como recurso: el giro final se dice sin nada debajo. */
  setSilence(on: boolean): void {
    if (this.silenced === on) return;
    this.silenced = on;
    this.applyMix(on ? 0.9 : 0.6);
  }

  /** Baja el lecho sonoro un instante para dejar sitio a un golpe. */
  duck(seconds = 0.9): void {
    if (!this.ctx || !this.bus) return;
    const t = this.ctx.currentTime;
    this.bus.gain.cancelScheduledValues(t);
    this.bus.gain.setTargetAtTime(0.35, t, 0.03);
    this.bus.gain.setTargetAtTime(1, t + seconds, 0.4);
  }

  suspend(): void {
    if (this.ctx?.state === "running") void this.ctx.suspend();
  }

  resume(): void {
    if (this.ctx && !this.muted && this.ctx.state === "suspended") void this.ctx.resume();
  }

  private build(): void {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio no disponible");
    const ctx = new Ctor();
    this.ctx = ctx;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.knee.value = 12;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.25;
    limiter.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(limiter);
    this.master = master;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 16000;
    filter.Q.value = 0.4;
    filter.connect(master);
    this.filter = filter;

    const bus = ctx.createGain();
    bus.connect(filter);
    this.bus = bus;

    // Ruido blanco reutilizable (2 s, en bucle sin costura perceptible).
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buffer;

    // Zumbido de red.
    const hum = ctx.createGain();
    hum.gain.value = 0;
    hum.connect(bus);
    this.hum = hum;
    const partials: Array<[number, OscillatorType, number]> = [
      [50, "sine", 0.2],
      [100, "sine", 0.075],
      [150, "triangle", 0.022],
      [250, "sine", 0.008],
    ];
    for (const [freq, type, level] of partials) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g).connect(hum);
      osc.start();
    }
    const hiss = ctx.createBufferSource();
    hiss.buffer = buffer;
    hiss.loop = true;
    const hissBand = ctx.createBiquadFilter();
    hissBand.type = "bandpass";
    hissBand.frequency.value = 5200;
    hissBand.Q.value = 0.6;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.012;
    hiss.connect(hissBand).connect(hissGain).connect(hum);
    hiss.start();
    // El zumbido respira muy despacio.
    const breath = ctx.createOscillator();
    breath.frequency.value = 0.11;
    const breathDepth = ctx.createGain();
    breathDepth.gain.value = 0.05;
    breath.connect(breathDepth).connect(hum.gain);
    breath.start();

    // Drone grave: dos sierras desafinadas bajo un filtro muy cerrado.
    const drone = ctx.createGain();
    drone.gain.value = 0;
    drone.connect(bus);
    this.drone = drone;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 150;
    droneFilter.Q.value = 0.7;
    droneFilter.connect(drone);
    for (const freq of [55, 55.45, 82.6]) {
      const osc = ctx.createOscillator();
      osc.type = freq > 60 ? "sine" : "sawtooth";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = freq > 60 ? 0.05 : 0.11;
      osc.connect(g).connect(droneFilter);
      osc.start();
    }
  }

  private rampMaster(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER_LEVEL, t, 0.12);
  }

  private applyMix(timeConstant: number): void {
    if (!this.ctx || !this.hum || !this.drone || !this.filter) return;
    const mix = MIX[this.scene];
    const k = this.silenced ? 0 : 1;
    const t = this.ctx.currentTime;
    this.hum.gain.setTargetAtTime(mix.hum * k, t, timeConstant);
    this.drone.gain.setTargetAtTime(mix.drone * k, t, timeConstant);
    this.filter.frequency.setTargetAtTime(mix.cutoff, t, timeConstant);
  }

  /** Ráfaga de ruido filtrado con envolvente exponencial. */
  private burst(opts: {
    at?: number;
    duration: number;
    gain: number;
    type: BiquadFilterType;
    from: number;
    to?: number;
    q?: number;
    direct?: boolean;
  }): void {
    if (!this.ctx || !this.noise || !this.filter || !this.master || this.muted) return;
    const t = this.ctx.currentTime + (opts.at ?? 0);
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = opts.type;
    f.frequency.setValueAtTime(opts.from, t);
    if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, t + opts.duration);
    f.Q.value = opts.q ?? 1;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.duration);
    src.connect(f).connect(g).connect(opts.direct ? this.master : this.filter);
    src.start(t, Math.random() * 1.5);
    src.stop(t + opts.duration + 0.05);
  }

  /** Tono con barrido de frecuencia y caída exponencial. */
  private tone(opts: {
    at?: number;
    duration: number;
    gain: number;
    from: number;
    to: number;
    type?: OscillatorType;
    direct?: boolean;
  }): void {
    if (!this.ctx || !this.filter || !this.master || this.muted) return;
    const t = this.ctx.currentTime + (opts.at ?? 0);
    const osc = this.ctx.createOscillator();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(opts.from, t);
    osc.frequency.exponentialRampToValueAtTime(opts.to, t + opts.duration);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.duration);
    osc.connect(g).connect(opts.direct ? this.master : this.filter);
    osc.start(t);
    osc.stop(t + opts.duration + 0.05);
  }

  /** El aparato se enciende: golpe de relé, estática que se asienta. */
  powerOn(): void {
    this.tone({ duration: 0.5, gain: 0.3, from: 72, to: 44, direct: true });
    this.burst({ duration: 0.7, gain: 0.07, type: "bandpass", from: 5200, to: 1400, q: 0.7, direct: true });
    this.burst({ duration: 0.03, gain: 0.2, type: "highpass", from: 1800, direct: true });
  }

  /** Cambio de canal: la imagen colapsa en una línea. */
  collapse(): void {
    this.tone({ duration: 0.22, gain: 0.07, from: 880, to: 70, type: "triangle", direct: true });
  }

  /** Una tecla de máquina de escribir. Cada pulsación suena un poco distinta. */
  key(): void {
    const pitch = 0.85 + Math.random() * 0.4;
    this.burst({ duration: 0.035, gain: 0.26, type: "bandpass", from: 2400 * pitch, q: 1.8, direct: true });
    this.tone({ duration: 0.05, gain: 0.12, from: 190 * pitch, to: 90, direct: true });
  }

  /** El sello de goma: un golpe sordo y nada más. */
  stamp(): void {
    this.duck(1.2);
    this.tone({ duration: 0.3, gain: 0.5, from: 120, to: 36, direct: true });
    this.burst({ duration: 0.09, gain: 0.3, type: "lowpass", from: 900, direct: true });
  }

  /** El interruptor de la verdad: dos contactos. */
  relay(): void {
    this.burst({ duration: 0.012, gain: 0.22, type: "highpass", from: 2200, direct: true });
    this.burst({ at: 0.07, duration: 0.02, gain: 0.16, type: "bandpass", from: 900, q: 2, direct: true });
  }

  /** Una palabra arde en el agujero de la memoria. */
  burn(): void {
    this.burst({ duration: 0.75, gain: 0.11, type: "bandpass", from: 700, to: 3600, q: 0.8, direct: true });
    this.tone({ duration: 0.5, gain: 0.1, from: 160, to: 40, direct: true });
  }

  /** Línea del expediente al imprimirse. */
  tick(): void {
    this.burst({ duration: 0.01, gain: 0.07, type: "highpass", from: 3200, direct: true });
  }
}

export const audio = new TelescreenAudio();
