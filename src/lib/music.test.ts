import { describe, it, expect } from "vitest";
import { MOODS, SONGS, XYLOPHONE, buildLoop, midiToFreq, moodForPath, parseSong } from "./music";

describe("music", () => {
  it("converts MIDI to frequency", () => {
    expect(midiToFreq(69)).toBeCloseTo(440);
    expect(midiToFreq(81)).toBeCloseTo(880);
  });

  it("builds a loop for every mood with in-range, in-bar events", () => {
    for (const mood of Object.values(MOODS)) {
      const { events, lengthBeats } = buildLoop(mood);
      expect(lengthBeats).toBe(mood.progression.length * 4);
      expect(events.length).toBeGreaterThan(0);
      for (const e of events) {
        expect(e.beat).toBeGreaterThanOrEqual(0);
        expect(e.beat).toBeLessThan(lengthBeats);
        expect(e.midi).toBeGreaterThanOrEqual(30);
        expect(e.midi).toBeLessThanOrEqual(100);
      }
    }
  });

  it("keeps background tempos calm", () => {
    for (const mood of Object.values(MOODS)) expect(mood.tempo).toBeLessThanOrEqual(120);
  });

  it("maps paths to moods", () => {
    expect(moodForPath("/dashboard/learn/abc")).toBe("focus");
    expect(moodForPath("/dashboard/stories/x")).toBe("dreamy");
    expect(moodForPath("/dashboard/art/draw")).toBe("playful");
    expect(moodForPath("/dashboard/fun")).toBe("bouncy");
    expect(moodForPath("/dashboard")).toBe("sunny");
  });

  it("parses every song, with notes playable on the xylophone", () => {
    const playable = new Set(XYLOPHONE.map((b) => b.midi));
    expect(new Set(SONGS.map((s) => s.id)).size).toBe(SONGS.length);
    for (const song of SONGS) {
      const notes = parseSong(song.notes);
      expect(notes.length).toBeGreaterThan(4);
      for (const n of notes) expect(playable.has(n.midi)).toBe(true);
    }
  });

  it("rejects typos in the song format", () => {
    expect(() => parseSong("C4 H4")).toThrow();
    expect(parseSong("G4:2")[0]).toEqual({ midi: 67, beats: 2, letter: "G" });
  });
});

describe("loop order", () => {
  it("is sorted by beat so the player never skips notes", () => {
    for (const mood of Object.values(MOODS)) {
      const { events } = buildLoop(mood);
      const beats = events.map((e) => e.beat);
      expect(beats).toEqual([...beats].sort((a, b) => a - b));
    }
  });
});

describe("soft pad", () => {
  it("every mood has a slow pad that holds the whole chord for the bar", () => {
    for (const mood of Object.values(MOODS)) {
      const { events } = buildLoop(mood);
      mood.progression.forEach((tones, ci) => {
        const pad = events.filter((e) => e.pad && e.beat === ci * 4);
        expect(pad.map((e) => e.midi).sort()).toEqual(tones.map((t) => mood.root + t).sort());
        for (const e of pad) {
          expect(e.beats).toBeGreaterThanOrEqual(4);
          expect(e.attack).toBeGreaterThanOrEqual(0.8);
          expect(e.bass).toBe(false);
        }
      });
    }
  });

  it("the pad is quieter than the melody and stays in a warm range", () => {
    for (const mood of Object.values(MOODS)) {
      const { events } = buildLoop(mood);
      const loudestTune = Math.max(...events.filter((e) => !e.pad && !e.bass).map((e) => e.gain));
      for (const e of events.filter((x) => x.pad)) {
        expect(e.gain).toBeLessThan(loudestTune);
        expect(e.midi).toBeGreaterThanOrEqual(48);
        expect(e.midi).toBeLessThanOrEqual(84);
      }
    }
  });

  it("melody and bass notes keep a quick attack", () => {
    for (const mood of Object.values(MOODS)) {
      for (const e of buildLoop(mood).events.filter((x) => !x.pad)) expect(e.attack).toBeLessThanOrEqual(0.05);
    }
  });
});