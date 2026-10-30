/**
 * "Learn first" lessons. One short lesson per skill: a few kid-sized steps and a worked example.
 * The same content powers the hint ladder (stage 1 = nudge, stage 2 = worked example), so a child can
 * learn the idea before, or while, answering. The worked example is a DIFFERENT problem from the quiz
 * questions, so it never gives an answer away. Pure data: safe to import from the client and the server.
 */

export interface WorkedExample {
  question: string;
  steps: string[];
  answer: string;
}

export interface Lesson {
  title: string;
  emoji: string;
  /** Short steps, one idea each. Written for a 6–10 year old and read aloud with the "Listen" button. */
  steps: string[];
  example: WorkedExample;
  /** Stage 1 hint: a gentle reminder of the strategy. */
  nudge: string;
}

export const LESSONS: Record<string, Lesson> = {
  // ── Math ──────────────────────────────────────────────────────────────────
  "topic-addition": {
    title: "Adding means putting together",
    emoji: "➕",
    steps: [
      "Adding joins two groups to make one bigger group.",
      "Start with the bigger number and count on the smaller one.",
      "For tens and ones: add the ones first, then the tens.",
    ],
    example: {
      question: "There are 6 apples and 3 more come. How many in all?",
      steps: ["Start at 6.", "Count on 3 more: 7, 8, 9."],
      answer: "9",
    },
    nudge: "Start with the bigger number and count on. Tap the pictures to count if it helps.",
  },
  "topic-subtraction": {
    title: "Subtracting means taking away",
    emoji: "➖",
    steps: [
      "Subtracting takes some away from a group.",
      "Start with the whole group, then count back.",
      "You can check: if you add the answer back, you get the start number.",
    ],
    example: {
      question: "There are 9 fish. 4 swim away. How many are left?",
      steps: ["Start at 9.", "Count back 4: 8, 7, 6, 5."],
      answer: "5",
    },
    nudge: "Start with the biggest number and count back. Check by adding your answer back.",
  },
  "topic-multiplication": {
    title: "Multiplying is equal groups",
    emoji: "✖️",
    steps: [
      "Multiplying is adding the same number again and again.",
      "3 × 4 means 3 groups with 4 in each group.",
      "Skip count to check: 4, 8, 12.",
    ],
    example: {
      question: "There are 2 boxes with 5 stickers in each box. How many stickers?",
      steps: ["2 groups of 5.", "5 + 5 = 10."],
      answer: "10",
    },
    nudge: "Find the number of groups and how many are in each group. Skip count to check.",
  },
  "topic-division": {
    title: "Dividing is sharing equally",
    emoji: "➗",
    steps: [
      "Dividing shares a group into equal parts.",
      "Ask: how many in each group, or how many groups?",
      "Check with multiplying: the answer times the divider gives the total.",
    ],
    example: {
      question: "Share 12 cookies between 3 friends. How many does each get?",
      steps: ["Deal one at a time to each friend.", "Each friend ends with 4. Check: 3 × 4 = 12."],
      answer: "4",
    },
    nudge: "Share one at a time, or ask: what times the divider makes the total?",
  },
  "topic-fractions": {
    title: "A fraction is a part of a whole",
    emoji: "🍕",
    steps: [
      "The bottom number says how many equal parts the whole is cut into.",
      "The top number says how many of those parts we are talking about.",
      "To find a fraction of a number, divide by the bottom, then multiply by the top.",
    ],
    example: {
      question: "What is 3/4 of 8?",
      steps: ["Divide 8 by 4: each part is 2.", "Take 3 parts: 3 × 2 = 6."],
      answer: "6",
    },
    nudge: "Bottom number = equal parts. Top number = parts we take. Divide first, then multiply.",
  },
  "topic-counting": {
    title: "Counting things one by one",
    emoji: "🔢",
    steps: [
      "Touch each thing once as you say its number.",
      "The last number you say is how many there are.",
      "Never count the same thing twice. Move each counted thing aside.",
    ],
    example: {
      question: "Count the stars: ⭐⭐⭐⭐",
      steps: ["Touch each star: 1, 2, 3, 4.", "The last number said is 4."],
      answer: "4",
    },
    nudge: "Touch each one as you count. The last number you say is the answer.",
  },
  "topic-geometry": {
    title: "Shapes have sides and corners",
    emoji: "🔷",
    steps: [
      "A triangle has 3 sides and 3 corners. A square has 4 equal sides.",
      "A rectangle has 4 sides: 2 long and 2 short.",
      "Perimeter is the distance around. Area is the space inside.",
    ],
    example: {
      question: "A rectangle is 5 long and 2 wide. What is the distance all the way around?",
      steps: ["Add all four sides: 5 + 2 + 5 + 2.", "That makes 14."],
      answer: "14",
    },
    nudge: "Count the sides and corners. Perimeter adds all the sides. Area multiplies length by width.",
  },
  "topic-measurement": {
    title: "Measure with the right unit",
    emoji: "📏",
    steps: [
      "Use centimetres or metres for length, grams or kilograms for weight, and litres for liquids.",
      "Line up the start of the ruler with the start of the object.",
      "Small objects use small units. Big objects use big units.",
    ],
    example: {
      question: "A pencil starts at 0 and ends at 12 on the ruler. How long is it?",
      steps: ["Start at 0.", "It ends at 12, so it is 12 cm long."],
      answer: "12 cm",
    },
    nudge: "Pick the unit that fits the size. Start the ruler at 0 and read where the object ends.",
  },
  "topic-time": {
    title: "Reading the clock",
    emoji: "🕒",
    steps: [
      "The short hand shows the hour. The long hand shows the minutes.",
      "When the long hand points to 12 it is o'clock. At 6 it is half past.",
      "Each number on the clock face counts 5 minutes.",
    ],
    example: {
      question: "The short hand is on 3 and the long hand is on 12. What time is it?",
      steps: ["Short hand on 3 means the hour is 3.", "Long hand on 12 means o'clock."],
      answer: "3:00",
    },
    nudge: "Short hand = hour. Long hand = minutes. Count by 5s around the clock.",
  },
  "topic-money": {
    title: "Counting coins",
    emoji: "🪙",
    steps: [
      "Know your coins: a penny is 1¢, a nickel 5¢, a dime 10¢, a quarter 25¢.",
      "Count the biggest coins first, then the smaller ones.",
      "To find change, take the price away from what you paid.",
    ],
    example: {
      question: "You have 1 dime and 2 nickels. How many cents?",
      steps: ["Dime = 10¢.", "2 nickels = 5 + 5 = 10¢.", "10 + 10 = 20¢."],
      answer: "20¢",
    },
    nudge: "Start with the biggest coin and count up. For change, subtract the price.",
  },
  "topic-data": {
    title: "Reading charts and graphs",
    emoji: "📊",
    steps: [
      "A bar chart uses bars to show how many. A taller bar means more.",
      "Look at the labels first, then read the number at the top of each bar.",
      "To compare, subtract the smaller number from the bigger one.",
    ],
    example: {
      question: "The red bar is 7 tall and the blue bar is 4 tall. How many more is red?",
      steps: ["Subtract: 7 − 4.", "Red is 3 more."],
      answer: "3",
    },
    nudge: "Read the labels, then the numbers. To compare, subtract the small number from the big one.",
  },

  // ── Reading ───────────────────────────────────────────────────────────────
  "topic-phonics": {
    title: "Sounds make words",
    emoji: "🔤",
    steps: [
      "Every letter or group of letters makes a sound.",
      "Say the word slowly and listen for the first sound, the middle sound and the last sound.",
      "Words that rhyme end with the same sound.",
    ],
    example: {
      question: "Which word rhymes with 'hat': cat or cup?",
      steps: ["'hat' ends with the sound -at.", "'cat' also ends with -at. They rhyme."],
      answer: "cat",
    },
    nudge: "Say each word slowly out loud. Listen for the sound at the start, middle or end.",
  },
  "topic-letters": {
    title: "Meet the letters",
    emoji: "🅰️",
    steps: [
      "Every letter has a big form (A) and a small form (a).",
      "Each letter has a name and a sound. 'B' sounds like /b/ in 'ball'.",
      "The alphabet always goes in the same order: A, B, C, D…",
    ],
    example: {
      question: "Which letter comes after C?",
      steps: ["Say the alphabet: A, B, C…", "The next letter is D."],
      answer: "D",
    },
    nudge: "Sing the alphabet song in your head. Match the big letter to the small letter.",
  },
  "topic-vocabulary": {
    title: "Grow your word bank",
    emoji: "📖",
    steps: [
      "Look at the other words in the sentence. They are clues.",
      "Synonyms mean almost the same. Antonyms mean the opposite.",
      "A prefix at the start (un-, re-) or a suffix at the end (-less, -ful) changes the meaning.",
    ],
    example: {
      question: "'The tiny ant hid under a leaf.' What does 'tiny' mean?",
      steps: ["An ant is very small and can hide under a leaf.", "So 'tiny' means very small."],
      answer: "very small",
    },
    nudge: "Use the clue words in the sentence. Try the word in place of each choice.",
  },
  "topic-comprehension": {
    title: "Read, then think",
    emoji: "🧠",
    steps: [
      "Read the story once for the main idea, and once for the details.",
      "Answer from the story: find the sentence that tells you.",
      "For 'why' questions, look for the word 'because' or the thing that happened first.",
    ],
    example: {
      question: "'Mia wore a coat because it was snowing.' Why did Mia wear a coat?",
      steps: ["Find 'because' in the story.", "It was snowing."],
      answer: "It was snowing",
    },
    nudge: "Go back to the story and find the sentence that answers the question.",
  },
  "topic-spelling": {
    title: "Spelling tricks",
    emoji: "🐝",
    steps: [
      "Say the word slowly and write each sound you hear.",
      "Some words follow rules. A silent 'e' at the end makes the vowel say its name (cake).",
      "Look for the part you know, like 'ight' in light, night and right.",
    ],
    example: {
      question: "Which is spelled right: 'nite' or 'night'?",
      steps: ["Think of 'light' and 'right'.", "They use 'ight', so it is 'night'."],
      answer: "night",
    },
    nudge: "Say the word slowly. Think of a word you know that sounds the same.",
  },
  "topic-grammar": {
    title: "Building good sentences",
    emoji: "🛠️",
    steps: [
      "A sentence starts with a capital letter and ends with . ? or !",
      "A noun is a person, place or thing. A verb is an action. An adjective describes a noun.",
      "Check that the verb matches: 'The dog runs', 'The dogs run'.",
    ],
    example: {
      question: "Which word is the verb in 'The cat jumps'?",
      steps: ["A verb shows action.", "What does the cat do? It jumps."],
      answer: "jumps",
    },
    nudge: "Ask: who or what is it about, and what do they do? Read it out loud to hear if it sounds right.",
  },

  // ── Science ───────────────────────────────────────────────────────────────
  "topic-life-science": {
    title: "Living things",
    emoji: "🌱",
    steps: [
      "Living things grow, need food and water, and have babies.",
      "Plants make their food from sunlight, water and air.",
      "Animals can be grouped: mammals have fur, birds have feathers, fish have scales.",
    ],
    example: {
      question: "Is a rock living or non-living?",
      steps: ["Does it grow? No.", "Does it eat or drink? No. So it is non-living."],
      answer: "non-living",
    },
    nudge: "Ask: does it grow, eat, drink or have babies? Living things do.",
  },
  "topic-earth-space": {
    title: "Our planet and sky",
    emoji: "🌍",
    steps: [
      "Earth goes around the Sun once a year and spins once a day.",
      "Day and night happen because Earth spins.",
      "Weather is what the air is doing now: sunny, rainy, windy or snowy.",
    ],
    example: {
      question: "What does Earth go around?",
      steps: ["Earth travels in a big circle.", "It goes around the Sun."],
      answer: "the Sun",
    },
    nudge: "Picture the Sun in the middle and the planets going around it.",
  },
  "topic-matter-energy": {
    title: "Matter and energy",
    emoji: "⚡",
    steps: [
      "Everything is matter. It can be a solid, a liquid or a gas.",
      "Heating can melt a solid into a liquid. Cooling can freeze a liquid into a solid.",
      "A push or a pull is a force. Forces make things start, stop or change direction.",
    ],
    example: {
      question: "Ice melts into water. Did it get warmer or colder?",
      steps: ["Melting needs heat.", "So it got warmer."],
      answer: "warmer",
    },
    nudge: "Think of what you see in everyday life: ice melting, a ball being pushed.",
  },
};

export function lessonFor(topicId: string): Lesson | null {
  return LESSONS[topicId] ?? null;
}
