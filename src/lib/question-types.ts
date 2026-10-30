/**
 * Shapes shared by the question bank (prisma/*.ts), the server and the player UI.
 * Type-only: no runtime code, so it is safe to import from anywhere.
 */

export type SubjectKey = "MATH" | "READING" | "SCIENCE";

/** Hands-on helpers drawn above or alongside the answer area. They never contain the answer itself. */
export type Visual =
  | { type: "count"; items: { emoji: string; count: number }[] } // tap each one to count
  | { type: "takeaway"; emoji: string; total: number; remove: number } // tap the ones that go away
  | { type: "groups"; emoji: string; groups: number; each: number } // equal groups, tap to count
  | { type: "share"; emoji: string; total: number; plates: number } // deal one to each plate
  | { type: "pack"; emoji: string; total: number; size: number } // pack equal groups
  | { type: "pizza"; slices: number } // tap slices to colour them in
  | { type: "number_line"; min: number; max: number; step?: number; target?: number; label?: string } // number line visual
  | { type: "grid"; rows: number; cols: number; emoji?: string } // grid visual for multiplication/geometry
  | { type: "clock"; hour: number; minute: number } // analog clock face (the question stimulus)
  // ── Mathematics manipulatives ──────────────────────────────────────────────
  | { type: "ten_frame"; total: number; filled: number } // ten-frame showing a number (up to 20)
  | {
      type: "number_bond";
      whole: number;
      part1: number | null; // null = unknown (child fills in)
      part2: number | null;
    }
  | {
      type: "part_whole";
      whole: number | null;
      parts: (number | null)[];
    }
  | {
      type: "place_value_blocks";
      hundreds: number;
      tens: number;
      ones: number;
    }
  // ── Phonics manipulatives ──────────────────────────────────────────────────
  | {
      type: "letter_tiles";
      /** Letters to display as tiles, in order. The child drags/taps them. */
      tiles: string[];
      /** The target word's graphemes in order (for validation). */
      targetGraphemes: string[];
    }
  | {
      type: "phoneme_boxes";
      /** The word to segment — shown as a picture, never in text during the task. */
      wordEmoji: string;
      /** Number of phoneme boxes (= number of phonemes in the word). */
      boxCount: number;
    };

export type InteractionType =
  | "multiple_choice"
  | "fill_blank"
  | "number_line"
  | "tap_to_count"
  | "ordering"
  // Phonics interactions
  | "tile_build"      // drag letter tiles to build a CVC word
  | "phoneme_tap"     // tap a box for each sound in a spoken word
  // Mathematics manipulative interactions
  | "ten_frame_fill"  // tap ten-frame cells to show a number
  | "number_bond_fill"; // fill in the missing part of a number bond

/** What the browser is allowed to see before a child answers (no answer, no explanation). */
export interface PublicData {
  question: string;
  options: string[];
  passage?: string;
  visual?: Visual;
  /** option -> emoji, rendered as a picture on the answer tile */
  icons?: Record<string, string>;
  interactionType?: InteractionType;
  /** Props for interactive question modes */
  numberLineConfig?: { min: number; max: number; step?: number };
  orderingInitial?: string[];
  tapCountConfig?: { emoji: string; maxCount: number };
  placeholder?: string;
}

export interface PublicExercise {
  id: string;
  topicId?: string;
  title: string;
  instructions: string;
  difficulty: string;
  level: number;
  data: PublicData;
}

export interface DoneSummary {
  status: "done";
  reason: "time" | "rest";
  usedSec: number;
  goalSec: number;
  answered: number;
  correct: number;
  xp: number;
  stars: number;
  /** another world that still has practice time today */
  next: { id: string; name: string } | null;
}

/** Why this question was chosen, when it is not just the next one in the child's level. */
export type QuestionNote =
  | { kind: "review"; topicName: string } // memory refresher from another skill that is due
  | { kind: "recovery" }; // an easier bridge question right after a miss

export type PlayState =
  | { status: "question"; exercise: PublicExercise; level: number; usedSec: number; goalSec: number; note?: QuestionNote }
  | DoneSummary
  | { status: "empty" };
