"use client";

import { midiToFreq } from "@/lib/music";

type Wave = "sine" | "triangle" | "square" | "sawtooth";
export type Bus = "sfx" | "music";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicIn: BiquadFilterNode | null = null;
let musicBus: GainNode | null = null;
let lastSfxAt = 0;

/**
 * One shared audio context with two channels. Browsers only allow it after a tap, which is why music starts off.
 * Sound effects go straight to the speakers. Background music passes through a soft low-pass filter (so it
 * never sounds sharp) and its own volume, which can be turned down while the friendly voice is talking.
 */
export function audio(): { ctx: AudioContext; out: GainNode; music: AudioNode } | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);

      sfxBus = ctx.createGain();
      sfxBus.gain.value = 1;
      sfxBus.connect(master);

      musicBus = ctx.createGain();
      musicBus.gain.value = 1;
      musicBus.connect(master);
      musicIn = ctx.createBiquadFilter();
      musicIn.type = "lowpass";
      musicIn.frequency.value = 1500;
      musicIn.Q.value = 0.4;
      musicIn.connect(musicBus);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return { ctx, out: sfxBus!, music: musicIn! };
  } catch {
    return null;
  }
}

/** Turns the background music down while someone is talking, then back up. */
export function setMusicDucked(ducked: boolean) {
  if (!ctx || !musicBus) return;
  musicBus.gain.setTargetAtTime(ducked ? 0.3 : 1, ctx.currentTime, 0.25);
}

/** Milliseconds since the last sound effect or tapped note, so a plain "tap" does not play on top of it. */
export function msSinceSfx(): number {
  return Date.now() - lastSfxAt;
}

/** A soft, plucky note. `when` is in AudioContext seconds. `attack` makes slow, pad-like notes. */
export function playNote(midi: number, opts: { when?: number; dur?: number; gain?: number; wave?: Wave; bus?: Bus; attack?: number } = {}) {
  const a = audio();
  if (!a) return;
  const { ctx: c } = a;
  const out = opts.bus === "music" ? a.music : a.out;
  if (opts.bus !== "music") lastSfxAt = Date.now();
  const when = opts.when ?? c.currentTime;
  const dur = opts.dur ?? 0.5;
  const attack = Math.min(opts.attack ?? 0.02, dur / 2);
  const peak = (opts.gain ?? 0.5) * 0.22;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.wave ?? "triangle";
  osc.frequency.value = midiToFreq(midi);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(peak, when + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(g).connect(out);
  osc.start(when);
  osc.stop(when + dur + 0.05);
}
