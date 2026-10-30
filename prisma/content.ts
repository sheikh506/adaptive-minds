import { generateStoryFractions, generateStoryMath, difficultyFor, type SeedExercise } from "./stories";
import { generateComprehension, generatePhonics, generateVocabulary } from "./reading";
import { generateCounting, generateData, generateGeometry, generateMeasurement, generateMoney, generateTime } from "./math-extra";
import { generateGrammar, generateLetters, generateSpelling } from "./language";
import { generateEarthSpace, generateLifeScience, generateMatterEnergy } from "./science";
import { Difficulty } from "@prisma/client";

export type { SeedExercise };

// Reading content (hand-written)

const mc = (
  id: string, topicId: string, title: string, level: number, instructions: string,
  question: string, options: string[], answer: string, explanation: string, passage?: string
): SeedExercise => ({
  id, topicId, title, instructions, type: passage ? "reading_comp" : "multiple_choice",
  difficulty: difficultyFor(level), level,
  xpReward: 8 + level * 2, starReward: passage || level >= 6 ? 2 : 1,
  data: { question, options, answer, explanation, ...(passage ? { passage } : {}) },
});

function readingContent(): SeedExercise[] {
  const P = "topic-phonics", V = "topic-vocabulary", C = "topic-comprehension";
  return [
    // Phonics
    mc("rd-ph-1", P, "Letter sounds", 1, "Pick the word that starts with the same sound.", "Which word starts with the same sound as 'cat'?", ["dog", "cup", "sun", "hat"], "cup", "'cat' and 'cup' both start with the /k/ sound."),
    mc("rd-ph-2", P, "Rhyming", 1, "Find the rhyme.", "Which word rhymes with 'book'?", ["cook", "boat", "bike", "bone"], "cook", "'book' and 'cook' both end in -ook."),
    mc("rd-ph-3", P, "Ending sounds", 2, "Listen for the last sound.", "Which word ends with the same sound as 'dog'?", ["dot", "pig", "fan", "sun"], "pig", "'dog' and 'pig' both end with the /g/ sound."),
    mc("rd-ph-4", P, "Vowel sounds", 2, "Pick the matching vowel sound.", "Which word has the same vowel sound as 'bed'?", ["red", "bad", "bid", "bud"], "red", "'bed' and 'red' both have the short e sound."),
    mc("rd-ph-5", P, "Blends", 3, "Choose the correct blend.", "Which word begins with the 'bl' blend?", ["flag", "black", "crab", "drum"], "black", "'black' starts with b + l blended together."),
    mc("rd-ph-6", P, "Digraphs", 4, "Find the digraph.", "Which word has the 'sh' sound at the start?", ["chip", "ship", "thin", "whale"], "ship", "'ship' starts with the /sh/ digraph."),
    mc("rd-ph-7", P, "Silent letters", 5, "Spot the silent letter.", "Which letter is silent in 'knife'?", ["k", "n", "i", "f"], "k", "The k in 'knife' is silent; it is pronounced 'nife'."),
    mc("rd-ph-8", P, "Syllables", 6, "Count the syllables.", "How many syllables are in 'elephant'?", ["2", "3", "4", "5"], "3", "el-e-phant has 3 syllables."),
    mc("rd-ph-9", P, "Long vowels", 7, "Pick the long vowel word.", "Which word has a long 'a' sound?", ["cap", "cake", "cab", "can"], "cake", "The silent e makes the 'a' in 'cake' say its name."),
    // Vocabulary
    mc("rd-vo-1", V, "Opposites", 1, "Find the opposite.", "What is the opposite of 'hot'?", ["warm", "cold", "wet", "big"], "cold", "Hot and cold are opposites."),
    mc("rd-vo-2", V, "Synonyms", 2, "Find the word that means the same.", "Which word means the same as 'happy'?", ["sad", "angry", "joyful", "tired"], "joyful", "'Joyful' and 'happy' mean almost the same thing."),
    mc("rd-vo-3", V, "Word meaning", 3, "Choose the best meaning.", "What does 'tiny' mean?", ["very big", "very small", "very loud", "very old"], "very small", "'Tiny' means extremely small."),
    mc("rd-vo-4", V, "Context clues", 4, "Use the sentence to decide.", "'The thirsty hiker gulped down the water.' What does 'gulped' mean?", ["drank quickly", "poured out", "sipped slowly", "carried"], "drank quickly", "A thirsty hiker would drink quickly."),
    mc("rd-vo-5", V, "Prefixes", 5, "Think about the prefix.", "What does the prefix 'un-' mean in 'unhappy'?", ["very", "not", "again", "before"], "not", "'Un-' means 'not', so unhappy means not happy."),
    mc("rd-vo-6", V, "Suffixes", 6, "Think about the suffix.", "What does the suffix '-less' mean in 'careless'?", ["full of", "without", "more", "again"], "without", "'-less' means 'without', so careless means without care."),
    mc("rd-vo-7", V, "Multiple meanings", 7, "Pick the right meaning.", "'The bat flew out of the cave.' What is the bat?", ["a sports tool", "a flying animal", "a toy", "a hat"], "a flying animal", "Flying out of a cave tells us it is an animal."),
    mc("rd-vo-8", V, "Advanced synonyms", 8, "Find the closest meaning.", "Which word is closest in meaning to 'reluctant'?", ["eager", "unwilling", "angry", "quick"], "unwilling", "'Reluctant' means not wanting to do something."),
    mc("rd-vo-9", V, "Figurative language", 9, "Understand the phrase.", "'It's raining cats and dogs.' means:", ["Animals are falling", "It is raining very hard", "It is a sunny day", "There is a pet show"], "It is raining very hard", "It is an idiom meaning heavy rain."),
    // Comprehension
    mc("rd-co-1", C, "A red ball", 2, "Read the passage and answer.", "Where did the ball roll?", ["Into the street", "Under the fence", "Into a tree", "Down the hill"], "Under the fence", "The passage says it rolled under the fence.", "Sam has a red ball. He plays with it every day after school. One day, the ball rolled under the fence and into the neighbor's yard."),
    mc("rd-co-2", C, "The lost puppy", 3, "Read the passage and answer.", "How did Mia feel at the end?", ["Sad", "Happy", "Angry", "Scared"], "Happy", "She found the puppy and smiled.", "Mia's puppy ran away on Monday. She looked in the park and by the river. At last she found him asleep under a bench. Mia hugged him and smiled all the way home."),
    mc("rd-co-3", C, "Bees", 4, "Read the passage and answer.", "What do bees use to make honey?", ["Leaves", "Nectar from flowers", "Water only", "Seeds"], "Nectar from flowers", "The passage says bees collect nectar.", "Bees visit flowers to collect a sweet liquid called nectar. They carry it back to the hive, where it slowly turns into honey."),
    mc("rd-co-4", C, "Main idea", 5, "Read the passage and answer.", "What is the main idea?", ["Recycling helps the planet", "Plastic is colorful", "Trucks are loud", "Paper is expensive"], "Recycling helps the planet", "Every sentence explains how recycling helps.", "When we recycle paper, glass, and plastic, we save energy and keep trash out of landfills. Recycling also reduces pollution and protects animals' homes."),
    mc("rd-co-5", C, "Inference", 6, "Read the passage and answer.", "What can you infer about the weather?", ["It was sunny", "It was stormy", "It was snowing", "It was windy and dry"], "It was stormy", "Thunder, dark clouds and rain suggest a storm.", "Leo grabbed his umbrella as thunder rumbled. The sky was dark, and big drops began to tap on the window."),
    mc("rd-co-6", C, "Cause and effect", 7, "Read the passage and answer.", "Why did the plant wilt?", ["Too much sun", "It did not get water", "It was too cold", "It had no soil"], "It did not get water", "Nobody watered it for two weeks.", "Ana forgot to water her plant for two weeks. The leaves turned yellow and drooped. When she finally watered it, the plant slowly recovered."),
  ];
}

/** Expanded Grade 3–8 Standards (Decimals, Geometry, and Multi-Step Reasoning) */
function generateExpandedStandards(): SeedExercise[] {
  const add = "topic-addition";
  const mult = "topic-multiplication";
  const frac = "topic-fractions";

  return [
    // Decimals & Money
    {
      id: "std-dec-1",
      topicId: add,
      title: "Adding Decimals",
      instructions: "Add the money amounts.",
      type: "multiple_choice",
      difficulty: Difficulty.MEDIUM,
      level: 6,
      xpReward: 20,
      starReward: 2,
      data: {
        question: "Maya bought a notebook for $2.45 and a pen for $1.30. What was her total cost?",
        options: ["$3.75", "$3.65", "$3.85", "$4.00"],
        answer: "$3.75",
        explanation: "$2.45 + $1.30 = $3.75",
      },
    },
    {
      id: "std-dec-2",
      topicId: add,
      title: "Decimal Place Value",
      instructions: "Find the sum with tenths.",
      type: "multiple_choice",
      difficulty: Difficulty.MEDIUM,
      level: 7,
      xpReward: 22,
      starReward: 2,
      data: {
        question: "What is 4.6 + 3.8?",
        options: ["8.4", "8.2", "7.4", "7.14"],
        answer: "8.4",
        explanation: "4.6 + 3.8 = 8.4",
      },
    },
    // Geometry & Area Models
    {
      id: "std-geo-1",
      topicId: mult,
      title: "Area of a Rectangle",
      instructions: "Calculate the total area.",
      type: "multiple_choice",
      difficulty: Difficulty.MEDIUM,
      level: 6,
      xpReward: 20,
      starReward: 2,
      data: {
        question: "A garden bed has a length of 6 meters and a width of 4 meters. What is the total area in square meters?",
        options: ["24", "20", "28", "10"],
        answer: "24",
        explanation: "Area = length × width = 6 × 4 = 24 square meters.",
        visual: { type: "grid", rows: 4, cols: 6, emoji: "🌱" },
      },
    },
    {
      id: "std-geo-2",
      topicId: mult,
      title: "Perimeter Calculation",
      instructions: "Find the perimeter of the rectangle.",
      type: "multiple_choice",
      difficulty: Difficulty.HARD,
      level: 8,
      xpReward: 24,
      starReward: 2,
      data: {
        question: "A playground rectangle is 12 meters long and 8 meters wide. What is its perimeter around all four sides?",
        options: ["40", "96", "48", "36"],
        answer: "40",
        explanation: "Perimeter = 2 × (12 + 8) = 2 × 20 = 40 meters.",
      },
    },
    // Multi-Step Reasoning
    {
      id: "std-step-1",
      topicId: mult,
      title: "Two-Step Problem",
      instructions: "Solve the two-step problem.",
      type: "multiple_choice",
      difficulty: Difficulty.HARD,
      level: 8,
      xpReward: 24,
      starReward: 2,
      data: {
        question: "Lucas bought 3 packs of stickers with 8 stickers in each pack. He gave 5 stickers to his sister. How many stickers does he have left?",
        options: ["19", "24", "21", "16"],
        answer: "19",
        explanation: "Step 1: 3 × 8 = 24 total stickers. Step 2: 24 - 5 = 19 stickers left.",
      },
    },
    {
      id: "std-step-2",
      topicId: frac,
      title: "Fraction of a Set",
      instructions: "Find the fraction of the total.",
      type: "multiple_choice",
      difficulty: Difficulty.HARD,
      level: 9,
      xpReward: 26,
      starReward: 2,
      data: {
        question: "There are 20 balloons in a party box. 3/4 of them are blue. How many balloons are blue?",
        options: ["15", "12", "16", "10"],
        answer: "15",
        explanation: "1/4 of 20 is 5. So 3/4 is 3 × 5 = 15 blue balloons.",
      },
    },
  ];
}

export function buildExercises(): SeedExercise[] {
  return [
    ...generateStoryMath(),
    ...generateStoryFractions(),
    ...generatePhonics(),
    ...generateVocabulary(),
    ...generateComprehension(),
    ...readingContent(),
    ...generateExpandedStandards(),
    ...generateCounting(),
    ...generateGeometry(),
    ...generateMeasurement(),
    ...generateTime(),
    ...generateMoney(),
    ...generateData(),
    ...generateLetters(),
    ...generateSpelling(),
    ...generateGrammar(),
    ...generateLifeScience(),
    ...generateEarthSpace(),
    ...generateMatterEnergy(),
  ];
}
