import { difficultyFor, rewards, rng, shuffle, type SeedExercise } from "./stories";

/**
 * Generated reading questions for Sound Safari (phonics), Word Woods (vocabulary) and Story Castle
 * (comprehension). Deterministic (seeded) and self-checking: every question has exactly four distinct
 * options, one of which is the answer.
 */

const PER_LEVEL = 20;

interface Q {
  question: string;
  answer: string;
  wrong: string[];
  why: string;
  instructions?: string;
  passage?: string;
  icons?: Record<string, string>;
  sort?: boolean;
}

type Rand = () => number;

const pickOne = <T,>(list: readonly T[], rand: Rand): T => list[Math.floor(rand() * list.length)];
const sample = <T,>(list: readonly T[], n: number, rand: Rand): T[] => shuffle([...list], rand).slice(0, n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Phonics (Sound Safari, Leo) ─────────────────────────────────────────────

// word, picture, first sound, last sound ("-" = skip), syllables
const PW: [string, string, string, string, number][] = [
  ["cat", "🐱", "k", "t", 1], ["cup", "🥤", "k", "p", 1], ["kite", "🪁", "k", "t", 1], ["cake", "🎂", "k", "k", 1],
  ["dog", "🐶", "d", "g", 1], ["duck", "🦆", "d", "k", 1], ["dinosaur", "🦖", "d", "r", 3],
  ["sun", "☀️", "s", "n", 1], ["star", "⭐", "s", "r", 1], ["sock", "🧦", "s", "k", 1],
  ["hat", "🎩", "h", "t", 1], ["house", "🏠", "h", "s", 1], ["horse", "🐴", "h", "s", 1],
  ["pig", "🐷", "p", "g", 1], ["pen", "🖊️", "p", "n", 1], ["pizza", "🍕", "p", "-", 2],
  ["fish", "🐟", "f", "sh", 1], ["frog", "🐸", "f", "g", 1], ["flower", "🌸", "f", "r", 2],
  ["bed", "🛏️", "b", "d", 1], ["bus", "🚌", "b", "s", 1], ["ball", "⚽", "b", "l", 1], ["book", "📖", "b", "k", 1], ["banana", "🍌", "b", "-", 3],
  ["goat", "🐐", "g", "t", 1], ["moon", "🌙", "m", "n", 1], ["monkey", "🐒", "m", "-", 2], ["mouse", "🐭", "m", "s", 1],
  ["rain", "🌧️", "r", "n", 1], ["rocket", "🚀", "r", "t", 2], ["robot", "🤖", "r", "t", 2], ["rabbit", "🐰", "r", "t", 2],
  ["tree", "🌳", "t", "-", 1], ["tiger", "🐯", "t", "r", 2], ["van", "🚐", "v", "n", 1], ["whale", "🐋", "w", "l", 1],
  ["watermelon", "🍉", "w", "n", 4], ["zebra", "🦓", "z", "-", 2], ["lion", "🦁", "l", "n", 2], ["leaf", "🍃", "l", "f", 1],
  ["elephant", "🐘", "e", "t", 3], ["butterfly", "🦋", "b", "-", 3], ["umbrella", "☂️", "u", "-", 3], ["tomato", "🍅", "t", "-", 3],
  ["helicopter", "🚁", "h", "r", 4], ["alligator", "🐊", "a", "r", 4], ["caterpillar", "🐛", "k", "r", 4], ["computer", "💻", "k", "r", 3],
];
const PICTURE = new Map(PW.map((p) => [p[0], p[1]]));

const picture = (words: string[]) => Object.fromEntries(words.map((w) => [w, PICTURE.get(w)!]));

function onsetQ(rand: Rand): Q {
  const t = pickOne(PW, rand);
  const same = PW.filter((p) => p[2] === t[2] && p[0] !== t[0]);
  if (same.length === 0) return onsetQ(rand);
  const a = pickOne(same, rand);
  const wrong: typeof PW = [];
  const used = new Set([t[2]]);
  for (const p of shuffle([...PW], rand)) {
    if (!used.has(p[2])) { wrong.push(p); used.add(p[2]); }
    if (wrong.length === 3) break;
  }
  const words = [a[0], ...wrong.map((w) => w[0])];
  return {
    question: `Which word starts with the same sound as ${t[1]} ${t[0]}?`,
    answer: a[0], wrong: wrong.map((w) => w[0]),
    why: `'${t[0]}' and '${a[0]}' both start with the /${t[2]}/ sound.`,
    instructions: "Listen for the first sound.", icons: picture(words),
  };
}

function codaQ(rand: Rand): Q {
  const pool = PW.filter((p) => p[3] !== "-");
  const t = pickOne(pool, rand);
  const same = pool.filter((p) => p[3] === t[3] && p[0] !== t[0]);
  if (same.length === 0) return codaQ(rand);
  const a = pickOne(same, rand);
  const wrong: typeof PW = [];
  const used = new Set([t[3]]);
  for (const p of shuffle([...pool], rand)) {
    if (!used.has(p[3])) { wrong.push(p); used.add(p[3]); }
    if (wrong.length === 3) break;
  }
  const words = [a[0], ...wrong.map((w) => w[0])];
  return {
    question: `Which word ends with the same sound as ${t[1]} ${t[0]}?`,
    answer: a[0], wrong: wrong.map((w) => w[0]),
    why: `'${t[0]}' and '${a[0]}' both end with the /${t[3]}/ sound.`,
    instructions: "Listen for the last sound.", icons: picture(words),
  };
}

const EASY_FAMILIES: string[][] = [
  ["cat", "hat", "bat", "mat", "rat"], ["dog", "frog", "log", "fog"], ["sun", "run", "bun", "fun"],
  ["pig", "dig", "big", "wig"], ["tree", "bee", "knee", "free"], ["ring", "king", "sing", "wing"],
];
const HARD_FAMILIES: string[][] = [
  ["cake", "lake", "snake", "bake"], ["rain", "train", "chain", "brain"], ["book", "cook", "look", "hook"],
  ["light", "night", "right", "bright"], ["bell", "shell", "well", "tell"], ["boat", "goat", "coat", "float"],
];

function rhymeQ(rand: Rand, hard: boolean): Q {
  const fams = hard ? HARD_FAMILIES : EASY_FAMILIES;
  const all = [...EASY_FAMILIES, ...HARD_FAMILIES];
  const fam = pickOne(fams, rand);
  const [t, a] = sample(fam, 2, rand);
  const others = all.filter((f) => f !== fam);
  const wrong = sample(others, 3, rand).map((f) => pickOne(f, rand));
  return {
    question: `Which word rhymes with '${t}'?`, answer: a, wrong,
    why: `'${t}' and '${a}' sound the same at the end, so they rhyme.`,
    instructions: "Find the rhyme.",
  };
}

function syllableQ(rand: Rand, maxSyl: number): Q {
  const t = pickOne(PW.filter((p) => p[4] <= maxSyl), rand);
  const all = ["1", "2", "3", "4"];
  return {
    question: `How many syllables are in '${t[0]}'?`, answer: String(t[4]),
    wrong: all.filter((s) => s !== String(t[4])),
    why: `Clap it out: ${t[0]} has ${t[4]} syllable${t[4] === 1 ? "" : "s"}.`,
    instructions: "Clap the beats.", sort: true,
  };
}

const DIGRAPHS: Record<string, string[]> = {
  sh: ["ship", "shell", "sheep", "shoe", "shark", "shop"],
  ch: ["chip", "chair", "cheese", "chick", "chin", "chain"],
  th: ["thin", "think", "thumb", "three", "thick", "thorn"],
};
const PLAIN = ["sun", "map", "bed", "pig", "dog", "hat", "cup", "van", "log", "web"];

function digraphQ(rand: Rand): Q {
  const d = pickOne(Object.keys(DIGRAPHS), rand);
  const a = pickOne(DIGRAPHS[d], rand);
  const pool = [...Object.values(DIGRAPHS).flat(), ...PLAIN].filter((w) => !w.startsWith(d));
  return {
    question: `Which word begins with the '${d}' sound?`, answer: a, wrong: sample(pool, 3, rand),
    why: `'${a}' starts with the '${d}' sound.`, instructions: "Two letters, one sound.",
  };
}

const BLENDS: Record<string, string[]> = {
  bl: ["black", "block", "blue", "blink"], cr: ["crab", "crown", "cry", "cross"], st: ["stop", "stick", "stamp", "stone"],
  tr: ["truck", "train", "trip", "trap"], fl: ["flag", "flip", "fly", "flat"], gr: ["grass", "green", "grape", "grin"],
};

function blendQ(rand: Rand): Q {
  const b = pickOne(Object.keys(BLENDS), rand);
  const a = pickOne(BLENDS[b], rand);
  const pool = [...Object.values(BLENDS).flat(), ...PLAIN].filter((w) => !w.startsWith(b));
  return {
    question: `Which word begins with the '${b}' blend?`, answer: a, wrong: sample(pool, 3, rand),
    why: `'${a}' starts with ${b[0]} and ${b[1]} blended together.`, instructions: "Blend the two sounds.",
  };
}

const SILENT: [string, string][] = [
  ["knot", "k"], ["knock", "k"], ["wrong", "w"], ["wrap", "w"], ["wrist", "w"], ["gnat", "g"], ["gnaw", "g"],
  ["lamb", "b"], ["comb", "b"], ["thumb", "b"], ["climb", "b"],
];

function silentQ(rand: Rand): Q {
  const [w, s] = pickOne(SILENT, rand);
  const others = [...new Set(w.split(""))].filter((c) => c !== s);
  return {
    question: `Which letter is silent in '${w}'?`, answer: s, wrong: sample(others, 3, rand),
    why: `In '${w}' the letter '${s}' makes no sound.`, instructions: "Some letters stay quiet.",
  };
}

const LONG_VOWELS: Record<string, { long: string[]; short: string[] }> = {
  a: { long: ["cake", "rain", "play", "gate", "name", "snail"], short: ["cap", "bag", "man", "jam", "dad", "map"] },
  e: { long: ["tree", "bee", "sea", "feet", "green", "leaf"], short: ["bed", "pen", "hen", "red", "net", "leg"] },
  i: { long: ["kite", "bike", "time", "five", "pie", "night"], short: ["pig", "sit", "win", "big", "fin", "lip"] },
  o: { long: ["boat", "home", "nose", "snow", "rope", "coat"], short: ["hot", "top", "box", "pot", "mop", "log"] },
  u: { long: ["cube", "tune", "mule", "huge", "use", "flute"], short: ["bus", "cup", "sun", "mug", "bug", "nut"] },
};

function longVowelQ(rand: Rand): Q {
  const v = pickOne(Object.keys(LONG_VOWELS), rand);
  const { long, short } = LONG_VOWELS[v];
  const a = pickOne(long, rand);
  return {
    question: `Which word has a long '${v}' sound?`, answer: a, wrong: sample(short, 3, rand),
    why: `In '${a}' the '${v}' says its own name.`, instructions: "Long vowels say their name.",
  };
}

const PHONICS_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [onsetQ],
  2: [onsetQ, codaQ],
  3: [codaQ, (r) => rhymeQ(r, false)],
  4: [(r) => rhymeQ(r, false), (r) => syllableQ(r, 3), codaQ],
  5: [(r) => rhymeQ(r, true), (r) => syllableQ(r, 3), digraphQ],
  6: [(r) => syllableQ(r, 3), digraphQ, blendQ],
  7: [blendQ, silentQ, (r) => syllableQ(r, 4)],
  8: [silentQ, longVowelQ, (r) => syllableQ(r, 4)],
  9: [silentQ, longVowelQ, blendQ],
  10: [longVowelQ, silentQ, (r) => syllableQ(r, 4)],
};

// ─── Vocabulary (Word Woods, Professor Hoot) ────────────────────────────────

type Tier = "easy" | "mid" | "hard";
// word A, word B, tier, dimension (words from the same dimension are never used as wrong answers)
const OPP: [string, string, Tier, string][] = [
  ["hot", "cold", "easy", "temp"], ["big", "small", "easy", "size"], ["up", "down", "easy", "dir"], ["day", "night", "easy", "time"],
  ["open", "closed", "easy", "open"], ["full", "empty", "easy", "full"], ["old", "new", "easy", "age"], ["fast", "slow", "easy", "speed"],
  ["happy", "sad", "easy", "mood"], ["wet", "dry", "easy", "wet"],
  ["loud", "quiet", "mid", "noise"], ["early", "late", "mid", "when"], ["brave", "scared", "mid", "brave"], ["near", "far", "mid", "dist"],
  ["clean", "dirty", "mid", "clean"], ["strong", "weak", "mid", "strength"], ["soft", "hard", "mid", "hard"], ["rich", "poor", "mid", "money"],
  ["tall", "short", "mid", "size"], ["always", "never", "mid", "freq"],
  ["ancient", "modern", "hard", "age"], ["generous", "greedy", "hard", "give"], ["victory", "defeat", "hard", "win"],
  ["accept", "refuse", "hard", "allow"], ["expand", "shrink", "hard", "grow"], ["increase", "decrease", "hard", "grow"],
  ["rare", "common", "hard", "rare"], ["difficult", "easy", "hard", "hard"], ["cheerful", "gloomy", "hard", "mood"],
  ["polite", "rude", "hard", "manner"], ["honest", "dishonest", "hard", "honest"], ["arrive", "depart", "hard", "go"],
  ["permit", "forbid", "hard", "allow"], ["include", "exclude", "hard", "in"],
];

function oppositeQ(rand: Rand, tiers: Tier[]): Q {
  const pair = pickOne(OPP.filter((p) => tiers.includes(p[2])), rand);
  const [from, to] = rand() < 0.5 ? [pair[0], pair[1]] : [pair[1], pair[0]];
  const pool = OPP.filter((p) => p[3] !== pair[3]).flatMap((p) => [p[0], p[1]]);
  return {
    question: `What is the opposite of '${from}'?`, answer: to, wrong: sample(pool, 3, rand),
    why: `'${from}' and '${to}' are opposites.`, instructions: "Find the opposite.",
  };
}

const SYN: [string[], "simple" | "adv"][] = [
  [["happy", "joyful", "glad", "cheerful"], "simple"], [["big", "huge", "giant", "enormous"], "simple"],
  [["small", "tiny", "little", "petite"], "simple"], [["fast", "quick", "speedy", "swift"], "simple"],
  [["pretty", "beautiful", "lovely", "gorgeous"], "simple"], [["tired", "sleepy", "drowsy", "exhausted"], "simple"],
  [["jump", "leap", "hop", "spring"], "simple"], [["kind", "gentle", "caring", "friendly"], "simple"],
  [["angry", "mad", "furious", "cross"], "adv"], [["scared", "afraid", "frightened", "terrified"], "adv"],
  [["brave", "bold", "courageous", "fearless"], "adv"], [["shout", "yell", "holler", "bellow"], "adv"],
  [["begin", "start", "commence", "launch"], "adv"], [["smart", "clever", "wise", "intelligent"], "adv"],
  [["rich", "wealthy", "prosperous", "loaded"], "adv"], [["walk", "stroll", "wander", "march"], "adv"],
];

function synonymQ(rand: Rand, kind: "simple" | "adv"): Q {
  const set = pickOne(SYN.filter((s) => s[1] === kind), rand)[0];
  const [t, a] = sample(set, 2, rand);
  const pool = SYN.filter((s) => s[0] !== set).flatMap((s) => s[0]);
  return {
    question: `Which word means almost the same as '${t}'?`, answer: a, wrong: sample(pool, 3, rand),
    why: `'${t}' and '${a}' mean almost the same thing.`, instructions: "Find the word with the same meaning.",
  };
}

// word, meaning, example sentence
const DEFS: [string, string, string][] = [
  ["gigantic", "very big", "The castle tower was gigantic. It touched the clouds."],
  ["tiny", "very small", "A tiny ant carried a crumb twice its size."],
  ["ancient", "very old", "The ancient map had been hidden for a thousand years."],
  ["fragile", "easily broken", "Be careful with the fragile glass bowl."],
  ["curious", "wanting to know more", "The curious cat peeked into every box."],
  ["generous", "happy to share", "The generous baker gave bread to everyone."],
  ["exhausted", "very tired", "After the long hike, the explorers felt exhausted."],
  ["swift", "very fast", "The swift deer leapt over the stream."],
  ["silent", "making no sound", "The library was silent. Nobody said a word."],
  ["fearless", "not afraid of anything", "The fearless knight walked into the dark cave."],
  ["delicious", "tasting very good", "The soup smelled so good, and it was delicious."],
  ["furious", "very angry", "The furious dragon stomped and roared."],
  ["peculiar", "strange or unusual", "The peculiar bird had purple feathers and one blue foot."],
  ["frigid", "very cold", "The frigid wind made everyone shiver."],
  ["dazzling", "very bright and shiny", "The dazzling jewels sparkled in the sun."],
  ["tremble", "to shake a little", "The puppy began to tremble when thunder boomed."],
  ["gather", "to bring together", "Let's gather all the sticks before dark."],
  ["shelter", "a safe place to stay", "They built a shelter to stay dry in the storm."],
  ["journey", "a long trip", "Their journey across the sea took many days."],
  ["glimpse", "a quick look", "I caught a glimpse of a fox running by."],
  ["whisper", "to speak very softly", "Please whisper so the baby can keep sleeping."],
  ["protect", "to keep safe", "A helmet helps protect your head."],
];

function defQ(rand: Rand, withContext: boolean): Q {
  const [w, def, sentence] = pickOne(DEFS, rand);
  const wrong = sample(DEFS.filter((d) => d[0] !== w).map((d) => d[1]), 3, rand);
  return {
    question: withContext ? `'${sentence}' What does '${w}' mean?` : `What does '${w}' mean?`,
    answer: def, wrong, why: `'${w}' means ${def}.`,
    instructions: withContext ? "Use the clues in the sentence." : "Pick the best meaning.",
  };
}

// affix, kind, meaning, example words
const AFFIX: [string, "prefix" | "suffix", string, string[]][] = [
  ["un", "prefix", "not", ["unhappy", "unfair", "unkind", "unsafe"]],
  ["re", "prefix", "again", ["redo", "rewrite", "replay", "rebuild"]],
  ["pre", "prefix", "before", ["preview", "preheat", "preschool"]],
  ["dis", "prefix", "not", ["dislike", "disagree", "dishonest"]],
  ["less", "suffix", "without", ["careless", "hopeless", "fearless", "homeless"]],
  ["ful", "suffix", "full of", ["joyful", "helpful", "colorful", "careful"]],
  ["er", "suffix", "one who", ["teacher", "baker", "singer", "painter"]],
  ["est", "suffix", "most", ["tallest", "fastest", "smallest"]],
];

function affixQ(rand: Rand): Q {
  const [affix, kind, meaning, words] = pickOne(AFFIX, rand);
  const word = pickOne(words, rand);
  const all = kind === "prefix" ? ["not", "again", "before", "after"] : ["without", "full of", "one who", "most"];
  const shown = kind === "suffix" ? `-${affix}` : `${affix}-`;
  return {
    question: `What does the ${kind} '${shown}' mean in '${word}'?`,
    answer: meaning, wrong: all.filter((m) => m !== meaning),
    why: `The ${kind} '${shown}' means '${meaning}'.`,
    instructions: "Look at the word parts.",
  };
}

const VOCAB_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [(r) => oppositeQ(r, ["easy"])],
  2: [(r) => oppositeQ(r, ["easy"]), (r) => synonymQ(r, "simple")],
  3: [(r) => oppositeQ(r, ["easy", "mid"]), (r) => synonymQ(r, "simple")],
  4: [(r) => oppositeQ(r, ["mid"]), (r) => synonymQ(r, "simple")],
  5: [(r) => oppositeQ(r, ["mid"]), (r) => synonymQ(r, "adv"), (r) => defQ(r, false)],
  6: [(r) => oppositeQ(r, ["hard"]), (r) => synonymQ(r, "adv"), (r) => defQ(r, false), affixQ],
  7: [(r) => oppositeQ(r, ["hard"]), (r) => defQ(r, false), affixQ],
  8: [(r) => oppositeQ(r, ["hard"]), (r) => defQ(r, true), affixQ],
  9: [(r) => defQ(r, true), (r) => synonymQ(r, "adv"), affixQ],
  10: [(r) => defQ(r, true), (r) => oppositeQ(r, ["hard"]), (r) => synonymQ(r, "adv")],
};

// ─── Comprehension (Story Castle, Ember) ─────────────────────────────────────

const HEROES = ["Ember", "Ember", "Mia", "Sam", "Zara", "Omar", "Lily", "Ben", "Ava", "Noah", "Priya", "Kai"];
const ITEMS = ["hat", "ball", "kite", "book", "sock", "key", "teddy bear", "backpack"];
const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
const PLACES = ["kitchen", "garden", "playground", "library", "bedroom", "park", "tower", "stable"];

function lostStory(rand: Rand, variant: number): Q {
  const H = pickOne(HEROES, rand);
  const item = pickOne(ITEMS, rand);
  const color = pickOne(COLORS, rand);
  const [p1, p2, p3] = sample(PLACES, 3, rand);
  const passage = `${H} lost a ${color} ${item}. ${H} looked in the ${p1} first. Then ${H} looked by the ${p2}. At last, ${H} found it in the ${p3}.`;
  const base = { passage, instructions: "Read the story and answer." };
  switch (variant % 4) {
    case 0: return { ...base, question: `What did ${H} lose?`, answer: item, wrong: sample(ITEMS.filter((x) => x !== item), 3, rand), why: `The story says ${H} lost a ${color} ${item}.` };
    case 1: return { ...base, question: `What color was the ${item}?`, answer: color, wrong: sample(COLORS.filter((x) => x !== color), 3, rand), why: `It was a ${color} ${item}.` };
    case 2: return { ...base, question: `Where did ${H} find the ${item}?`, answer: p3, wrong: [p1, p2, ...sample(PLACES.filter((x) => ![p1, p2, p3].includes(x)), 1, rand)], why: `At last, ${H} found it in the ${p3}.` };
    default: return { ...base, question: `Where did ${H} look first?`, answer: p1, wrong: [p2, p3, ...sample(PLACES.filter((x) => ![p1, p2, p3].includes(x)), 1, rand)], why: `${H} looked in the ${p1} first.` };
  }
}

const INGREDIENTS = ["flour", "honey", "berries", "milk", "cheese", "apples", "cocoa", "oats"];
const DISHES = ["cake", "bread", "pie", "cookies"];
const FRIENDS = ["Gummy", "Pip", "Beep", "Leo", "Chef Pie", "Professor Hoot"];

function recipeStory(rand: Rand, variant: number): Q {
  const H = pickOne(HEROES, rand);
  const [a, b] = sample(INGREDIENTS, 2, rand);
  const dish = pickOne(DISHES, rand);
  const mins = pickOne([10, 15, 20, 25, 30], rand);
  const friend = pickOne(FRIENDS, rand);
  const steps = [`mixed the ${a}`, `added the ${b}`, `baked the ${dish}`, `shared it with ${friend}`];
  const passage = `First, ${H} mixed the ${a}. Next, ${H} added the ${b}. Then ${H} baked the ${dish} for ${mins} minutes. Last, ${H} shared it with ${friend}.`;
  const base = { passage, instructions: "Read the story and answer." };
  switch (variant % 5) {
    case 0: return { ...base, question: `What did ${H} do first?`, answer: steps[0], wrong: steps.slice(1), why: `First, ${H} ${steps[0]}.` };
    case 1: return { ...base, question: `What did ${H} do last?`, answer: steps[3], wrong: steps.slice(0, 3), why: `Last, ${H} ${steps[3]}.` };
    case 2: return { ...base, question: `What did ${H} do right after adding the ${b}?`, answer: steps[2], wrong: [steps[0], steps[3], `washed the dishes`], why: `Then ${H} ${steps[2]}.` };
    case 3: {
      const times = [10, 15, 20, 25, 30];
      return { ...base, question: `How many minutes did ${H} bake the ${dish}?`, answer: String(mins), wrong: times.filter((t) => t !== mins).slice(0, 3).map(String), why: `It baked for ${mins} minutes.` };
    }
    default: return { ...base, question: `Who did ${H} share the ${dish} with?`, answer: friend, wrong: sample(FRIENDS.filter((f) => f !== friend), 3, rand), why: `${H} shared it with ${friend}.` };
  }
}

// cause, effect, "why" question, "what happened" question ({H} is replaced)
const CAUSE: [string, string, string, string][] = [
  ["it rained all night", "the river grew very high", "Why did the river grow very high?", "What happened because it rained all night?"],
  ["the ice cream sat in the hot sun", "it melted into a puddle", "Why did the ice cream melt?", "What happened because the ice cream sat in the hot sun?"],
  ["{H} forgot to water the plant", "the leaves turned yellow", "Why did the leaves turn yellow?", "What happened because {H} forgot to water the plant?"],
  ["the wind blew very hard", "the kite flew up high", "Why did the kite fly up high?", "What happened because the wind blew very hard?"],
  ["{H} stayed up too late", "{H} felt sleepy at school", "Why did {H} feel sleepy at school?", "What happened because {H} stayed up too late?"],
  ["{H} practised every day", "{H} got much better at the drums", "Why did {H} get much better at the drums?", "What happened because {H} practised every day?"],
  ["a big storm knocked down a tree", "the road was blocked", "Why was the road blocked?", "What happened because a big storm knocked down a tree?"],
  ["the batteries ran out", "the toy robot stopped moving", "Why did the toy robot stop moving?", "What happened because the batteries ran out?"],
];

function causeStory(rand: Rand, variant: number): Q {
  const H = pickOne(HEROES, rand);
  const fill = (s: string) => s.replaceAll("{H}", H);
  const idx = Math.floor(rand() * CAUSE.length);
  const [cause, effect, qWhy, qWhat] = CAUSE[idx].map(fill);
  const passage = `${cap(cause)}. So ${effect}.`;
  const others = CAUSE.filter((_, i) => i !== idx).map((c) => c.map(fill));
  const base = { passage, instructions: "Read the story and answer." };
  return variant % 2 === 0
    ? { ...base, question: qWhy, answer: cap(cause), wrong: sample(others, 3, rand).map((o) => cap(o[0])), why: `${cap(cause)}, so ${effect}.` }
    : { ...base, question: qWhat, answer: cap(effect), wrong: sample(others, 3, rand).map((o) => cap(o[1])), why: `Because ${cause}, ${effect}.` };
}

// clue sentences, what we can tell, the question, answer, other choices
const INFER: { clue: string; q: string; a: string; wrong: string[] }[] = [
  { clue: "{H} grabbed an umbrella and pulled on rain boots. Big drops tapped the window.", q: "What was the weather like?", a: "rainy", wrong: ["sunny", "snowy", "hot and dry"] },
  { clue: "{H} wore a heavy coat and thick gloves. Every breath came out as a white puff.", q: "What was the weather like?", a: "very cold", wrong: ["very hot", "rainy", "warm and sunny"] },
  { clue: "{H} jumped up and down and could not stop smiling. Today was the big day!", q: "How did {H} feel?", a: "excited", wrong: ["tired", "angry", "bored"] },
  { clue: "{H}'s knees shook, and {H} hid under the blanket when the thunder boomed.", q: "How did {H} feel?", a: "scared", wrong: ["proud", "bored", "silly"] },
  { clue: "{H} sat alone and tears rolled down. {H}'s best friend had moved far away.", q: "How did {H} feel?", a: "sad", wrong: ["excited", "angry", "sleepy"] },
  { clue: "The waves splashed and warm sand tickled {H}'s toes.", q: "Where was {H}?", a: "at the beach", wrong: ["in a library", "on a snowy mountain", "in a classroom"] },
  { clue: "Books filled every shelf. {H} whispered so nobody would be disturbed.", q: "Where was {H}?", a: "in a library", wrong: ["at the beach", "on a farm", "at a football match"] },
  { clue: "The stars twinkled and the moon was high. {H} yawned and climbed into bed.", q: "What time of day was it?", a: "night", wrong: ["morning", "lunchtime", "afternoon"] },
  { clue: "The rooster crowed and the sun peeked over the hills. {H} stretched and got up.", q: "What time of day was it?", a: "early morning", wrong: ["midnight", "evening", "afternoon"] },
  { clue: "Leaves turned red and orange and drifted down from the trees. {H} pulled on a warm jumper.", q: "Which season was it?", a: "autumn", wrong: ["spring", "summer", "winter"] },
  { clue: "Flowers popped up and baby birds chirped in their nests. {H} planted some seeds.", q: "Which season was it?", a: "spring", wrong: ["autumn", "winter", "summer"] },
];

function inferStory(rand: Rand): Q {
  const H = pickOne(HEROES, rand);
  const fill = (s: string) => s.replaceAll("{H}", H);
  const it = pickOne(INFER, rand);
  return {
    passage: fill(it.clue), question: fill(it.q), answer: it.a, wrong: it.wrong,
    why: `The clues in the story tell us: ${it.a}.`, instructions: "Use the clues to work it out.",
  };
}

interface Fact { title: string; text: string; main: string; detail: { q: string; a: string; wrong: string[] }[] }
const FACTS: Fact[] = [
  { title: "Bees", text: "Bees visit flowers to collect a sweet liquid called nectar. They carry it back to the hive. There, it slowly turns into honey.", main: "Bees make honey from nectar", detail: [{ q: "What do bees collect from flowers?", a: "nectar", wrong: ["seeds", "water", "leaves"] }, { q: "Where do bees carry the nectar?", a: "to the hive", wrong: ["to the river", "to a tree", "to the sea"] }] },
  { title: "Penguins", text: "Penguins cannot fly, but they are strong swimmers. Their flippers work like paddles. They dive into the cold sea to catch fish.", main: "Penguins are great swimmers", detail: [{ q: "What works like paddles?", a: "their flippers", wrong: ["their feathers", "their beaks", "their eyes"] }, { q: "What do penguins catch in the sea?", a: "fish", wrong: ["birds", "crabs only", "seaweed"] }] },
  { title: "Recycling", text: "Recycling turns old paper, glass and plastic into new things. This saves energy. It also keeps trash out of the ground.", main: "Recycling helps the planet", detail: [{ q: "What does recycling save?", a: "energy", wrong: ["money only", "water only", "time only"] }, { q: "Where does recycling keep trash out of?", a: "the ground", wrong: ["the sky", "the sea only", "the shop"] }] },
  { title: "The Moon", text: "The moon travels around Earth. One trip takes about a month. As it moves, we see it in different shapes.", main: "The moon moves around Earth", detail: [{ q: "How long is one trip around Earth?", a: "about a month", wrong: ["about a day", "about a week", "about a year"] }, { q: "What do we see as the moon moves?", a: "different shapes", wrong: ["different colors only", "falling stars", "rain"] }] },
  { title: "Trees", text: "Trees give us shade on hot days. Their roots hold the soil in place. Birds build nests in their branches.", main: "Trees help in many ways", detail: [{ q: "What do tree roots do?", a: "hold the soil in place", wrong: ["make shade", "build nests", "make rain"] }, { q: "Who builds nests in trees?", a: "birds", wrong: ["fish", "bees only", "penguins"] }] },
  { title: "Sleep", text: "Sleep helps our bodies grow. It also helps our brains remember what we learned. Children need about ten hours each night.", main: "Sleep is important for children", detail: [{ q: "How many hours of sleep do children need?", a: "about ten", wrong: ["about two", "about five", "about fifteen"] }, { q: "What does sleep help our brains do?", a: "remember what we learned", wrong: ["grow taller", "run faster", "feel hungry"] }] },
];

function factsStory(rand: Rand, variant: number): Q {
  const idx = Math.floor(rand() * FACTS.length);
  const f = FACTS[idx];
  const base = { passage: `${f.title}. ${f.text}`, instructions: "Read the passage and answer." };
  if (variant % 2 === 0) {
    const others = FACTS.filter((_, i) => i !== idx).map((o) => o.main);
    return { ...base, question: "What is the main idea of this passage?", answer: f.main, wrong: sample(others, 3, rand), why: "Every sentence is about this big idea." };
  }
  const d = pickOne(f.detail, rand);
  return { ...base, question: d.q, answer: d.a, wrong: d.wrong, why: `The passage says it: ${d.a}.` };
}

const COMP_PLAN: Record<number, ((r: Rand, v: number) => Q)[]> = {
  1: [lostStory],
  2: [lostStory],
  3: [lostStory, recipeStory],
  4: [lostStory, recipeStory],
  5: [recipeStory, causeStory],
  6: [recipeStory, causeStory, inferStory],
  7: [causeStory, inferStory, factsStory],
  8: [causeStory, inferStory, factsStory],
  9: [inferStory, factsStory],
  10: [inferStory, factsStory, causeStory],
};

// ─── Builder ─────────────────────────────────────────────────────────────────

function build(
  prefix: string, topicId: string, title: string, seedBase: number,
  plan: Record<number, ((r: Rand, v: number) => Q)[]>, helper: string
): SeedExercise[] {
  const out: SeedExercise[] = [];
  for (let level = 1; level <= 10; level++) {
    const gens = plan[level];
    const seen = new Set<string>();
    for (let i = 1; i <= PER_LEVEL; i++) {
      let q: Q | null = null;
      let rand: Rand = rng(seedBase + level * 1000 + i);
      for (let attempt = 0; attempt < 60; attempt++) {
        rand = rng(seedBase + level * 1000 + i + attempt * 7919);
        const cand = gens[(i - 1) % gens.length](rand, i);
        const key = `${cand.passage ?? ""}|${cand.question}|${cand.answer}`;
        if (!seen.has(key)) { q = cand; seen.add(key); break; }
      }
      if (!q) continue; // pool exhausted for this level: fewer questions is better than duplicates

      const wrong = [...new Set(q.wrong)].filter((w) => w !== q!.answer).slice(0, 3);
      if (wrong.length !== 3) throw new Error(`${prefix}-${level}-${i}: needs 3 distinct wrong answers (${q.question})`);
      const options = q.sort ? [q.answer, ...wrong].sort((a, b) => Number(a) - Number(b)) : shuffle([q.answer, ...wrong], rand);
      out.push({
        id: `${prefix}-${level}-${i}`,
        topicId,
        title,
        instructions: q.instructions ?? `Help ${helper}! Choose the correct answer.`,
        type: q.passage ? "reading_comp" : "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        starReward: q.passage || level >= 6 ? 2 : 1,
        data: {
          question: q.question, options, answer: q.answer, explanation: q.why,
          ...(q.passage ? { passage: q.passage } : {}),
          ...(q.icons ? { icons: q.icons } : {}),
        },
      });
    }
  }
  return out;
}

export function generatePhonics(): SeedExercise[] {
  return build("rq-ph", "topic-phonics", "Sound Safari", 100_000, PHONICS_PLAN, "Leo");
}
export function generateVocabulary(): SeedExercise[] {
  return build("rq-vo", "topic-vocabulary", "Word Woods", 200_000, VOCAB_PLAN, "Professor Hoot");
}
export function generateComprehension(): SeedExercise[] {
  return build("rq-co", "topic-comprehension", "Story Castle", 300_000, COMP_PLAN, "Ember");
}
