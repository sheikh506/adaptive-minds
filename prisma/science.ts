import { difficultyFor, rewards, rng, shuffle, type SeedExercise } from "./stories";

/**
 * Science worlds: Jungle Lab (life science), Starry Skies (earth and space), Wonder Workshop (matter and energy).
 * Each world mixes a hand-written fact bank (tiers 1–5, roughly kindergarten to grade 6) with classification
 * questions generated from item lists, so a level never feels like a short quiz on repeat.
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
}

const pickOne = <T,>(list: readonly T[], rand: Rand): T => list[Math.floor(rand() * list.length)];
const sample = <T,>(list: readonly T[], n: number, rand: Rand): T[] => shuffle([...list], rand).slice(0, n);

/** [question, answer, [3 wrong answers], tier 1–5, optional explanation] */
type Fact = [string, string, [string, string, string], number, string?];

function factQ(facts: Fact[], tiers: number[]) {
  const pool = facts.filter((f) => tiers.includes(f[3]));
  return (rand: Rand): Q => {
    const f = pickOne(pool, rand);
    return {
      question: f[0],
      answer: f[1],
      wrong: [...f[2]],
      why: f[4] ?? `The answer is "${f[1]}".`,
      instructions: "Think carefully, then choose.",
    };
  };
}

/** "a" or "an" before a word. */
const a = (word: string) => (/^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`);

/** "Which of these is a <category>?" from item lists. Wrong answers come from all the other categories. */
function classifyQ(groups: Record<string, string[]>, label: (cat: string) => string) {
  const cats = Object.keys(groups);
  return (rand: Rand): Q => {
    const cat = pickOne(cats, rand);
    const answer = pickOne(groups[cat], rand);
    const pool = cats.filter((c) => c !== cat).flatMap((c) => groups[c]);
    return {
      question: `Which of these ${label(cat)}?`,
      answer,
      wrong: sample(pool, 3, rand),
      why: `${answer} ${label(cat)}.`,
    };
  };
}

function yesNoQ(groups: Record<string, string[]>, ask: (item: string) => string, yesCat: string) {
  const cats = Object.keys(groups);
  return (rand: Rand): Q => {
    const cat = pickOne(cats, rand);
    const item = pickOne(groups[cat], rand);
    const isYes = cat === yesCat;
    return {
      question: ask(item),
      answer: isYes ? "Yes" : "No",
      wrong: [isYes ? "No" : "Yes", "Only sometimes", "Nobody knows"],
      why: isYes ? `Yes, ${item} fits.` : `No, ${item} does not fit.`,
    };
  };
}

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
        data: { question: q.question, options: shuffle([q.answer, ...wrong], rand), answer: q.answer, explanation: q.why },
      });
    }
  }
  return out;
}

/** Which fact tiers a level draws from. */
const TIERS: Record<number, number[]> = {
  1: [1], 2: [1, 2], 3: [2], 4: [2, 3], 5: [3], 6: [3, 4], 7: [4], 8: [4, 5], 9: [5], 10: [5],
};

function plan(
  fact: (tiers: number[]) => (r: Rand) => Q,
  classify: ((r: Rand) => Q)[]
): Record<number, ((r: Rand) => Q)[]> {
  const out: Record<number, ((r: Rand) => Q)[]> = {};
  for (let level = 1; level <= 10; level++) {
    const f = fact(TIERS[level]);
    const c = classify[Math.min(classify.length - 1, Math.floor((level - 1) / 3))];
    out[level] = [f, f, c];
  }
  return out;
}

// ─── Life Science (Jungle Lab, Kiwi) ─────────────────────────────────────────

const LIFE_FACTS: Fact[] = [
  // tier 1
  ["What do plants need to grow?", "Sunlight, water and air", ["Candy and toys", "Only darkness", "Sand only"], 1],
  ["Which body part do we use to see?", "Eyes", ["Ears", "Nose", "Elbows"], 1],
  ["Which body part do we use to hear?", "Ears", ["Eyes", "Knees", "Teeth"], 1],
  ["A baby cat is called a…", "kitten", ["puppy", "chick", "calf"], 1],
  ["A baby dog is called a…", "puppy", ["kitten", "chick", "lamb"], 1],
  ["Where do fish live?", "In water", ["In trees", "In nests", "Underground"], 1],
  ["What do bees make?", "Honey", ["Milk", "Silk", "Bread"], 1],
  ["What covers a bird's body?", "Feathers", ["Fur", "Scales", "A shell"], 1],
  ["What do cows give us?", "Milk", ["Eggs", "Honey", "Wool"], 1],
  ["What do hens give us?", "Eggs", ["Milk", "Honey", "Wool"], 1],
  ["Which part of a plant is under the ground?", "Roots", ["Leaves", "Flower", "Fruit"], 1],
  ["Which body part do we use to smell?", "Nose", ["Hands", "Feet", "Hair"], 1],
  // tier 2
  ["What part of a plant takes in water from the soil?", "Roots", ["Leaves", "Petals", "Seeds"], 2],
  ["What do caterpillars turn into?", "Butterflies", ["Frogs", "Spiders", "Worms"], 2],
  ["What do tadpoles grow into?", "Frogs", ["Fish", "Snakes", "Lizards"], 2],
  ["Which sense do we use our tongue for?", "Taste", ["Sight", "Smell", "Hearing"], 2],
  ["What do herbivores eat?", "Plants", ["Only meat", "Rocks", "Other animals"], 2],
  ["What do carnivores eat?", "Meat", ["Only leaves", "Only fruit", "Only seeds"], 2],
  ["What part of a plant makes seeds?", "Flower", ["Root", "Stem", "Soil"], 2],
  ["How many legs does an insect have?", "6", ["4", "8", "10"], 2],
  ["How many legs does a spider have?", "8", ["6", "4", "10"], 2],
  ["Which animal sleeps through the winter?", "A bear", ["A goldfish", "A parrot", "A cow"], 2],
  ["Which part of a plant holds it up in the air?", "Stem", ["Root", "Seed", "Petal"], 2],
  ["Where do birds lay their eggs?", "In a nest", ["In the sea", "In a cloud", "In a pond"], 2],
  // tier 3
  ["What gas do plants use to make food?", "Carbon dioxide", ["Oxygen", "Helium", "Smoke"], 3],
  ["What gas do we breathe in to stay alive?", "Oxygen", ["Carbon dioxide", "Helium", "Smoke"], 3],
  ["What do we call the way plants make food from sunlight?", "Photosynthesis", ["Evaporation", "Migration", "Digestion"], 3],
  ["Which group of animals feeds its babies milk?", "Mammals", ["Reptiles", "Insects", "Birds"], 3],
  ["Which group do snakes belong to?", "Reptiles", ["Mammals", "Birds", "Insects"], 3],
  ["Which group do frogs belong to?", "Amphibians", ["Reptiles", "Mammals", "Insects"], 3],
  ["Which organ pumps blood around the body?", "Heart", ["Lungs", "Brain", "Stomach"], 3],
  ["Which organs do we use to breathe?", "Lungs", ["Heart", "Stomach", "Brain"], 3],
  ["What do we call animals that eat both plants and meat?", "Omnivores", ["Herbivores", "Carnivores", "Producers"], 3],
  ["What is a habitat?", "The place where an animal or plant lives", ["A kind of food", "A type of weather", "A part of the body"], 3],
  ["What do we call the stages of an animal's life, like egg, larva, pupa and adult?", "A life cycle", ["A food chain", "A habitat", "A migration"], 3],
  ["Which part of the body does the thinking?", "Brain", ["Heart", "Lungs", "Bones"], 3],
  // tier 4
  ["In a food chain, what is a plant that makes its own food called?", "Producer", ["Consumer", "Predator", "Decomposer"], 4],
  ["What do we call an animal that hunts other animals?", "Predator", ["Prey", "Producer", "Decomposer"], 4],
  ["What do we call an animal that is hunted?", "Prey", ["Predator", "Producer", "Decomposer"], 4],
  ["What do we call living things, like fungi, that break down dead plants and animals?", "Decomposers", ["Producers", "Predators", "Herbivores"], 4],
  ["What is the hard frame inside our body called?", "Skeleton", ["Muscles", "Skin", "Nerves"], 4],
  ["Which feature helps a polar bear stay warm?", "Thick fur and fat", ["Wings", "Gills", "A long neck"], 4],
  ["Why do camels have humps?", "To store fat for energy", ["To hold water", "To fly", "To swim"], 4],
  ["What is camouflage?", "Colours or patterns that help an animal hide", ["A loud call", "A kind of food", "A type of nest"], 4],
  ["What is it called when animals sleep through the cold winter?", "Hibernation", ["Migration", "Adaptation", "Pollination"], 4],
  ["What is it called when birds fly to a warmer place for winter?", "Migration", ["Hibernation", "Pollination", "Camouflage"], 4],
  ["Insects such as bees carry what from flower to flower to help plants make seeds?", "Pollen", ["Salt", "Sand", "Soil"], 4],
  ["What do we call animals that do NOT have a backbone?", "Invertebrates", ["Vertebrates", "Mammals", "Producers"], 4],
  // tier 5
  ["Which part of a cell holds its instructions (DNA)?", "Nucleus", ["Cell wall", "Cytoplasm", "Chloroplast"], 5],
  ["Which part of a plant cell captures sunlight?", "Chloroplast", ["Nucleus", "Vacuole", "Cell wall"], 5],
  ["What carries oxygen around in our blood?", "Red blood cells", ["White blood cells", "Bones", "Muscles"], 5],
  ["What do we call a trait passed from parents to children?", "Inherited trait", ["Learned habit", "A vitamin", "An injury"], 5],
  ["Which is a learned behaviour, not an inherited one?", "Riding a bike", ["Having brown eyes", "Blinking", "Having ten fingers"], 5],
  ["What is the study of living things called?", "Biology", ["Geology", "Astronomy", "Chemistry"], 5],
  ["Which group do mushrooms belong to?", "Fungi", ["Plants", "Animals", "Bacteria"], 5],
  ["In a food web, where does the energy first come from?", "The Sun", ["The soil", "The animals", "The water"], 5],
  ["What do we call the tiny building blocks of all living things?", "Cells", ["Bones", "Organs", "Seeds"], 5],
  ["What do we call animals with a backbone?", "Vertebrates", ["Invertebrates", "Producers", "Decomposers"], 5],
  ["What is the job of the digestive system?", "To break down food so the body can use it", ["To pump blood", "To control thinking", "To help us see"], 5],
  ["What is an ecosystem?", "Living and non-living things that work together in an area", ["A type of rock", "A kind of weather", "A single animal"], 5],
];

const LIVING = { living: ["a tree", "a dog", "a mushroom", "a fish", "a flower", "a bird", "a worm", "a frog", "a grass plant", "a bee"], "non-living": ["a rock", "a chair", "a pencil", "a cloud", "a toy car", "a spoon", "a bicycle", "a bucket", "a glass of water", "a book"] };
const ANIMAL_GROUPS: Record<string, string[]> = {
  mammal: ["dog", "whale", "bat", "horse", "dolphin", "monkey", "elephant", "rabbit"],
  bird: ["eagle", "penguin", "owl", "parrot", "duck", "robin", "ostrich"],
  fish: ["salmon", "shark", "goldfish", "tuna", "clownfish", "seahorse"],
  reptile: ["snake", "turtle", "lizard", "crocodile", "gecko", "chameleon"],
  insect: ["ant", "bee", "butterfly", "ladybug", "beetle", "grasshopper"],
};
const DIET = {
  herbivore: ["cow", "rabbit", "giraffe", "horse", "elephant", "deer"],
  carnivore: ["lion", "shark", "eagle", "tiger", "wolf", "crocodile"],
  omnivore: ["bear", "pig", "human", "raccoon", "chicken", "crow"],
};

export function generateLifeScience(): SeedExercise[] {
  const classify = [
    yesNoQ(LIVING, (item) => `Is ${item} a living thing?`, "living"),
    classifyQ(ANIMAL_GROUPS, (c) => `is ${a(c)}`),
    classifyQ(DIET, (c) => `is ${a(c)}`),
  ];
  return build("sc-li", "topic-life-science", "Jungle Lab", 600_000, plan((t) => factQ(LIFE_FACTS, t), classify), "Kiwi");
}

// ─── Earth & Space (Starry Skies, Nova) ──────────────────────────────────────

const EARTH_FACTS: Fact[] = [
  // tier 1
  ["What is the big star we see in the sky in the daytime?", "The Sun", ["The Moon", "A planet", "A cloud"], 1],
  ["What falls from clouds?", "Rain", ["Sand", "Leaves", "Toys"], 1],
  ["Which season is the coldest?", "Winter", ["Summer", "Spring", "Autumn"], 1],
  ["What is the name of the planet we live on?", "Earth", ["Mars", "Venus", "Jupiter"], 1],
  ["What colour is the sky on a clear day?", "Blue", ["Green", "Pink", "Black"], 1],
  ["What gives us light and heat in the daytime?", "The Sun", ["The Moon", "The wind", "The rain"], 1],
  ["What do we call moving air?", "Wind", ["Rain", "Snow", "Fog"], 1],
  ["What do we call frozen water?", "Ice", ["Steam", "Mud", "Sand"], 1],
  ["Where does rain come from?", "Clouds", ["The ground", "The Moon", "Rocks"], 1],
  ["Which of these is a season?", "Spring", ["Monday", "July", "Noon"], 1],
  ["What do we see in the sky at night?", "The Moon and stars", ["The Sun", "Rainbows", "Kites"], 1],
  ["What do we wear on a rainy day?", "A raincoat", ["Sandals", "A swimsuit", "Sunglasses"], 1],
  // tier 2
  ["How many planets are in our solar system?", "8", ["7", "9", "10"], 2],
  ["Which planet is closest to the Sun?", "Mercury", ["Earth", "Mars", "Neptune"], 2],
  ["What is the Moon?", "A natural satellite that goes around Earth", ["A star", "A planet", "A comet"], 2],
  ["What causes day and night?", "Earth spinning", ["The Moon hiding the Sun", "Clouds", "The Sun moving around Earth"], 2],
  ["Which planet is known as the Red Planet?", "Mars", ["Venus", "Jupiter", "Saturn"], 2],
  ["Which planet has big, bright rings?", "Saturn", ["Mars", "Mercury", "Earth"], 2],
  ["Which is the largest ocean on Earth?", "The Pacific Ocean", ["The Atlantic Ocean", "The Indian Ocean", "The Arctic Ocean"], 2],
  ["About how many days does Earth take to go around the Sun?", "365", ["30", "7", "100"], 2],
  ["What do we call very hot, dry land with little rain?", "A desert", ["A rainforest", "A glacier", "A swamp"], 2],
  ["Which tool measures temperature?", "A thermometer", ["A ruler", "A clock", "A scale"], 2],
  ["The ocean is made of water. What does it taste like?", "Salty", ["Sweet", "Fresh", "Bitter"], 2, "Ocean water is salty because it contains dissolved salts and minerals."],
  ["What is a rainbow made from?", "Sunlight and water drops", ["Paint", "Smoke", "Wind and sand"], 2],
  // tier 3
  ["Which is the largest planet in our solar system?", "Jupiter", ["Saturn", "Earth", "Mars"], 3],
  ["What is the Sun?", "A star", ["A planet", "A moon", "A comet"], 3],
  ["What is the name of our galaxy?", "The Milky Way", ["The Big Dipper", "Orion", "The Solar Way"], 3],
  ["On which layer of Earth do we live?", "The crust", ["The mantle", "The outer core", "The inner core"], 3],
  ["In the water cycle, what is it called when water turns into vapour?", "Evaporation", ["Condensation", "Precipitation", "Collection"], 3],
  ["In the water cycle, what is it called when vapour cools into clouds?", "Condensation", ["Evaporation", "Precipitation", "Collection"], 3],
  ["In the water cycle, what is it called when rain or snow falls?", "Precipitation", ["Evaporation", "Condensation", "Collection"], 3],
  ["Rock formed from cooled lava is called…", "Igneous rock", ["Sedimentary rock", "Metamorphic rock", "Mineral"], 3],
  ["What causes the seasons?", "Earth's tilt as it goes around the Sun", ["Earth moving closer to and farther from the Sun", "The Moon's phases", "Clouds blocking the Sun"], 3],
  ["About how long does the Moon take to go around Earth?", "About a month", ["A day", "A week", "A year"], 3],
  ["What is an earthquake?", "A shaking of the ground", ["A big storm", "A huge wave", "A strong wind"], 3],
  ["Which tool measures wind speed?", "An anemometer", ["A barometer", "A thermometer", "A compass"], 3],
  // tier 4
  ["Which planet is the hottest?", "Venus", ["Mercury", "Mars", "Jupiter"], 4],
  ["What is a light year?", "The distance light travels in one year", ["A year with extra light", "The age of a star", "The time Earth takes to spin"], 4],
  ["What is the force that pulls objects toward Earth?", "Gravity", ["Friction", "Magnetism", "Wind"], 4],
  ["What is weathering?", "Rocks slowly breaking into small pieces", ["Rocks growing bigger", "Rain turning to ice", "Soil turning to rock"], 4],
  ["What are fossils?", "Remains or prints of ancient living things", ["Newly made rocks", "Pieces of the Moon", "Frozen raindrops"], 4],
  ["What is the layer of gases around Earth called?", "The atmosphere", ["The crust", "The ocean", "The mantle"], 4],
  ["What do we call the path of a planet around the Sun?", "Its orbit", ["Its axis", "Its crater", "Its tide"], 4],
  ["What is the imaginary line that Earth spins around?", "Its axis", ["Its orbit", "Its equator", "Its crater"], 4],
  ["What causes ocean tides?", "The Moon's gravity", ["Wind only", "Fish moving", "Volcanoes"], 4],
  ["What is a comet mostly made of?", "Ice and dust", ["Solid iron", "Liquid water", "Sand and grass"], 4],
  ["What is erosion?", "Moving weathered rock by water or wind", ["Making new mountains", "Freezing water", "Melting metal"], 4],
  ["Which planet is the farthest from the Sun?", "Neptune", ["Earth", "Saturn", "Mercury"], 4],
  // tier 5
  ["Which layer of Earth is liquid metal?", "The outer core", ["The crust", "The mantle", "The inner core"], 5],
  ["Which gas makes up most of Earth's atmosphere?", "Nitrogen", ["Oxygen", "Carbon dioxide", "Hydrogen"], 5],
  ["What are tectonic plates?", "Huge slabs of Earth's crust that move slowly", ["Layers of clouds", "Ocean currents", "Giant rocks in space"], 5],
  ["A solar eclipse happens when…", "the Moon moves between the Sun and Earth", ["Earth moves between the Sun and Moon", "the Sun turns off", "clouds cover the Sun"], 5],
  ["A lunar eclipse happens when…", "Earth's shadow falls on the Moon", ["the Moon blocks the Sun", "the Sun hides", "a comet passes"], 5],
  ["Which planet has the Great Red Spot, a giant storm?", "Jupiter", ["Mars", "Saturn", "Neptune"], 5],
  ["Which star is closest to Earth after the Sun?", "Proxima Centauri", ["Sirius", "Polaris", "Betelgeuse"], 5],
  ["What is the point on the surface right above an earthquake's centre called?", "The epicentre", ["The crater", "The fault", "The ridge"], 5],
  ["What is the Big Bang theory about?", "How the universe began", ["How the Moon formed", "How volcanoes erupt", "How the Sun shines"], 5],
  ["What kind of rock is formed when sediment is pressed together?", "Sedimentary rock", ["Igneous rock", "Metamorphic rock", "Lava rock"], 5],
  ["Which planet is the only one known to have life?", "Earth", ["Mars", "Venus", "Mercury"], 5],
  ["What is the name of the boundary where two tectonic plates meet?", "A fault", ["A canyon", "A glacier", "A delta"], 5],
];

const PLANETS = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
const ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];
function planetOrderQ(rand: Rand): Q {
  const i = Math.floor(rand() * 8);
  return {
    question: `Counting out from the Sun, which planet is ${ORD[i]}?`,
    answer: PLANETS[i],
    wrong: sample(PLANETS.filter((p) => p !== PLANETS[i]), 3, rand),
    why: `The planets in order are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. ${PLANETS[i]} is ${ORD[i]}.`,
  };
}
const WEATHER = {
  sunny: ["It is bright and warm"], rainy: ["Drops fall from the clouds"], snowy: ["White flakes fall and it is freezing"], windy: ["Trees sway and kites fly high"],
};
function weatherQ(rand: Rand): Q {
  const w = pickOne(Object.keys(WEATHER), rand);
  return {
    question: `${WEATHER[w as keyof typeof WEATHER][0]}. What is the weather?`,
    answer: w,
    wrong: Object.keys(WEATHER).filter((x) => x !== w),
    why: `That describes ${w} weather.`,
  };
}
const ROCKS = {
  igneous: ["granite", "basalt", "obsidian", "pumice"],
  sedimentary: ["sandstone", "limestone", "shale", "chalk"],
  metamorphic: ["marble", "slate", "quartzite", "gneiss"],
};

export function generateEarthSpace(): SeedExercise[] {
  const classify = [weatherQ, planetOrderQ, classifyQ(ROCKS, (c) => `is ${a(c)} rock`)];
  return build("sc-es", "topic-earth-space", "Starry Skies", 610_000, plan((t) => factQ(EARTH_FACTS, t), classify), "Nova");
}

// ─── Matter & Energy (Wonder Workshop, Volt) ─────────────────────────────────

const MATTER_FACTS: Fact[] = [
  // tier 1
  ["Which of these is a liquid?", "Water", ["A rock", "A book", "A spoon"], 1],
  ["Which of these is a solid?", "A rock", ["Water", "Juice", "Milk"], 1],
  ["What happens to ice when it gets warm?", "It melts", ["It grows", "It turns into stone", "It gets harder"], 1],
  ["What can we use to see in the dark?", "A torch", ["A spoon", "A book", "A sock"], 1],
  ["Which of these makes a loud sound?", "A drum", ["A pillow", "A feather", "A cloud"], 1],
  ["A magnet sticks to which object?", "A paper clip", ["A wooden spoon", "A rubber band", "A sheet of paper"], 1],
  ["Which object floats on water?", "A leaf", ["A coin", "A rock", "A key"], 1],
  ["Which object sinks in water?", "A rock", ["A leaf", "A feather", "A cork"], 1],
  ["What do we feel when we touch a hot pan?", "Heat", ["Cold", "Sound", "Light"], 1],
  ["Which of these is a gas?", "Air", ["Water", "A rock", "Milk"], 1],
  ["Which sense helps us tell if something is hot?", "Touch", ["Taste", "Hearing", "Smell"], 1],
  ["What do we call water that has frozen?", "Ice", ["Steam", "Mud", "Rain"], 1],
  // tier 2
  ["What are the three states of matter?", "Solid, liquid and gas", ["Hot, warm and cold", "Big, medium and small", "Red, blue and green"], 2],
  ["What state of matter is steam?", "Gas", ["Solid", "Liquid", "Ice"], 2],
  ["What is a push or a pull called?", "A force", ["A colour", "A taste", "A sound"], 2],
  ["Which material is magnetic?", "Iron", ["Plastic", "Wood", "Glass"], 2],
  ["What does a magnet have at its ends?", "Poles", ["Legs", "Wheels", "Wings"], 2],
  ["Which of these gives out its own light?", "The Sun", ["The Moon", "A mirror", "A window"], 2],
  ["Which material can we see through?", "Clear glass", ["Wood", "Metal", "Cardboard"], 2],
  ["What does a thermometer measure?", "Temperature", ["Weight", "Length", "Time"], 2],
  ["Which material bends easily?", "A rubber band", ["A rock", "A glass bottle", "A brick"], 2],
  ["What happens to water when it gets very cold?", "It freezes into ice", ["It turns into sand", "It disappears", "It turns green"], 2],
  ["Which is a push?", "Kicking a ball", ["Pulling a rope", "Reading a book", "Looking at a picture"], 2],
  ["What do we call a shadow?", "A dark shape made when light is blocked", ["A kind of light", "A sound", "A colour"], 2],
  // tier 3
  ["Which state of matter keeps its own shape?", "Solid", ["Liquid", "Gas", "Steam"], 3],
  ["Which state of matter spreads out to fill its container?", "Gas", ["Solid", "Liquid", "Ice"], 3],
  ["What is it called when a liquid turns into a solid?", "Freezing", ["Melting", "Evaporating", "Condensing"], 3],
  ["What is it called when a solid turns into a liquid?", "Melting", ["Freezing", "Condensing", "Boiling"], 3],
  ["What is it called when a gas cools into a liquid?", "Condensation", ["Melting", "Freezing", "Evaporation"], 3],
  ["Which force slows down sliding objects?", "Friction", ["Gravity", "Magnetism", "Light"], 3],
  ["Which surface has the least friction?", "Smooth ice", ["Rough carpet", "Sandpaper", "Grass"], 3],
  ["Which material lets electricity flow easily?", "A metal wire", ["Rubber", "Wood", "Plastic"], 3],
  ["What do we call a material that does NOT let electricity pass?", "An insulator", ["A conductor", "A battery", "A wire"], 3],
  ["Light travels in…", "straight lines", ["circles", "zig-zags", "spirals"], 3],
  ["What do we call something that you cannot see through at all?", "Opaque", ["Transparent", "Clear", "Shiny"], 3],
  ["What is energy?", "The ability to do work or make things change", ["A kind of food", "A type of rock", "A colour"], 3],
  // tier 4
  ["What is a mixture?", "Two or more things mixed together that can be separated", ["A new substance with no parts", "A kind of metal", "A type of gas only"], 4],
  ["How can you get salt back from salty water?", "Let the water evaporate", ["Freeze it and shake it", "Use a magnet", "Add sugar"], 4],
  ["What is the chemical formula for water?", "H₂O", ["CO₂", "O₂", "NaCl"], 4],
  ["Which is a physical change?", "Melting ice", ["Burning paper", "Rusting iron", "Baking a cake"], 4],
  ["Which is a chemical change?", "Rusting iron", ["Melting ice", "Cutting paper", "Freezing water"], 4],
  ["What is potential energy?", "Stored energy because of position or condition", ["Energy of motion", "Energy from heat only", "Energy that is used up"], 4],
  ["What is kinetic energy?", "The energy of motion", ["Stored energy", "Energy from food only", "Energy that cannot change"], 4],
  ["Which energy source is renewable?", "Solar energy", ["Coal", "Oil", "Natural gas"], 4],
  ["Which energy source is non-renewable?", "Coal", ["Wind", "Solar", "Water power"], 4],
  ["A light bulb changes electrical energy into…", "light and heat", ["only sound", "only motion", "food"], 4],
  ["What happens to the pitch of a sound when a guitar string is shorter?", "It gets higher", ["It gets lower", "It stays the same", "It gets quieter"], 4],
  ["What do we call a force that pulls objects together without touching?", "Magnetism", ["Friction", "Pressure", "Heat"], 4],
  // tier 5
  ["What is the smallest unit of an element?", "An atom", ["A cell", "A crystal", "A drop"], 5],
  ["Which particles are in the centre of an atom?", "Protons and neutrons", ["Electrons only", "Cells", "Molecules"], 5],
  ["What is the unit of force?", "Newton", ["Watt", "Joule", "Metre"], 5],
  ["What is the unit of energy?", "Joule", ["Newton", "Watt", "Kilogram"], 5],
  ["What is the unit of electric current?", "Ampere", ["Volt", "Ohm", "Watt"], 5],
  ["Newton's first law says an object at rest…", "stays at rest unless a force acts on it", ["always starts to move", "gets heavier", "turns into energy"], 5],
  ["What does a switch do in a circuit?", "Opens or closes the path for the current", ["Makes electricity", "Stores energy", "Makes light"], 5],
  ["What is density?", "How much mass is in a given volume", ["How big something looks", "How fast something moves", "How hot something is"], 5],
  ["Why does oil float on water?", "It is less dense than water", ["It is heavier than water", "It is colder", "It is made of metal"], 5],
  ["What is the pH of a neutral liquid like pure water?", "7", ["0", "14", "1"], 5],
  ["What is the law of conservation of energy?", "Energy cannot be created or destroyed, only changed", ["Energy always gets used up", "Energy comes only from the Sun", "Energy is always heat"], 5],
  ["Sound cannot travel through…", "empty space (a vacuum)", ["water", "air", "metal"], 5],
];

const STATES = {
  solid: ["a stone", "a pencil", "an ice cube", "a coin", "a chair", "a brick"],
  liquid: ["milk", "juice", "oil", "rain water", "liquid soap", "honey"],
  gas: ["steam", "air", "helium in a balloon", "oxygen", "water vapour", "the gas in soda bubbles"],
};
const FLOAT = {
  float: ["a cork", "a leaf", "a wooden block", "a plastic duck", "an empty bottle", "a beach ball"],
  sink: ["a coin", "a rock", "a metal key", "a marble", "a spoon", "a nail"],
};
const MAGNET = {
  magnetic: ["a nail", "a paper clip", "an iron pan", "a steel spoon", "a screw"],
  "not magnetic": ["a wooden spoon", "a plastic toy", "a glass cup", "a rubber band", "a sheet of paper"],
};
const CONDUCT = {
  conductor: ["a copper wire", "an iron nail", "a silver spoon", "an aluminium foil strip"],
  insulator: ["a rubber glove", "a plastic comb", "a wooden stick", "a glass rod"],
};

export function generateMatterEnergy(): SeedExercise[] {
  const classify = [
    classifyQ(STATES, (c) => `is ${a(c)}`),
    yesNoQ(FLOAT, (item) => `Will ${item} float in water?`, "float"),
    yesNoQ(CONDUCT, (item) => `Does ${item} let electricity flow through easily?`, "conductor"),
    classifyQ(MAGNET, (c) => `is ${c}`),
  ];
  return build("sc-me", "topic-matter-energy", "Wonder Workshop", 620_000, plan((t) => factQ(MATTER_FACTS, t), classify), "Volt");
}
