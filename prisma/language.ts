import { difficultyFor, rewards, rng, shuffle, type SeedExercise } from "./stories";

/**
 * Extra reading worlds: Alphabet Village (letters, early learners), Spelling Hive and Grammar Garage.
 * Deterministic (seeded) and self-checking: every question has four distinct options including the answer.
 */

type Rand = () => number;
const PER_LEVEL = 16;

interface Q {
  question: string;
  answer: string;
  wrong: string[];
  why: string;
  instructions?: string;
  icons?: Record<string, string>;
}

const int = (rand: Rand, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
const pickOne = <T,>(list: readonly T[], rand: Rand): T => list[Math.floor(rand() * list.length)];
const sample = <T,>(list: readonly T[], n: number, rand: Rand): T[] => shuffle([...list], rand).slice(0, n);

function build(
  prefix: string,
  topicId: string,
  title: string,
  seedBase: number,
  plan: Record<number, ((r: Rand) => Q)[]>,
  helper: string
): SeedExercise[] {
  const out: SeedExercise[] = [];
  for (let level = 1; level <= 10; level++) {
    const gens = plan[level];
    const seen = new Set<string>();
    for (let i = 1; i <= PER_LEVEL; i++) {
      let q: Q | null = null;
      let rand: Rand = rng(seedBase + level * 1000 + i);
      for (let attempt = 0; attempt < 120; attempt++) {
        rand = rng(seedBase + level * 1000 + i + attempt * 7919);
        const cand = gens[(i - 1) % gens.length](rand);
        const key = `${cand.question}|${cand.answer}`;
        if (!seen.has(key)) { q = cand; seen.add(key); break; }
      }
      if (!q) continue;
      const wrong = [...new Set(q.wrong)].filter((w) => w !== q!.answer).slice(0, 3);
      if (wrong.length !== 3) throw new Error(`${prefix}-${level}-${i}: needs 3 distinct wrong answers (${q.question})`);
      out.push({
        id: `${prefix}-${level}-${i}`,
        topicId,
        title,
        instructions: q.instructions ?? `Help ${helper}! Choose the correct answer.`,
        type: "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        data: {
          question: q.question,
          options: shuffle([q.answer, ...wrong], rand),
          answer: q.answer,
          explanation: q.why,
          ...(q.icons ? { icons: q.icons } : {}),
        },
      });
    }
  }
  return out;
}

// ─── Alphabet Village (letters, Abby the bear) ───────────────────────────────

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// letter -> example word and picture
const EXAMPLE: Record<string, [string, string]> = {
  A: ["apple", "🍎"], B: ["ball", "⚽"], C: ["cat", "🐱"], D: ["dog", "🐶"], E: ["egg", "🥚"], F: ["fish", "🐟"],
  G: ["goat", "🐐"], H: ["hat", "🎩"], I: ["igloo", "🏠"], J: ["jam", "🍓"], K: ["kite", "🪁"], L: ["lion", "🦁"],
  M: ["moon", "🌙"], N: ["nest", "🪹"], O: ["octopus", "🐙"], P: ["pig", "🐷"], Q: ["queen", "👸"], R: ["rain", "🌧️"],
  S: ["sun", "☀️"], T: ["tree", "🌳"], U: ["umbrella", "☂️"], V: ["van", "🚐"], W: ["whale", "🐋"], X: ["x-ray", "🩻"],
  Y: ["yo-yo", "🪀"], Z: ["zebra", "🦓"],
};

function nameLetterQ(rand: Rand): Q {
  const L = pickOne(ALPHA, rand);
  return {
    question: `Which letter is this: ${L}?`,
    answer: L,
    wrong: sample(ALPHA.filter((x) => x !== L), 3, rand),
    why: `This letter is ${L}.`,
    instructions: "Look at the letter.",
  };
}
function bigSmallQ(rand: Rand): Q {
  const L = pickOne(ALPHA, rand);
  const small = L.toLowerCase();
  return {
    question: `Which small letter matches the big letter ${L}?`,
    answer: small,
    wrong: sample(ALPHA.filter((x) => x !== L).map((x) => x.toLowerCase()), 3, rand),
    why: `Big ${L} and small ${small} are the same letter.`,
  };
}
function smallBigQ(rand: Rand): Q {
  const L = pickOne(ALPHA, rand);
  return {
    question: `Which big letter matches the small letter ${L.toLowerCase()}?`,
    answer: L,
    wrong: sample(ALPHA.filter((x) => x !== L), 3, rand),
    why: `Small ${L.toLowerCase()} and big ${L} are the same letter.`,
  };
}
function firstSoundQ(rand: Rand): Q {
  const L = pickOne(ALPHA.filter((x) => !["X", "Q"].includes(x)), rand);
  const [word, pic] = EXAMPLE[L];
  return {
    question: `${pic} What letter does "${word}" start with?`,
    answer: L,
    wrong: sample(ALPHA.filter((x) => x !== L), 3, rand),
    why: `"${word}" starts with the letter ${L}.`,
    instructions: "Say the word slowly and listen to the first sound.",
  };
}
function nextLetterQ(rand: Rand): Q {
  const i = int(rand, 0, 24);
  return {
    question: `Which letter comes after ${ALPHA[i]} in the alphabet?`,
    answer: ALPHA[i + 1],
    wrong: sample(ALPHA.filter((x) => x !== ALPHA[i + 1] && x !== ALPHA[i]), 3, rand),
    why: `The alphabet goes ${ALPHA[i]}, ${ALPHA[i + 1]}.`,
  };
}
function missingLetterQ(rand: Rand): Q {
  const i = int(rand, 1, 24);
  return {
    question: `${ALPHA[i - 1]}, __, ${ALPHA[i + 1]}. Which letter is missing?`,
    answer: ALPHA[i],
    wrong: sample(ALPHA.filter((x) => x !== ALPHA[i]), 3, rand),
    why: `The alphabet goes ${ALPHA[i - 1]}, ${ALPHA[i]}, ${ALPHA[i + 1]}.`,
  };
}
function vowelQ(rand: Rand): Q {
  const vowels = ["A", "E", "I", "O", "U"];
  const consonants = ALPHA.filter((x) => !vowels.includes(x));
  const askVowel = rand() < 0.5;
  const answer = pickOne(askVowel ? vowels : consonants, rand);
  return {
    question: `Which of these is a ${askVowel ? "vowel" : "consonant"}?`,
    answer,
    wrong: sample(askVowel ? consonants : vowels, 3, rand),
    why: `${answer} is a ${askVowel ? "vowel" : "consonant"}. The vowels are A, E, I, O and U.`,
  };
}
function sightWordQ(rand: Rand): Q {
  const words = ["the", "and", "is", "you", "we", "my", "see", "like", "go", "said", "look", "can"];
  const w = pickOne(words, rand);
  return {
    question: `Which word says "${w}"?`,
    answer: w,
    wrong: sample(words.filter((x) => x !== w), 3, rand),
    why: `The word is "${w}".`,
    instructions: "Find the matching word.",
  };
}
function cvcQ(rand: Rand): Q {
  const words: [string, string][] = [["cat", "🐱"], ["dog", "🐶"], ["sun", "☀️"], ["pig", "🐷"], ["bus", "🚌"], ["hen", "🐔"], ["bed", "🛏️"], ["cup", "🥤"]];
  const w = pickOne(words, rand);
  return {
    question: `${w[1]} Which word names the picture?`,
    answer: w[0],
    wrong: sample(words.filter((x) => x[0] !== w[0]).map((x) => x[0]), 3, rand),
    why: `The picture shows a ${w[0]}.`,
  };
}

const LETTERS_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [nameLetterQ, bigSmallQ],
  2: [nameLetterQ, bigSmallQ, smallBigQ],
  3: [smallBigQ, bigSmallQ, firstSoundQ],
  4: [firstSoundQ, nextLetterQ, smallBigQ],
  5: [firstSoundQ, nextLetterQ, missingLetterQ],
  6: [missingLetterQ, vowelQ, firstSoundQ],
  7: [vowelQ, cvcQ, missingLetterQ],
  8: [cvcQ, sightWordQ, vowelQ],
  9: [cvcQ, sightWordQ, missingLetterQ],
  10: [cvcQ, sightWordQ, vowelQ],
};

export function generateLetters(): SeedExercise[] {
  return build("lg-le", "topic-letters", "Alphabet Village", 500_000, LETTERS_PLAN, "Abby");
}

// ─── Spelling Hive (Buzz) ────────────────────────────────────────────────────

// [right, wrong spellings..., level band: 1 easy .. 5 hard]
const SPELL: [string, string[], number][] = [
  ["cat", ["kat", "cet", "catt"], 1], ["dog", ["dag", "dogg", "dawg"], 1], ["sun", ["sunn", "son", "sin"], 1],
  ["red", ["rad", "redd", "reed"], 1], ["big", ["bigg", "beg", "bik"], 1], ["hat", ["het", "hatt", "hot"], 1],
  ["fish", ["fich", "fsh", "fissh"], 2], ["jump", ["jumpp", "jomp", "jup"], 2], ["frog", ["frogg", "frag", "forg"], 2],
  ["milk", ["mick", "milc", "melk"], 2], ["ship", ["sip", "shup", "shipp"], 2], ["rain", ["rane", "rian", "rayn"], 2],
  ["house", ["hous", "howse", "huose"], 3], ["water", ["watar", "woter", "wattr"], 3], ["friend", ["freind", "frend", "friand"], 3],
  ["people", ["peeple", "pepol", "peopel"], 3], ["school", ["scool", "skool", "shcool"], 3], ["because", ["becuase", "becouse", "becasue"], 3],
  ["night", ["nite", "nigt", "nihgt"], 3], ["light", ["lite", "ligt", "lihgt"], 3], ["jumping", ["jumpin", "jumpping", "jumpng"], 3],
  ["beautiful", ["beutiful", "beautifull", "beatiful"], 4], ["different", ["diffrent", "diferent", "differant"], 4],
  ["favorite", ["favrite", "faverite", "favorit"], 4], ["knowledge", ["nolledge", "knowlege", "knowledje"], 4],
  ["thought", ["thougt", "thaut", "thuaght"], 4], ["through", ["thru", "throu", "throgh"], 4],
  ["separate", ["seperate", "separete", "sepparate"], 5], ["necessary", ["neccessary", "necesary", "necessery"], 5],
  ["rhythm", ["rythm", "rhythem", "rhythum"], 5], ["calendar", ["calender", "calandar", "calendur"], 5],
  ["environment", ["enviroment", "envirnment", "enviornment"], 5], ["definitely", ["definately", "defanitely", "definitly"], 5],
  ["government", ["goverment", "governmant", "govermant"], 5], ["library", ["libary", "liberry", "libarry"], 5],
  ["February", ["Febuary", "Febuarry", "Feburary"], 5], ["pneumonia", ["neumonia", "pnumonia", "pneumonea"], 5],
];

function spellRightQ(bands: number[]) {
  return (rand: Rand): Q => {
    const pool = SPELL.filter((s) => bands.includes(s[2]));
    const s = pickOne(pool, rand);
    return {
      question: "Which one is spelled the right way?",
      answer: s[0],
      wrong: s[1],
      why: `The correct spelling is "${s[0]}". Say it slowly and check each part.`,
      instructions: "Look carefully at each spelling.",
    };
  };
}

function missingLetterSpellQ(rand: Rand): Q {
  const words = ["apple", "banana", "carrot", "dinner", "garden", "monkey", "orange", "pencil", "rabbit", "window", "yellow", "turtle"];
  const w = pickOne(words, rand);
  const idx = int(rand, 1, w.length - 2);
  const missing = w[idx];
  const shown = w.slice(0, idx) + "_" + w.slice(idx + 1);
  const letters = "abcdefghijklmnopqrstuvwxyz".split("").filter((x) => x !== missing);
  return {
    question: `Which letter finishes the word? ${shown}`,
    answer: missing,
    wrong: sample(letters, 3, rand),
    why: `The word is "${w}".`,
  };
}

function plural(rand: Rand): Q {
  const items: [string, string][] = [["cat", "cats"], ["dog", "dogs"], ["box", "boxes"], ["bus", "buses"], ["dish", "dishes"], ["baby", "babies"], ["city", "cities"], ["leaf", "leaves"], ["knife", "knives"], ["child", "children"], ["mouse", "mice"], ["foot", "feet"]];
  const t = pickOne(items, rand);
  const wrong = [`${t[0]}s`, `${t[0]}es`, `${t[0]}ies`, `${t[0]}ves`, `${t[0]}en`].filter((w) => w !== t[1]);
  return {
    question: `What is the plural (more than one) of "${t[0]}"?`,
    answer: t[1],
    wrong: sample(wrong, 3, rand),
    why: `More than one ${t[0]} is "${t[1]}".`,
  };
}

function homophone(rand: Rand): Q {
  const items: [string, string, string, string][] = [
    ["I can ___ the bird.", "see", "sea", "see and sea sound the same. A bird is seen with your eyes."],
    ["We went to the ___.", "sea", "see", "The sea is a big body of water."],
    ["I ___ a good book.", "read", "red", "You read a book. 'Red' is a colour."],
    ["The sky is ___.", "blue", "blew", "Blue is a colour. Blew is what the wind did."],
    ["The wind ___ hard.", "blew", "blue", "Blew is the past of blow."],
    ["I have ___ sisters.", "two", "to", "Two is the number 2."],
    ["We go ___ school.", "to", "too", "We go to a place."],
    ["Can I come ___?", "too", "two", "Too means also."],
    ["Do you know ___ answer?", "the", "thee", "We say 'the answer'."],
    ["The cat hurt ___ paw.", "its", "it's", "Its (no apostrophe) shows something belongs to the cat."],
    ["___ a sunny day.", "It's", "Its", "It's means 'it is'."],
    ["Put the book over ___.", "there", "their", "There tells us where."],
    ["The kids ate ___ lunch.", "their", "there", "Their shows it belongs to them."],
  ];
  const t = pickOne(items, rand);
  return {
    question: `Choose the right word: ${t[0]}`,
    answer: t[1],
    wrong: [t[2], "were", "wear"].filter((w) => w !== t[1]),
    why: t[3],
  };
}

const SPELLING_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [spellRightQ([1]), missingLetterSpellQ],
  2: [spellRightQ([1, 2]), missingLetterSpellQ],
  3: [spellRightQ([2]), missingLetterSpellQ, plural],
  4: [spellRightQ([2, 3]), plural],
  5: [spellRightQ([3]), plural, homophone],
  6: [spellRightQ([3]), homophone, plural],
  7: [spellRightQ([3, 4]), homophone],
  8: [spellRightQ([4]), homophone],
  9: [spellRightQ([4, 5]), homophone],
  10: [spellRightQ([5]), homophone],
};

export function generateSpelling(): SeedExercise[] {
  return build("lg-sp", "topic-spelling", "Spelling Hive", 510_000, SPELLING_PLAN, "Buzz");
}

// ─── Grammar Garage (Gus the robot) ──────────────────────────────────────────

function capitalQ(rand: Rand): Q {
  const names = ["mia", "ben", "zara", "omar", "lily", "noah", "ava", "kai"];
  const verbs = ["plays", "runs", "reads", "sings", "jumps", "swims"];
  const n = pickOne(names, rand);
  const v = pickOne(verbs, rand);
  const cap = n[0].toUpperCase() + n.slice(1);
  const answer = `${cap} ${v} outside.`;
  const wrong = [`${n} ${v} outside.`, `${cap} ${v} Outside.`, `${n} ${v} Outside`];
  return {
    question: "Which sentence is written correctly?",
    answer,
    wrong,
    why: "A sentence starts with a capital letter, names start with capital letters, and it ends with a full stop.",
  };
}
function punctuationQ(rand: Rand): Q {
  const items: [string, string, string][] = [
    ["How old are you", "?", "It asks a question."],
    ["Watch out", "!", "It shows a strong feeling."],
    ["I like apples", ".", "It tells something."],
    ["What is your name", "?", "It asks a question."],
    ["What a great day", "!", "It shows excitement."],
    ["The dog is brown", ".", "It tells something."],
  ];
  const t = pickOne(items, rand);
  return {
    question: `Which mark goes at the end? "${t[0]}__"`,
    answer: t[1],
    wrong: [".", "?", "!", ","].filter((m) => m !== t[1]),
    why: t[2],
  };
}
function partOfSpeechQ(rand: Rand): Q {
  const items: [string, string, string, string][] = [
    ["The cat jumps.", "jumps", "verb", "It shows action."],
    ["A happy dog barks.", "happy", "adjective", "It describes the dog."],
    ["Mia reads a book.", "book", "noun", "It is a thing."],
    ["The bird sings loudly.", "loudly", "adverb", "It tells how the bird sings."],
    ["Ben runs fast.", "Ben", "noun", "It is a person's name."],
    ["The red ball rolls.", "rolls", "verb", "It shows action."],
  ];
  const t = pickOne(items, rand);
  const kinds = ["noun", "verb", "adjective", "adverb"];
  return {
    question: `In "${t[0]}", what kind of word is "${t[1]}"?`,
    answer: t[2],
    wrong: kinds.filter((k) => k !== t[2]),
    why: t[3],
  };
}
function agreementQ(rand: Rand): Q {
  const items: [string, string, string][] = [
    ["The dog ___ in the yard.", "runs", "run"],
    ["The dogs ___ in the yard.", "run", "runs"],
    ["She ___ a cake.", "bakes", "bake"],
    ["They ___ a cake.", "bake", "bakes"],
    ["He ___ to school.", "walks", "walk"],
    ["We ___ to school.", "walk", "walks"],
    ["The bird ___ in the tree.", "sings", "sing"],
    ["The birds ___ in the tree.", "sing", "sings"],
  ];
  const t = pickOne(items, rand);
  return {
    question: `Pick the right verb: ${t[0]}`,
    answer: t[1],
    wrong: [t[2], "are", "be"].filter((x) => x !== t[1]).concat(["been"]).slice(0, 3),
    why: `${t[1]} matches the subject.`,
  };
}
function tenseQ(rand: Rand): Q {
  const items: [string, string, string, string][] = [
    ["Yesterday I ___ to the park.", "went", "go", "Yesterday is in the past, so we say 'went'."],
    ["Yesterday she ___ a pizza.", "ate", "eat", "Past of eat is 'ate'."],
    ["Last week we ___ a movie.", "saw", "see", "Past of see is 'saw'."],
    ["Today I ___ my shoes.", "wear", "wore", "Today is now, so we say 'wear'."],
    ["Yesterday he ___ his bike.", "rode", "ride", "Past of ride is 'rode'."],
    ["Last night they ___ a song.", "sang", "sing", "Past of sing is 'sang'."],
  ];
  const t = pickOne(items, rand);
  return {
    question: `Choose the right word: ${t[0]}`,
    answer: t[1],
    wrong: [t[2], "goed", "eated", "seed"].filter((x) => x !== t[1]).slice(0, 3),
    why: t[3],
  };
}
function pronounQ(rand: Rand): Q {
  const items: [string, string, string[]][] = [
    ["Mia is my friend. ___ likes to draw.", "She", ["He", "They", "It"]],
    ["Ben has a ball. ___ throws it high.", "He", ["She", "They", "It"]],
    ["The dogs are hungry. ___ want food.", "They", ["She", "He", "It"]],
    ["The sun is hot. ___ shines all day.", "It", ["She", "He", "They"]],
    ["Ana and I are friends. ___ play together.", "We", ["She", "He", "It"]],
  ];
  const t = pickOne(items, rand);
  return {
    question: `Pick the right pronoun: ${t[0]}`,
    answer: t[1],
    wrong: t[2],
    why: `${t[1]} matches who or what the sentence is about.`,
  };
}
function sentenceTypeQ(rand: Rand): Q {
  const items: [string, string][] = [
    ["What time is it?", "question"], ["Close the door.", "command"], ["I love pizza.", "statement"], ["Wow, that is huge!", "exclamation"],
    ["Where is my hat?", "question"], ["Please sit down.", "command"], ["The sky is blue.", "statement"], ["Hooray, we won!", "exclamation"],
  ];
  const t = pickOne(items, rand);
  const kinds = ["statement", "question", "command", "exclamation"];
  return {
    question: `What kind of sentence is "${t[0]}"?`,
    answer: t[1],
    wrong: kinds.filter((k) => k !== t[1]),
    why: `"${t[0]}" is a ${t[1]}.`,
  };
}
function commaQ(rand: Rand): Q {
  const items: [string, string, string[]][] = [
    ["We bought apples, pears, and plums.", "apples, pears, and plums", ["apples pears and plums", "apples, pears and, plums", "apples pears, and plums"]],
    ["Yes, I can come.", "Yes, I can come.", ["Yes I, can come.", "Yes I can, come.", "Yes I can come,."]],
    ["On Monday, we have art.", "On Monday, we have art.", ["On, Monday we have art.", "On Monday we, have art.", "On Monday we have, art."]],
  ];
  const t = pickOne(items, rand);
  return {
    question: "Which sentence part uses commas correctly?",
    answer: t[1],
    wrong: t[2],
    why: "Commas separate items in a list and come after introductory words.",
  };
}

const GRAMMAR_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [capitalQ, punctuationQ],
  2: [capitalQ, punctuationQ, sentenceTypeQ],
  3: [punctuationQ, sentenceTypeQ, partOfSpeechQ],
  4: [partOfSpeechQ, agreementQ, sentenceTypeQ],
  5: [agreementQ, partOfSpeechQ, pronounQ],
  6: [pronounQ, agreementQ, tenseQ],
  7: [tenseQ, pronounQ, partOfSpeechQ],
  8: [tenseQ, agreementQ, commaQ],
  9: [commaQ, tenseQ, pronounQ],
  10: [commaQ, tenseQ, partOfSpeechQ],
};

export function generateGrammar(): SeedExercise[] {
  return build("lg-gr", "topic-grammar", "Grammar Garage", 520_000, GRAMMAR_PLAN, "Gus");
}
