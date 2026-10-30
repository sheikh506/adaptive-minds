/**
 * Skill Curriculum — P1-DB1
 *
 * Defines every LearningSkill, its prerequisites, learning objective,
 * and the developmental stage range it targets.
 *
 * Stage mapping (approximate):
 *   0 = Kindergarten (age 4-5)
 *   1 = Grade 1 (age 5-6)
 *   2 = Grade 2 (age 6-7)
 *   3 = Grade 3 (age 7-8)
 *   4 = Grade 4+
 *
 * These are seeded via the skills-seed script, not baked into seed.ts,
 * so the curriculum can be updated without re-running the full seed.
 *
 * Design rules:
 *   - Stable IDs: once published, an ID never changes (it is a foreign key in StudentSkillState)
 *   - Prerequisites form a DAG (no cycles)
 *   - Each skill has a clear, observable objective
 *   - No fabricated mastery: state rows are only created when a child actually attempts
 */

export interface SkillDef {
  id: string;
  subject: "MATH" | "READING" | "SCIENCE";
  name: string;
  objective: string;
  stageMin: number;
  stageMax: number;
  order: number;
  /** Prerequisite skill IDs. Must all be in this list. */
  prerequisites: string[];
}

export const SKILL_CURRICULUM: SkillDef[] = [

  // ─── PHONICS & EARLY READING (topic: phonics, letters) ──────────────────

  {
    id: "ph-letter-names",
    subject: "READING",
    name: "Letter Names",
    objective: "Name all 26 uppercase and lowercase letters of the alphabet in any order.",
    stageMin: 0, stageMax: 1, order: 1,
    prerequisites: [],
  },
  {
    id: "ph-letter-sounds-consonants",
    subject: "READING",
    name: "Consonant Sounds",
    objective: "Produce the most common sound for each consonant letter (b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, w, x, y, z).",
    stageMin: 0, stageMax: 1, order: 2,
    prerequisites: ["ph-letter-names"],
  },
  {
    id: "ph-letter-sounds-vowels-short",
    subject: "READING",
    name: "Short Vowel Sounds",
    objective: "Produce the short vowel sound for a, e, i, o, u (as in: cat, bed, sit, hot, cup).",
    stageMin: 0, stageMax: 1, order: 3,
    prerequisites: ["ph-letter-names"],
  },
  {
    id: "ph-cvc-blending",
    subject: "READING",
    name: "CVC Blending",
    objective: "Blend three phonemes (consonant-vowel-consonant) to decode simple words such as cat, dog, pen, sit.",
    stageMin: 1, stageMax: 2, order: 4,
    prerequisites: ["ph-letter-sounds-consonants", "ph-letter-sounds-vowels-short"],
  },
  {
    id: "ph-cvc-segmenting",
    subject: "READING",
    name: "CVC Segmenting",
    objective: "Segment spoken CVC words into their individual phonemes (say each sound separately).",
    stageMin: 1, stageMax: 2, order: 5,
    prerequisites: ["ph-letter-sounds-consonants", "ph-letter-sounds-vowels-short"],
  },
  {
    id: "ph-initial-blends",
    subject: "READING",
    name: "Initial Consonant Blends",
    objective: "Read and produce words with initial consonant blends (bl, cl, fl, gl, pl, sl, br, cr, dr, fr, gr, pr, tr, sc, sk, sm, sn, sp, st, sw).",
    stageMin: 1, stageMax: 2, order: 6,
    prerequisites: ["ph-cvc-blending"],
  },
  {
    id: "ph-digraphs",
    subject: "READING",
    name: "Common Digraphs",
    objective: "Read and produce words with digraphs ch, sh, th, wh, and ph.",
    stageMin: 1, stageMax: 2, order: 7,
    prerequisites: ["ph-cvc-blending"],
  },
  {
    id: "ph-long-vowels-silent-e",
    subject: "READING",
    name: "Long Vowels (Silent E)",
    objective: "Decode words with the VCe (silent e) pattern that produce long vowel sounds (e.g. cake, bike, hope, cute).",
    stageMin: 1, stageMax: 2, order: 8,
    prerequisites: ["ph-cvc-blending"],
  },
  {
    id: "ph-vowel-teams",
    subject: "READING",
    name: "Vowel Teams",
    objective: "Read words with common vowel pairs including ai, ay, ee, ea, oa, ow, oo (as in book and moon).",
    stageMin: 2, stageMax: 3, order: 9,
    prerequisites: ["ph-long-vowels-silent-e"],
  },
  {
    id: "ph-rhyme",
    subject: "READING",
    name: "Rhyming",
    objective: "Identify and produce words that rhyme; recognise rhyme families (e.g. cat/bat/hat).",
    stageMin: 0, stageMax: 1, order: 10,
    prerequisites: ["ph-letter-sounds-consonants"],
  },
  {
    id: "ph-syllables",
    subject: "READING",
    name: "Syllable Counting",
    objective: "Count and clap syllables in spoken words of 1-4 syllables.",
    stageMin: 1, stageMax: 2, order: 11,
    prerequisites: ["ph-cvc-blending"],
  },

  // ─── VOCABULARY ──────────────────────────────────────────────────────────

  {
    id: "vocab-opposites",
    subject: "READING",
    name: "Antonyms",
    objective: "Identify common opposite-word pairs (hot/cold, big/small, fast/slow) in simple sentences.",
    stageMin: 0, stageMax: 1, order: 20,
    prerequisites: [],
  },
  {
    id: "vocab-synonyms",
    subject: "READING",
    name: "Synonyms",
    objective: "Match words with similar meanings (happy/joyful, big/huge) using picture and sentence context.",
    stageMin: 1, stageMax: 2, order: 21,
    prerequisites: ["vocab-opposites"],
  },
  {
    id: "vocab-context-clues",
    subject: "READING",
    name: "Context Clues",
    objective: "Use sentence context to determine the meaning of an unknown word.",
    stageMin: 2, stageMax: 3, order: 22,
    prerequisites: ["vocab-synonyms"],
  },

  // ─── FOUNDATIONAL MATHEMATICS ────────────────────────────────────────────

  {
    id: "math-counting-0-10",
    subject: "MATH",
    name: "Counting to 10",
    objective: "Count a set of up to 10 objects accurately, using one-to-one correspondence.",
    stageMin: 0, stageMax: 0, order: 1,
    prerequisites: [],
  },
  {
    id: "math-counting-0-20",
    subject: "MATH",
    name: "Counting to 20",
    objective: "Count forward and backward to 20; identify numerals 0-20.",
    stageMin: 0, stageMax: 1, order: 2,
    prerequisites: ["math-counting-0-10"],
  },
  {
    id: "math-counting-0-100",
    subject: "MATH",
    name: "Counting to 100",
    objective: "Count forward and backward to 100; count by 2s, 5s and 10s.",
    stageMin: 1, stageMax: 2, order: 3,
    prerequisites: ["math-counting-0-20"],
  },
  {
    id: "math-compare-numbers",
    subject: "MATH",
    name: "Compare Numbers",
    objective: "Compare two numbers up to 20 and use the words more, fewer, equal to.",
    stageMin: 0, stageMax: 1, order: 4,
    prerequisites: ["math-counting-0-20"],
  },
  {
    id: "math-addition-to-10",
    subject: "MATH",
    name: "Addition to 10",
    objective: "Compose and decompose numbers to 10; add two single-digit numbers with a sum up to 10.",
    stageMin: 0, stageMax: 1, order: 5,
    prerequisites: ["math-counting-0-10"],
  },
  {
    id: "math-subtraction-within-10",
    subject: "MATH",
    name: "Subtraction within 10",
    objective: "Subtract from numbers up to 10; understand subtraction as taking away.",
    stageMin: 0, stageMax: 1, order: 6,
    prerequisites: ["math-addition-to-10"],
  },
  {
    id: "math-addition-to-20",
    subject: "MATH",
    name: "Addition to 20",
    objective: "Add two single-digit numbers with a sum up to 20; use a number line.",
    stageMin: 1, stageMax: 2, order: 7,
    prerequisites: ["math-addition-to-10"],
  },
  {
    id: "math-subtraction-within-20",
    subject: "MATH",
    name: "Subtraction within 20",
    objective: "Subtract from numbers within 20; relate subtraction to addition.",
    stageMin: 1, stageMax: 2, order: 8,
    prerequisites: ["math-subtraction-within-10", "math-addition-to-20"],
  },
  {
    id: "math-place-value-tens",
    subject: "MATH",
    name: "Place Value: Tens and Ones",
    objective: "Understand that a two-digit number represents tens and ones; decompose numbers e.g. 34 = 3 tens + 4 ones.",
    stageMin: 1, stageMax: 2, order: 9,
    prerequisites: ["math-counting-0-100"],
  },
  {
    id: "math-addition-two-digit",
    subject: "MATH",
    name: "Two-Digit Addition",
    objective: "Add two-digit numbers (without and with regrouping).",
    stageMin: 2, stageMax: 3, order: 10,
    prerequisites: ["math-place-value-tens", "math-addition-to-20"],
  },
  {
    id: "math-subtraction-two-digit",
    subject: "MATH",
    name: "Two-Digit Subtraction",
    objective: "Subtract two-digit numbers (without and with regrouping).",
    stageMin: 2, stageMax: 3, order: 11,
    prerequisites: ["math-addition-two-digit"],
  },
  {
    id: "math-shapes-2d",
    subject: "MATH",
    name: "2D Shapes",
    objective: "Name, describe and sort 2D shapes including circle, square, triangle, rectangle and hexagon.",
    stageMin: 0, stageMax: 1, order: 12,
    prerequisites: [],
  },
  {
    id: "math-shapes-3d",
    subject: "MATH",
    name: "3D Shapes",
    objective: "Name and describe 3D shapes including sphere, cube, cuboid, cylinder and cone.",
    stageMin: 0, stageMax: 2, order: 13,
    prerequisites: ["math-shapes-2d"],
  },
  {
    id: "math-measurement-length",
    subject: "MATH",
    name: "Measurement: Length",
    objective: "Measure and compare lengths using non-standard and standard units; read a simple ruler.",
    stageMin: 1, stageMax: 2, order: 14,
    prerequisites: ["math-compare-numbers"],
  },
  {
    id: "math-time-oclock",
    subject: "MATH",
    name: "Telling Time: O'Clock and Half Past",
    objective: "Read an analogue clock to the hour and half hour.",
    stageMin: 1, stageMax: 2, order: 15,
    prerequisites: ["math-counting-0-20"],
  },

  // ─── EARLY SCIENCE ───────────────────────────────────────────────────────

  {
    id: "sci-living-nonliving",
    subject: "SCIENCE",
    name: "Living and Non-Living",
    objective: "Sort objects and organisms into living and non-living categories and explain the reasoning.",
    stageMin: 0, stageMax: 1, order: 1,
    prerequisites: [],
  },
  {
    id: "sci-plant-parts",
    subject: "SCIENCE",
    name: "Plant Parts",
    objective: "Name the main parts of a plant (root, stem, leaf, flower, seed) and state their function.",
    stageMin: 0, stageMax: 1, order: 2,
    prerequisites: ["sci-living-nonliving"],
  },
  {
    id: "sci-animal-groups",
    subject: "SCIENCE",
    name: "Animal Groups",
    objective: "Sort animals into broad groups (mammals, birds, fish, reptiles, amphibians, insects) using observable features.",
    stageMin: 1, stageMax: 2, order: 3,
    prerequisites: ["sci-living-nonliving"],
  },
  {
    id: "sci-weather-types",
    subject: "SCIENCE",
    name: "Weather Types",
    objective: "Name and describe common weather types (sunny, rainy, cloudy, snowy, windy) and their characteristics.",
    stageMin: 0, stageMax: 1, order: 4,
    prerequisites: [],
  },
  {
    id: "sci-states-matter",
    subject: "SCIENCE",
    name: "States of Matter",
    objective: "Identify and describe solids, liquids and gases with everyday examples.",
    stageMin: 1, stageMax: 2, order: 5,
    prerequisites: [],
  },
];

/**
 * Returns all prerequisite IDs for a given skill, recursively.
 * Used to validate the DAG and build unlock sequences.
 */
export function allPrerequisites(skillId: string, skills: SkillDef[]): Set<string> {
  const skill = skills.find((s) => s.id === skillId);
  if (!skill) return new Set();
  const result = new Set<string>();
  const visit = (id: string) => {
    const s = skills.find((x) => x.id === id);
    if (!s) return;
    for (const req of s.prerequisites) {
      if (!result.has(req)) {
        result.add(req);
        visit(req);
      }
    }
  };
  visit(skillId);
  return result;
}
