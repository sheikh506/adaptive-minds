/**
 * Music for AdaptiveMinds. Nothing is downloaded: every sound is synthesised in the browser.
 * This file is pure data and maths so it can be unit tested. The player lives in components/fun.
 *
 * Calm by default: music is OFF until a child (or grown-up) turns it on, and it is quiet and slow.
 */

export type MoodKey = "sunny" | "focus" | "dreamy" | "playful" | "bouncy";

export interface Mood {
  key: MoodKey;
  label: string;
  emoji: string;
  /** beats per minute */
  tempo: number;
  wave: "sine" | "triangle" | "square" | "sawtooth";
  /** MIDI note of the home note */
  root: number;
  /** each chord lasts 4 beats; values are semitones above root */
  progression: number[][];
  /** which chord tone to play on each eighth note (wraps, then goes up an octave) */
  pattern: number[];
}

const MAJOR = [0, 4, 7];
const MINOR = [0, 3, 7];
const chord = (shape: number[], at: number) => shape.map((s) => s + at);

export const MOODS: Record<MoodKey, Mood> = {
  // Home: bright and welcoming (C major, I V vi IV)
  sunny: {
    key: "sunny",
    label: "Sunny Day",
    emoji: "☀️",
    tempo: 92,
    wave: "triangle",
    root: 60,
    progression: [chord(MAJOR, 0), chord(MAJOR, 7), chord(MINOR, 9), chord(MAJOR, 5)],
    pattern: [0, 1, 2, 1, 0, 1, 2, 3],
  },
  // Quests: slow and steady so it never distracts from thinking
  focus: {
    key: "focus",
    label: "Thinking Time",
    emoji: "🧠",
    tempo: 66,
    wave: "sine",
    root: 57,
    progression: [chord(MAJOR, 0), chord(MINOR, 9), chord(MAJOR, 5), chord(MAJOR, 7)],
    pattern: [0, 2, 1, 2, 0, 2, 1, 2],
  },
  // Stories: lullaby feel (A minor)
  dreamy: {
    key: "dreamy",
    label: "Story Lullaby",
    emoji: "🌙",
    tempo: 60,
    wave: "sine",
    root: 57,
    progression: [chord(MINOR, 0), chord(MAJOR, 8), chord(MAJOR, 3), chord(MAJOR, 10)],
    pattern: [0, 1, 2, 3, 2, 1, 2, 1],
  },
  // Art: skippy and cheerful (F major)
  playful: {
    key: "playful",
    label: "Paint Party",
    emoji: "🎨",
    tempo: 104,
    wave: "triangle",
    root: 65,
    progression: [chord(MAJOR, 0), chord(MAJOR, 5), chord(MAJOR, 7), chord(MAJOR, 0)],
    pattern: [0, 2, 1, 2, 3, 2, 1, 2],
  },
  // Fun zone: bouncy (G major)
  bouncy: {
    key: "bouncy",
    label: "Game Time",
    emoji: "🎈",
    tempo: 116,
    wave: "square",
    root: 55,
    progression: [chord(MAJOR, 0), chord(MAJOR, 5), chord(MAJOR, 7), chord(MAJOR, 5)],
    pattern: [0, 1, 0, 2, 1, 2, 3, 2],
  },
};

/** Which mood fits which part of the app. */
export function moodForPath(pathname: string): MoodKey {
  if (pathname.startsWith("/dashboard/learn")) return "focus";
  if (pathname.startsWith("/dashboard/stories")) return "dreamy";
  if (pathname.startsWith("/dashboard/art")) return "playful";
  if (pathname.startsWith("/dashboard/fun")) return "bouncy";
  return "sunny";
}

export const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export interface NoteEvent {
  beat: number;
  midi: number;
  beats: number;
  gain: number;
  bass: boolean;
  /** a slow, sustained note that fades in (the soft pad under the tune) */
  pad: boolean;
  /** seconds the note takes to fade in */
  attack: number;
}

const PAD_GAIN = 0.4;
const PAD_ATTACK_SECONDS = 1;

/** One pass of the loop as note events. Deterministic, so it is easy to test. */
export function buildLoop(mood: Mood): { events: NoteEvent[]; lengthBeats: number } {
  const events: NoteEvent[] = [];
  mood.progression.forEach((tones, ci) => {
    const start = ci * 4;
    // a slow pad: the whole chord held for the full bar, fading in over about a second
    for (const tone of tones) {
      events.push({ beat: start, midi: mood.root + tone, beats: 4.2, gain: PAD_GAIN, bass: false, pad: true, attack: PAD_ATTACK_SECONDS });
    }
    // soft bass on beats 1 and 3
    for (const b of [0, 2]) {
      events.push({ beat: start + b, midi: mood.root + tones[0] - 12, beats: 1.8, gain: 0.5, bass: true, pad: false, attack: 0.03 });
    }
    // arpeggio on eighth notes
    mood.pattern.forEach((idx, step) => {
      const midi = mood.root + tones[idx % tones.length] + 12 * Math.floor(idx / tones.length);
      events.push({ beat: start + step * 0.5, midi, beats: 0.9, gain: step % 4 === 0 ? 0.9 : 0.6, bass: false, pad: false, attack: 0.03 });
    });
  });
  // The player schedules events in order and stops at the first one that is too far ahead, so keep them sorted.
  events.sort((a, b) => a.beat - b.beat);
  return { events, lengthBeats: mood.progression.length * 4 };
}

// ─── Songs for the Music Maker ──────────────────────────────────────────────

const NOTE_OFFSETS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export interface SongNote {
  midi: number;
  beats: number;
  /** note letter, used to light up the matching xylophone bar */
  letter: string;
}

/**
 * Tiny song format: space-separated notes like "C4", "G4:2" (2 beats).
 * Letters are C D E F G A B followed by an octave number. Unknown tokens throw, so a typo is caught by tests.
 */
export function parseSong(text: string): SongNote[] {
  return text
    .trim()
    .split(/\s+/)
    .map((token) => {
      const m = /^([A-G])(\d)(?::(\d+(?:\.\d+)?))?$/.exec(token);
      if (!m) throw new Error(`Bad note "${token}"`);
      const [, letter, octave, len] = m;
      return { midi: 12 * (Number(octave) + 1) + NOTE_OFFSETS[letter], beats: len ? Number(len) : 1, letter };
    });
}

export interface Song {
  id: string;
  title: string;
  emoji: string;
  tempo: number;
  notes: string;
}

/** Traditional tunes (public domain). */
export const SONGS: Song[] = [
  {
    id: "twinkle",
    title: "Twinkle, Twinkle, Little Star",
    emoji: "⭐",
    tempo: 100,
    notes: "C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2 G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2 C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2",
  },
  {
    id: "mary",
    title: "Mary Had a Little Lamb",
    emoji: "🐑",
    tempo: 108,
    notes: "E4 D4 C4 D4 E4 E4 E4:2 D4 D4 D4:2 E4 G4 G4:2 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4:4",
  },
  {
    id: "ode",
    title: "Ode to Joy",
    emoji: "🎶",
    tempo: 112,
    notes: "E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2",
  },
  {
    id: "row",
    title: "Row, Row, Row Your Boat",
    emoji: "🚣",
    tempo: 96,
    notes: "C4:2 C4:2 C4:1.5 D4:0.5 E4:2 E4:1.5 D4:0.5 E4:1.5 F4:0.5 G4:4 C5 C5 C5 G4 G4 G4 E4 E4 E4 C4 C4 C4 G4:1.5 F4:0.5 E4:1.5 D4:0.5 C4:4",
  },
];

/** Xylophone bars from low C to high C, each with a bright colour. */
export const XYLOPHONE: { letter: string; midi: number; color: string }[] = [
  { letter: "C", midi: 60, color: "#ff6b6b" },
  { letter: "D", midi: 62, color: "#ff9f1c" },
  { letter: "E", midi: 64, color: "#ffd23f" },
  { letter: "F", midi: 65, color: "#9be564" },
  { letter: "G", midi: 67, color: "#2ec4b6" },
  { letter: "A", midi: 69, color: "#3ec6ff" },
  { letter: "B", midi: 71, color: "#8b45f7" },
  { letter: "C", midi: 72, color: "#ff7ac6" },
];
