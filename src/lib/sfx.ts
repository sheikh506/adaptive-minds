/**
 * Sound effects for actions and events. Every sound is a few soft notes, synthesised in the browser
 * (nothing to download). Pure data and helpers so they can be tested; the player lives in components/fun.
 *
 * Gentle by design: sine and triangle waves only, short, and a mistake sounds soft and kind, never like a buzzer.
 */

export type SfxWave = "sine" | "triangle";

export interface SfxNote {
  midi: number;
  /** seconds after the sound starts */
  at: number;
  dur: number;
  gain: number;
  wave: SfxWave;
}

export type SfxName =
  | "tap"
  | "correct"
  | "gentle"
  | "hint"
  | "step"
  | "page"
  | "pop"
  | "flip"
  | "paint"
  | "stamp"
  | "save"
  | "sticker"
  | "win"
  | "levelup"
  | "whoosh";

const n = (midi: number, at: number, dur: number, gain: number, wave: SfxWave = "sine"): SfxNote => ({ midi, at, dur, gain, wave });

export const SFX: Record<SfxName, SfxNote[]> = {
  /** a button was pressed */
  tap: [n(79, 0, 0.08, 0.22)],
  /** a right answer: a bright little rising chord */
  correct: [n(72, 0, 0.25, 0.5, "triangle"), n(76, 0.09, 0.25, 0.5, "triangle"), n(79, 0.18, 0.4, 0.5, "triangle")],
  /** "try again": two soft falling notes, kind not scary */
  gentle: [n(67, 0, 0.25, 0.32), n(64, 0.18, 0.4, 0.28)],
  /** a hint opened: a little twinkle */
  hint: [n(76, 0, 0.18, 0.32), n(83, 0.12, 0.3, 0.28)],
  /** the next solution step */
  step: [n(79, 0, 0.12, 0.28)],
  /** turning a page */
  page: [n(60, 0, 0.12, 0.22, "triangle"), n(67, 0.06, 0.14, 0.18, "triangle")],
  /** popping a bubble */
  pop: [n(84, 0, 0.1, 0.45), n(91, 0.03, 0.08, 0.28)],
  /** flipping a card */
  flip: [n(72, 0, 0.1, 0.3, "triangle")],
  /** painting or colouring */
  paint: [n(74, 0, 0.15, 0.28)],
  /** a stamp on the page */
  stamp: [n(55, 0, 0.16, 0.5, "triangle"), n(67, 0.02, 0.12, 0.3, "triangle")],
  /** a picture was saved */
  save: [n(72, 0, 0.3, 0.42), n(76, 0.08, 0.3, 0.42), n(79, 0.16, 0.3, 0.42), n(84, 0.24, 0.45, 0.42)],
  /** a new sticker: sparkle */
  sticker: [n(79, 0, 0.25, 0.45), n(83, 0.12, 0.25, 0.42), n(86, 0.24, 0.3, 0.4), n(91, 0.36, 0.55, 0.4)],
  /** a puzzle or quest is finished */
  win: [n(72, 0, 0.5, 0.5, "triangle"), n(76, 0.15, 0.5, 0.5, "triangle"), n(79, 0.3, 0.5, 0.5, "triangle"), n(84, 0.45, 0.7, 0.52, "triangle")],
  /** a level up or a new badge */
  levelup: [n(67, 0, 0.3, 0.45, "triangle"), n(72, 0.12, 0.3, 0.45, "triangle"), n(76, 0.24, 0.3, 0.45, "triangle"), n(79, 0.36, 0.3, 0.45, "triangle"), n(84, 0.48, 0.55, 0.48, "triangle")],
  /** moving to another page of the app */
  whoosh: [n(60, 0, 0.18, 0.18), n(67, 0.07, 0.18, 0.14)],
};

export const SFX_NAMES = Object.keys(SFX) as SfxName[];

/** The notes of a sound, moved up or down by some semitones (for a bit of variety). */
export function sfxNotes(name: SfxName, shift = 0): SfxNote[] {
  return SFX[name].map((note) => ({ ...note, midi: Math.max(36, Math.min(100, note.midi + shift)) }));
}

/** How long the sound lasts, in seconds. */
export function sfxLength(name: SfxName): number {
  return Math.max(...SFX[name].map((x) => x.at + x.dur));
}
