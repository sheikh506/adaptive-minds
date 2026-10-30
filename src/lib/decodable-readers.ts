/**
 * src/lib/decodable-readers.ts
 *
 * Decodable readers for P2 — Reading & Story Time.
 *
 * Each reader is a very short book (4-6 pages) built from a controlled set of
 * grapheme-phoneme correspondences that a child must have mastered before the
 * book is appropriate for them to read INDEPENDENTLY.
 *
 * Design rules:
 *   - Every word in a decodable reader can be decoded using only the listed
 *     grapheme patterns plus a small set of pre-taught high-frequency words.
 *   - High-frequency / sight words that cannot yet be decoded are explicitly listed
 *     so a teacher or parent can pre-teach them.
 *   - Each reader is labelled with the prerequisite skill IDs from skill-curriculum.ts
 *     so the skill engine can surface the right book at the right time.
 *   - Comprehension support includes: vocabulary-in-context, sequencing,
 *     prediction, retelling prompts — at developmentally appropriate levels.
 *   - None of these books replace the original STORIES — they exist alongside them.
 */

export interface DecodablePage {
  /** The text on this page — uses only decodable + sight words. */
  text: string;
  /** A simple scene description for the illustration (emoji). */
  scene: string;
}

export interface ComprehensionActivity {
  type: "retell" | "sequence" | "predict" | "vocab" | "question";
  prompt: string;
  /** For type "question": one correct answer and distractors. */
  options?: string[];
  answer?: string;
  /** Plain-language explanation of why this answer is right. */
  why?: string;
  /** For type "sequence": the correct order of events. */
  events?: string[];
  /** For type "vocab": the word and its kid-friendly definition. */
  word?: string;
  definition?: string;
}

export interface DecodableReader {
  id: string;
  title: string;
  emoji: string;
  /** Tailwind gradient for the cover card */
  cover: string;
  /** Which phonics skills a child must have mastered (from skill-curriculum.ts IDs) */
  prerequisiteSkills: string[];
  /** The grapheme patterns practised in this book */
  patternsUsed: string[];
  /** Sight words used that cannot be decoded from the listed patterns */
  sightWords: string[];
  /** Approximate reading level label */
  readingLevel: "Step 1" | "Step 2" | "Step 3" | "Step 4";
  pages: DecodablePage[];
  comprehension: ComprehensionActivity[];
}

export const DECODABLE_READERS: DecodableReader[] = [

  // ── STEP 1: CVC words only, short vowels a and i ──────────────────────────

  {
    id: "dr-the-big-cat",
    title: "The Big Cat",
    emoji: "🐱",
    cover: "from-orange-400 to-amber-500",
    prerequisiteSkills: ["ph-cvc-blending", "ph-letter-sounds-vowels-short"],
    patternsUsed: ["CVC words with short /a/ and short /i/"],
    sightWords: ["the", "a", "is", "it"],
    readingLevel: "Step 1",
    pages: [
      { scene: "🐱🌳", text: "The cat sat." },
      { scene: "🐱🎩", text: "The cat sat on a mat." },
      { scene: "🐱🐭", text: "The cat can tap it." },
      { scene: "🐱😴", text: "The big cat is fat." },
      { scene: "🐱💤", text: "The fat cat naps." },
      { scene: "🐱🌅", text: "The cat is a big cat." },
    ],
    comprehension: [
      {
        type: "question",
        prompt: "Where did the cat sit?",
        options: ["On a mat", "In a hat", "On a bin", "In a pit"],
        answer: "On a mat",
        why: "The story says 'The cat sat on a mat.'",
      },
      {
        type: "retell",
        prompt: "Tell the story of the cat in your own words. What happened first? What happened next? What happened at the end?",
      },
      {
        type: "vocab",
        word: "fat",
        definition: "'Fat' means big and round. In this story it just means the cat is big — not a mean word!",
      },
    ],
  },

  {
    id: "dr-pip-and-the-pin",
    title: "Pip and the Pin",
    emoji: "📌",
    cover: "from-sky-400 to-blue-500",
    prerequisiteSkills: ["ph-cvc-blending", "ph-letter-sounds-vowels-short"],
    patternsUsed: ["CVC words with short /i/", "CVC words with short /a/"],
    sightWords: ["the", "a", "is", "has"],
    readingLevel: "Step 1",
    pages: [
      { scene: "👦📌", text: "Pip has a pin." },
      { scene: "👦🎨", text: "Pip can fix it. Pip can tip it." },
      { scene: "👦🖼️", text: "Pip pins it on." },
      { scene: "👦😊", text: "Pip is a big kid." },
    ],
    comprehension: [
      {
        type: "question",
        prompt: "What does Pip have?",
        options: ["A pin", "A pan", "A pig", "A pit"],
        answer: "A pin",
        why: "The first page says 'Pip has a pin.'",
      },
      {
        type: "sequence",
        prompt: "Put these events in order:",
        events: ["Pip pins it on.", "Pip has a pin.", "Pip can fix it."],
      },
    ],
  },

  // ── STEP 2: CVC all vowels + digraphs sh, ch, th ─────────────────────────

  {
    id: "dr-the-fish-and-the-ship",
    title: "The Fish and the Ship",
    emoji: "🐟",
    cover: "from-cyan-400 to-teal-500",
    prerequisiteSkills: ["ph-cvc-blending", "ph-digraphs"],
    patternsUsed: ["sh digraph", "CVC words with short vowels"],
    sightWords: ["the", "a", "and", "is", "into", "they"],
    readingLevel: "Step 2",
    pages: [
      { scene: "🐟🌊", text: "A fish swam in the shallows." },
      { scene: "🚢🌊", text: "A big ship came into the sea." },
      { scene: "🐟😮🚢", text: "The fish shot past the ship." },
      { scene: "🐟🐚", text: "It hid in a shell." },
      { scene: "🚢🌅", text: "The ship went past. The fish was safe." },
    ],
    comprehension: [
      {
        type: "question",
        prompt: "Where did the fish hide?",
        options: ["In a shell", "On the ship", "In the sand", "Under a net"],
        answer: "In a shell",
        why: "The story says 'It hid in a shell.'",
      },
      {
        type: "predict",
        prompt: "Before you read: the fish sees a big ship coming. What do you think it will do?",
      },
      {
        type: "vocab",
        word: "shallows",
        definition: "The shallows is the part of the sea near the shore where the water is not very deep.",
      },
    ],
  },

  {
    id: "dr-chad-chips",
    title: "Chad and the Chips",
    emoji: "🍟",
    cover: "from-yellow-400 to-orange-400",
    prerequisiteSkills: ["ph-cvc-blending", "ph-digraphs"],
    patternsUsed: ["ch digraph", "sh digraph", "th digraph"],
    sightWords: ["the", "a", "and", "his", "they", "he"],
    readingLevel: "Step 2",
    pages: [
      { scene: "👦🍟", text: "Chad had chips and a chop." },
      { scene: "👦😊", text: "He chomped them up. Chomp! Chomp!" },
      { scene: "👦🙊", text: "Chad shared chips with his friend." },
      { scene: "👫👍", text: "They cheered. Sharing is the best!" },
    ],
    comprehension: [
      {
        type: "question",
        prompt: "What did Chad do with his chips?",
        options: ["He shared them", "He hid them", "He dropped them", "He threw them"],
        answer: "He shared them",
        why: "The story says 'Chad shared chips with his friend.'",
      },
      {
        type: "retell",
        prompt: "Tell someone at home what happened in this story. Try to use the words: chips, shared, cheered.",
      },
    ],
  },

  // ── STEP 3: CVC + digraphs + initial blends ───────────────────────────────

  {
    id: "dr-a-frog-on-a-log",
    title: "A Frog on a Log",
    emoji: "🐸",
    cover: "from-green-400 to-emerald-500",
    prerequisiteSkills: ["ph-initial-blends", "ph-digraphs"],
    patternsUsed: ["fr blend", "gl blend", "tr blend", "CVC + digraph review"],
    sightWords: ["a", "the", "on", "and", "was", "it", "by"],
    readingLevel: "Step 3",
    pages: [
      { scene: "🐸🪵🌿", text: "A frog sat on a log by a pond." },
      { scene: "🐸🪰", text: "It grabbed a fly. Snap!" },
      { scene: "🐸😊🌿", text: "The frog grinned and stretched its legs." },
      { scene: "🐸🌊", text: "It sprang off the log and into the water." },
      { scene: "🐸💦", text: "Splash! The frog swam to the other side." },
    ],
    comprehension: [
      {
        type: "question",
        prompt: "Where was the frog sitting?",
        options: ["On a log", "In a tree", "On a rock", "In the grass"],
        answer: "On a log",
        why: "The story says 'A frog sat on a log by a pond.'",
      },
      {
        type: "sequence",
        prompt: "Number these events in the order they happened:",
        events: [
          "The frog sprang into the water.",
          "The frog sat on a log.",
          "The frog grabbed a fly.",
          "The frog grinned and stretched.",
        ],
      },
      {
        type: "vocab",
        word: "sprang",
        definition: "'Sprang' is the past tense of 'spring'. It means to jump suddenly with great force.",
      },
    ],
  },

  // ── STEP 4: Silent e + vowel teams ────────────────────────────────────────

  {
    id: "dr-jake-makes-a-cake",
    title: "Jake Makes a Cake",
    emoji: "🎂",
    cover: "from-pink-400 to-fuchsia-500",
    prerequisiteSkills: ["ph-long-vowels-silent-e", "ph-initial-blends"],
    patternsUsed: ["VCe long /a/ (cake, make, bake, name)", "VCe long /i/ (like, mine)"],
    sightWords: ["the", "a", "and", "he", "his", "for", "with"],
    readingLevel: "Step 4",
    pages: [
      { scene: "👦🥚🍰", text: "Jake likes to bake." },
      { scene: "👦🥣", text: "He makes a cake for his mum." },
      { scene: "👦🎨🍰", text: "He pipes her name in pink icing." },
      { scene: "👩🎂", text: "Mum smiles. 'This is mine!' she says." },
      { scene: "👨‍👩‍👦🎂🕯️", text: "They all have a slice. It is a great cake." },
    ],
    comprehension: [
      {
        type: "question",
        prompt: "Who does Jake make the cake for?",
        options: ["His mum", "His dad", "His friend", "His teacher"],
        answer: "His mum",
        why: "The story says 'He makes a cake for his mum.'",
      },
      {
        type: "predict",
        prompt: "Before you read page 3: Jake has baked the cake. What do you think he will do next?",
      },
      {
        type: "vocab",
        word: "icing",
        definition: "Icing is the sweet, smooth coating on a cake, often white or coloured. You can write on it!",
      },
      {
        type: "retell",
        prompt: "Retell this story to a family member. Can you remember why Jake baked the cake and what he wrote on it?",
      },
    ],
  },
];

/**
 * Returns decodable readers appropriate for a child's current skill states.
 * A reader is appropriate when ALL its prerequisiteSkills are MASTERED or REVIEW.
 */
export function readersForSkillStates(
  skillStates: Map<string, string /* SkillStage */>,
  readers: DecodableReader[] = DECODABLE_READERS
): DecodableReader[] {
  return readers.filter((reader) =>
    reader.prerequisiteSkills.every((skillId) => {
      const stage = skillStates.get(skillId);
      return stage === "MASTERED" || stage === "REVIEW";
    })
  );
}

/**
 * Returns all readers regardless of skill state — for browsing or teacher use.
 */
export function allReaders(): DecodableReader[] {
  return DECODABLE_READERS;
}
