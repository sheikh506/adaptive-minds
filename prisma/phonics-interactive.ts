/**
 * Foundational Phonics — Interactive Content Generator (P1-PH1 / P1-PH2)
 *
 * Generates phonics exercises that go beyond multiple-choice written recognition.
 * These are linked to the skill curriculum IDs in skill-curriculum.ts.
 *
 * NEW interaction types:
 *   tile_build    — child drags letter tiles to build a CVC word (phoneme blending)
 *   phoneme_tap   — child taps a box for each sound in a spoken word (phoneme segmenting)
 *
 * Both types require the CHILD TO DECODE OR SEGMENT rather than just recognise a written option.
 * This distinguishes supported decoding from multiple-choice identification.
 *
 * Design notes:
 *   - Deterministic (seeded), so re-seeding is idempotent
 *   - All IDs are prefixed "ph-interactive-" to avoid collisions with existing bank
 *   - No answer appears in the question text
 *   - Each item has a full explanation for the hint system
 */

import type { Visual } from "../src/lib/question-types";
import { rng, shuffle, difficultyFor, rewards, type SeedExercise } from "./stories";

// ─── CVC Word Bank ───────────────────────────────────────────────────────────
// Each entry: [word, emoji picture, graphemes (one-to-one), syllable count, level band]
// Graphemes are listed left-to-right; for CVC words each grapheme = one letter.

type CvcWord = {
  word: string;
  emoji: string;
  graphemes: string[]; // e.g. ["c","a","t"]
  phonemes: string[];  // e.g. ["/k/","/æ/","/t/"]
  levelBand: 1 | 2 | 3;
};

const CVC_WORDS: CvcWord[] = [
  // Level 1: very common, short vowels a/o/i
  { word: "cat", emoji: "🐱", graphemes: ["c","a","t"], phonemes: ["/k/","/æ/","/t/"], levelBand: 1 },
  { word: "dog", emoji: "🐶", graphemes: ["d","o","g"], phonemes: ["/d/","/ɒ/","/g/"], levelBand: 1 },
  { word: "pig", emoji: "🐷", graphemes: ["p","i","g"], phonemes: ["/p/","/ɪ/","/g/"], levelBand: 1 },
  { word: "hat", emoji: "🎩", graphemes: ["h","a","t"], phonemes: ["/h/","/æ/","/t/"], levelBand: 1 },
  { word: "sun", emoji: "☀️", graphemes: ["s","u","n"], phonemes: ["/s/","/ʌ/","/n/"], levelBand: 1 },
  { word: "bat", emoji: "🦇", graphemes: ["b","a","t"], phonemes: ["/b/","/æ/","/t/"], levelBand: 1 },
  { word: "cup", emoji: "🥤", graphemes: ["c","u","p"], phonemes: ["/k/","/ʌ/","/p/"], levelBand: 1 },
  { word: "bed", emoji: "🛏️", graphemes: ["b","e","d"], phonemes: ["/b/","/e/","/d/"], levelBand: 1 },
  { word: "hen", emoji: "🐔", graphemes: ["h","e","n"], phonemes: ["/h/","/e/","/n/"], levelBand: 1 },
  { word: "fox", emoji: "🦊", graphemes: ["f","o","x"], phonemes: ["/f/","/ɒ/","/ks/"], levelBand: 1 },
  // Level 2: less common short vowels, voiced/voiceless pairs
  { word: "log", emoji: "🪵", graphemes: ["l","o","g"], phonemes: ["/l/","/ɒ/","/g/"], levelBand: 2 },
  { word: "web", emoji: "🕸️", graphemes: ["w","e","b"], phonemes: ["/w/","/e/","/b/"], levelBand: 2 },
  { word: "van", emoji: "🚐", graphemes: ["v","a","n"], phonemes: ["/v/","/æ/","/n/"], levelBand: 2 },
  { word: "zip", emoji: "🤐", graphemes: ["z","i","p"], phonemes: ["/z/","/ɪ/","/p/"], levelBand: 2 },
  { word: "mud", emoji: "🟤", graphemes: ["m","u","d"], phonemes: ["/m/","/ʌ/","/d/"], levelBand: 2 },
  { word: "jug", emoji: "🫙", graphemes: ["j","u","g"], phonemes: ["/dʒ/","/ʌ/","/g/"], levelBand: 2 },
  { word: "kit", emoji: "🧰", graphemes: ["k","i","t"], phonemes: ["/k/","/ɪ/","/t/"], levelBand: 2 },
  { word: "hop", emoji: "🐸", graphemes: ["h","o","p"], phonemes: ["/h/","/ɒ/","/p/"], levelBand: 2 },
  // Level 3: less frequent grapheme-phoneme correspondences
  { word: "yak", emoji: "🐂", graphemes: ["y","a","k"], phonemes: ["/j/","/æ/","/k/"], levelBand: 3 },
  { word: "wax", emoji: "🕯️", graphemes: ["w","a","x"], phonemes: ["/w/","/æ/","/ks/"], levelBand: 3 },
  { word: "vim", emoji: "⚡", graphemes: ["v","i","m"], phonemes: ["/v/","/ɪ/","/m/"], levelBand: 3 },
  { word: "sob", emoji: "😭", graphemes: ["s","o","b"], phonemes: ["/s/","/ɒ/","/b/"], levelBand: 3 },
];

// Letter tiles for a CVC word: the target letters + 3 distractors (different letters)
function tilesFor(graphemes: string[], rand: () => number): string[] {
  const all = "abcdefghijklmnopqrstuvwxyz".split("");
  const used = new Set(graphemes);
  const distractors = shuffle(all.filter((l) => !used.has(l)), rand).slice(0, 3);
  return shuffle([...graphemes, ...distractors], rand);
}

// ─── Generator ───────────────────────────────────────────────────────────────

export function generateInteractivePhonics(): SeedExercise[] {
  const out: SeedExercise[] = [];

  // tile_build: child arranges letter tiles to spell the CVC word
  for (let levelBand = 1; levelBand <= 3; levelBand++) {
    const pool = CVC_WORDS.filter((w) => w.levelBand <= levelBand);
    // Generate 8 exercises per level band (3 level bands × 8 = 24 exercises spread across levels 1-6)
    const engineLevel = levelBand === 1 ? 1 : levelBand === 2 ? 3 : 5;
    for (let i = 0; i < 8; i++) {
      const rand = rng(700_000 + levelBand * 1000 + i);
      const w = pool[Math.floor(rand() * pool.length)];
      const tiles = tilesFor(w.graphemes, rand);
      const visual: Visual = {
        type: "letter_tiles",
        tiles,
        targetGraphemes: w.graphemes,
      };
      out.push({
        id: `ph-tile-${levelBand}-${i + 1}`,
        topicId: "topic-phonics",
        title: "Build the word",
        instructions: `Look at the picture. Tap the letters in order to spell the word.`,
        type: "fill_blank",
        difficulty: difficultyFor(engineLevel),
        level: engineLevel,
        ...rewards(engineLevel),
        data: {
          question: `${w.emoji} Spell the word you see.`,
          options: [], // fill_blank with tile_build has no multiple-choice options
          answer: w.word,
          explanation: `The word is "${w.word}". The sounds are: ${w.phonemes.join(" - ")}. The letters are: ${w.graphemes.join(" - ")}.`,
          visual,
          interactionType: "tile_build" as const,
        },
      });
    }
  }

  // phoneme_tap: child taps a box for each phoneme in a word
  for (let levelBand = 1; levelBand <= 3; levelBand++) {
    const pool = CVC_WORDS.filter((w) => w.levelBand <= levelBand);
    const engineLevel = levelBand === 1 ? 2 : levelBand === 2 ? 4 : 6;
    for (let i = 0; i < 8; i++) {
      const rand = rng(710_000 + levelBand * 1000 + i);
      const w = pool[Math.floor(rand() * pool.length)];
      const visual: Visual = {
        type: "phoneme_boxes",
        wordEmoji: w.emoji,
        boxCount: w.phonemes.length,
      };
      // For multiple-choice validation, the answer is the phoneme count
      const count = String(w.phonemes.length);
      const options = ["2", "3", "4", "5"].filter((_, idx) => idx < 4);
      const shuffled = shuffle(options.filter((o) => o !== count), rand).slice(0, 3);
      out.push({
        id: `ph-phoneme-${levelBand}-${i + 1}`,
        topicId: "topic-phonics",
        title: "Count the sounds",
        instructions: `Say the word slowly. Tap a box for each sound you hear.`,
        type: "multiple_choice",
        difficulty: difficultyFor(engineLevel),
        level: engineLevel,
        ...rewards(engineLevel),
        data: {
          question: `${w.emoji} How many sounds are in this word?`,
          options: shuffle([count, ...shuffled], rand),
          answer: count,
          explanation: `The word "${w.word}" has ${w.phonemes.length} sounds: ${w.phonemes.join(", ")}.`,
          visual,
          interactionType: "phoneme_tap" as const,
        },
      });
    }
  }

  return out;
}
