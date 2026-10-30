/**
 * src/lib/letter-formation.ts
 *
 * Letter formation guide data for P2 — Developmental Learning.
 *
 * Provides structured guidance for correct letter formation:
 *   - Starting point (described in child-friendly language)
 *   - Step-by-step directions
 *   - Common errors and how to correct them
 *   - Rhyme/verbal cue for the child to say while forming the letter
 *   - Uppercase and lowercase versions
 *
 * No images are required — all directions are text-based and work with
 * a simple SVG path hint or a verbal cue.
 */

export interface LetterFormation {
  letter: string;        // The letter (uppercase)
  lower: string;         // The lowercase version
  group: string;         // Letter family / formation group
  verbCue: string;       // Child-friendly verbal cue (say while writing)
  steps: string[];       // Step-by-step directions
  commonError: string;   // The most common mistake
  correction: string;    // How to address it
  /** Approximate SVG path for a 100×100 viewBox — just a hint, not pixel-perfect */
  svgHint?: string;
}

export const LETTER_FORMATIONS: LetterFormation[] = [
  // ── c-family (start on the curve) ────────────────────────────────────────
  {
    letter: "C", lower: "c",
    group: "Curve letters",
    verbCue: "Round and round like a rainbow — stop before you close it!",
    steps: ["Start near the top, just below the ceiling.", "Curve to the left, go down, then curve back up — like a big smile.", "Stop before you close the circle."],
    commonError: "Going the wrong way (clockwise instead of anti-clockwise).",
    correction: "Trace the letter with your finger and say 'start here, go LEFT'. Use a rainbow shape as a reminder.",
    svgHint: "M 70 20 A 40 40 0 1 0 70 80",
  },
  {
    letter: "O", lower: "o",
    group: "Curve letters",
    verbCue: "Round and round and close the door!",
    steps: ["Start near the top.", "Curve left all the way round.", "Come back to where you started to close it."],
    commonError: "Starting at the bottom or going clockwise.",
    correction: "Put a small dot where the letter starts (top, slightly left of centre). Always go anti-clockwise.",
    svgHint: "M 50 15 A 35 35 0 1 0 50.01 15",
  },
  {
    letter: "G", lower: "g",
    group: "Curve letters",
    verbCue: "Round like a c, then slide a shelf in!",
    steps: ["Form a c shape.", "At the middle-right, add a short horizontal line going left."],
    commonError: "Making the shelf go up instead of left.",
    correction: "Pause and point: 'The shelf goes flat — not up!'",
  },
  {
    letter: "D", lower: "d",
    group: "Curve letters",
    verbCue: "Up to the top, come back down, then bump out!",
    steps: ["For lowercase d: start by making a c shape first.", "Then go all the way up to the top line.", "Come back straight down."],
    commonError: "Reversing d and b.",
    correction: "Tip: 'b' has its belly on the right, 'd' has its belly on the left. Make a bed shape with your hands — left fist b, right fist d.",
  },

  // ── l-family (tall straight letters) ─────────────────────────────────────
  {
    letter: "L", lower: "l",
    group: "Straight letters",
    verbCue: "Down, then along the floor!",
    steps: ["Start at the top.", "Pull straight down.", "At the bottom, add a short line to the right (the foot)."],
    commonError: "Making the foot go up instead of right.",
    correction: "Say 'l stands on the floor' — the foot goes flat.",
  },
  {
    letter: "I", lower: "i",
    group: "Straight letters",
    verbCue: "Down, then dot your i!",
    steps: ["Start just below the middle line.", "Pull straight down.", "Lift the pencil and add a small dot above."],
    commonError: "Forgetting the dot, or placing it too far away.",
    correction: "Say 'i always wears its hat' — the dot sits just above.",
  },
  {
    letter: "T", lower: "t",
    group: "Straight letters",
    verbCue: "Down, then across for the arms!",
    steps: ["Start at the top.", "Pull straight down to the bottom.", "Cross through the middle with a short line going left then right."],
    commonError: "Crossing too high (looks like a plus sign) or too low.",
    correction: "The cross should sit at mid-height, not at the very top.",
  },

  // ── n-family (hump letters) ────────────────────────────────────────────────
  {
    letter: "N", lower: "n",
    group: "Hump letters",
    verbCue: "Down, up, over the hill, and down!",
    steps: ["Pull straight down.", "Go back up to the top.", "Arch over like a rainbow.", "Come back down."],
    commonError: "Reversing to make a ∩ shape going the wrong way.",
    correction: "Always start on the LEFT side — 'n always starts on the left'.",
  },
  {
    letter: "M", lower: "m",
    group: "Hump letters",
    verbCue: "Down, up, over one hill, over another hill, and down!",
    steps: ["Pull straight down.", "Go back to the top.", "Arch over the first hill, come down.", "Go back up, arch over the second hill, come down."],
    commonError: "Only making one hump.",
    correction: "Hold up two fingers — 'm has two bumps, n has one'.",
  },
  {
    letter: "H", lower: "h",
    group: "Hump letters",
    verbCue: "Down the tall tree, back up halfway, arch over and down!",
    steps: ["Pull a tall line down.", "Go back up to halfway.", "Arch over to the right.", "Come straight down."],
    commonError: "Starting the arch from the top instead of halfway.",
    correction: "Mark the halfway point on practice lines.",
  },

  // ── r-family ───────────────────────────────────────────────────────────────
  {
    letter: "R", lower: "r",
    group: "Hump letters",
    verbCue: "Down, back up, bump out, then kick the leg!",
    steps: ["Pull straight down.", "Go back to the top.", "Make a small bump to the right (like the top of a p).", "Add a diagonal leg going down-right from the bottom of the bump."],
    commonError: "Forgetting the leg, making it look like a P.",
    correction: "Say 'R always kicks its leg out'.",
  },
  {
    letter: "P", lower: "p",
    group: "Hump letters",
    verbCue: "Down past the floor, back up, bump out!",
    steps: ["Pull down below the line (descender).", "Go back to the top.", "Make a bump to the right, closing at the middle line."],
    commonError: "Bump goes too low — looks like a b.",
    correction: "P's bump closes at the middle, not the bottom.",
  },

  // ── a-family ───────────────────────────────────────────────────────────────
  {
    letter: "A", lower: "a",
    group: "Curve + line letters",
    verbCue: "Round like a c, up and over, then slide down!",
    steps: ["For lowercase a: start by making a c shape.", "Close the circle at the top.", "Add a straight line down on the right side."],
    commonError: "Reversing — making a d shape.",
    correction: "Remind: 'a has its tummy on the LEFT'.",
  },
  {
    letter: "Q", lower: "q",
    group: "Curve + line letters",
    verbCue: "Make an o, then add a little tail inside!",
    steps: ["Make a complete o circle.", "Add a short diagonal line inside the bottom-right."],
    commonError: "Adding the tail outside the circle.",
    correction: "Q's tail is tucked inside — like a cat's tail curling in.",
  },

  // ── zigzag family ──────────────────────────────────────────────────────────
  {
    letter: "V", lower: "v",
    group: "Zigzag letters",
    verbCue: "Down to a point, then back up!",
    steps: ["Slant down to the right to a sharp point.", "Slant back up to the right."],
    commonError: "Rounding the bottom — making it look like a u.",
    correction: "Press the pencil firmly at the bottom to make a sharp point.",
  },
  {
    letter: "W", lower: "w",
    group: "Zigzag letters",
    verbCue: "Down, up, down, up — two v's together!",
    steps: ["Slant down to a point.", "Back up.", "Slant down again to a point.", "Back up to finish."],
    commonError: "Only making one V.",
    correction: "Count the points: 'W has two valleys'.",
  },
  {
    letter: "Z", lower: "z",
    group: "Zigzag letters",
    verbCue: "Across, zip down, across again!",
    steps: ["Horizontal line across the top.", "Diagonal line down to the bottom left.", "Horizontal line across the bottom."],
    commonError: "Reversing the middle diagonal — making an S shape.",
    correction: "The middle of z goes DOWN-LEFT, like a zip-zag.",
  },
];

/** Groups letters by formation family */
export function lettersByGroup(): Record<string, LetterFormation[]> {
  const groups: Record<string, LetterFormation[]> = {};
  for (const lf of LETTER_FORMATIONS) {
    if (!groups[lf.group]) groups[lf.group] = [];
    groups[lf.group].push(lf);
  }
  return groups;
}
