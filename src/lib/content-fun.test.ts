import { describe, it, expect } from "vitest";
import { STORIES, storyById, splitSentences } from "./storybook";
import { STICKERS, stickerById } from "./stickers";
import { CRAFTS, COLOUR_PAGES, PALETTE, craftById, colourPageById } from "./crafts";

describe("storybook", () => {
  it("has unique story ids that resolve", () => {
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(STORIES.length);
    for (const s of STORIES) expect(storyById(s.id)).toBe(s);
    expect(storyById("nope")).toBeUndefined();
  });

  it("has pages and a valid quiz for every story", () => {
    for (const s of STORIES) {
      expect(s.pages.length).toBeGreaterThanOrEqual(4);
      for (const p of s.pages) {
        expect(p.text.trim().length).toBeGreaterThan(10);
        expect(p.scene.length).toBeGreaterThan(0);
      }
      expect(s.questions.length).toBe(3);
      for (const q of s.questions) {
        expect(q.options.length).toBe(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.options).toContain(q.answer);
        expect(q.why.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("splits text into sentences", () => {
    expect(splitSentences("One. Two! Three?")).toEqual(["One.", "Two!", "Three?"]);
  });
});

describe("stickers", () => {
  it("has unique ids", () => {
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    expect(stickerById("art:craft")?.name).toBe("Crafty Kid");
  });

  it("has a sticker for every story", () => {
    for (const s of STORIES) expect(stickerById(`story:${s.id}`)).toBeDefined();
    expect(stickerById("story:all-correct")).toBeDefined();
  });

  it("covers the ids the app awards", () => {
    for (const id of [
      "art:first-drawing", "art:colour-page", "art:craft",
      "music:first-notes", "music:song", "music:composer",
      "game:memory", "game:animal-sounds", "game:bubbles", "game:breathe",
      "quest:first", "quest:five", "quest:twenty",
    ]) {
      expect(stickerById(id), id).toBeDefined();
    }
  });
});

describe("crafts", () => {
  it("has unique craft ids with materials and steps", () => {
    expect(new Set(CRAFTS.map((c) => c.id)).size).toBe(CRAFTS.length);
    for (const c of CRAFTS) {
      expect(craftById(c.id)).toBe(c);
      expect(c.materials.length).toBeGreaterThan(0);
      expect(c.steps.length).toBeGreaterThanOrEqual(3);
      expect(c.learn.length).toBeGreaterThan(10);
      expect(c.grownUp.length).toBeGreaterThan(10);
    }
  });

  it("has colouring pages with unique non-empty regions", () => {
    expect(new Set(COLOUR_PAGES.map((p) => p.id)).size).toBe(COLOUR_PAGES.length);
    for (const p of COLOUR_PAGES) {
      expect(colourPageById(p.id)).toBe(p);
      expect(new Set(p.regions.map((r) => r.id)).size).toBe(p.regions.length);
      for (const r of p.regions) {
        expect(r.d.startsWith("M")).toBe(true);
        expect(r.d).not.toMatch(/NaN|undefined/);
      }
    }
  });

  it("offers a palette of valid colours", () => {
    for (const c of PALETTE) expect(c).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
