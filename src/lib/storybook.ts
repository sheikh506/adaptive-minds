/**
 * Story Time. Short original read-aloud picture books for ages 4-9. Each page is an illustration (a painted
 * SVG backdrop with emoji characters standing on it, nothing to download), a few short sentences, and every
 * book ends with three "think about it" questions that each explain WHY an answer is right.
 * Pure data: safe on server and client.
 */

import type { Backdrop } from "./scene";

export interface StoryQuestion {
  question: string;
  options: string[];
  answer: string;
  why: string;
}

export interface StoryPage {
  /** The characters in the picture, as emoji. The first one is the hero. */
  scene: string;
  text: string;
  /** Changes the setting for this page; otherwise the book's backdrop is used. */
  backdrop?: Backdrop;
}

export interface Story {
  id: string;
  title: string;
  emoji: string;
  /** Tailwind gradient for the cover, e.g. "from-pink-400 to-orange-400" */
  cover: string;
  level: "Little" | "Bigger";
  theme: string;
  /** The default setting for the pictures. */
  backdrop: Backdrop;
  pages: StoryPage[];
  questions: StoryQuestion[];
}

export const STORIES: Story[] = [
  {
    id: "luna-and-the-lost-star",
    title: "Luna and the Lost Star",
    emoji: "🌟",
    cover: "from-indigo-500 to-fuchsia-500",
    level: "Little",
    theme: "Kindness",
    backdrop: "night",
    pages: [
      { scene: "🌙🐰🌲", text: "Luna the little rabbit loved the night sky. Every evening she counted the stars from her hill." },
      { scene: "🌌😮⭐", text: "One night, a small star fell down. It landed in the tall grass with a soft plop." },
      { scene: "⭐😢🌾", text: "The star was shaking. 'I am too tiny to climb back up,' it said sadly." },
      { scene: "🐰🤔🦉", text: "Luna thought hard. She asked Owl for help. 'Wise friends can solve big problems,' said Owl." },
      { scene: "🐰🎈⭐", text: "Luna and Owl tied the star to a bunch of balloons. Up, up, up it floated into the sky." },
      { scene: "🌟🌙💖", text: "The star twinkled brightest of all. Luna smiled. Helping a friend made her feel warm inside." },
    ],
    questions: [
      {
        question: "Why couldn't the little star go back up by itself?",
        options: ["It was too tiny to climb", "It was asleep", "It did not want to go", "It was too heavy"],
        answer: "It was too tiny to climb",
        why: "The star said, 'I am too tiny to climb back up.' When a character tells us a reason, we can find it in the story.",
      },
      {
        question: "How did Luna and Owl help the star?",
        options: ["They tied it to balloons", "They threw it up", "They built a ladder", "They called the moon"],
        answer: "They tied it to balloons",
        why: "Page 5 says they tied the star to a bunch of balloons, and it floated up. Going back to the page helps us check.",
      },
      {
        question: "How did Luna feel at the end?",
        options: ["Warm inside because she helped", "Angry", "Sleepy", "Scared"],
        answer: "Warm inside because she helped",
        why: "The story says helping a friend made her feel warm inside. Kind actions often make us feel happy too.",
      },
    ],
  },
  {
    id: "milo-the-messy-painter",
    title: "Milo the Messy Painter",
    emoji: "🎨",
    cover: "from-orange-400 to-rose-500",
    level: "Little",
    theme: "Trying again",
    backdrop: "home",
    pages: [
      { scene: "🐒🎨🖌️", text: "Milo the monkey loved to paint. But his paintings were always very, very messy." },
      { scene: "🐒😞🖼️", text: "'Mine look funny,' sighed Milo. He looked at the neat paintings of his friends." },
      { scene: "🦒💛🐒", text: "Gigi the giraffe said, 'I love the colours in yours! Nobody paints like you.'" },
      { scene: "🐒💡🌈", text: "Milo had an idea. He splashed red, blue and yellow all over a huge paper." },
      { scene: "🌈🖼️😲", text: "It looked like a rainbow garden! Everyone stopped to look. 'Wow!' they said." },
      { scene: "🐒🥳🎉", text: "Milo learned that being different can be wonderful. He kept on painting, messy and proud." },
    ],
    questions: [
      {
        question: "Why was Milo sad at the start?",
        options: ["His paintings looked messy", "He lost his brush", "It was raining", "He was hungry"],
        answer: "His paintings looked messy",
        why: "The story begins by telling us his paintings were always very messy, and Milo said they looked funny.",
      },
      {
        question: "What did Milo paint when he had his idea?",
        options: ["A rainbow garden", "A big house", "His mother", "A sleepy cat"],
        answer: "A rainbow garden",
        why: "He splashed three colours across a huge paper, and it looked like a rainbow garden.",
      },
      {
        question: "What is the lesson of the story?",
        options: ["Being different can be wonderful", "Never use paint", "Only neat is good", "Give up quickly"],
        answer: "Being different can be wonderful",
        why: "The last page says Milo learned this. The lesson of a story is often told near the end.",
      },
    ],
  },
  {
    id: "the-brave-little-boat",
    title: "The Brave Little Boat",
    emoji: "⛵",
    cover: "from-cyan-400 to-blue-600",
    level: "Little",
    theme: "Courage",
    backdrop: "sea",
    pages: [
      { scene: "⛵🌊☀️", text: "Bo was a little blue boat. He bobbed in the harbour and watched the big ships sail away." },
      { scene: "⛵😟🚢", text: "'I am too small for the sea,' thought Bo. His sail trembled in the wind." },
      { scene: "🐬😊⛵", text: "A dolphin popped up. 'The sea is big, but you can go one wave at a time,' she said." },
      { scene: "⛵🌊🌊", text: "Bo took a deep breath. He sailed over one wave. Then another. Then another." },
      { backdrop: "island", scene: "🏝️⛵🎉", text: "At last he reached a green island with palm trees. He had done it, all by himself!" },
      { backdrop: "sunset", scene: "⛵🌅💙", text: "Bo sailed home under a pink sunset. He was still small, but now he felt very brave." },
    ],
    questions: [
      {
        question: "What did the dolphin tell Bo?",
        options: ["Go one wave at a time", "Stay in the harbour", "Sail very fast", "Sleep all day"],
        answer: "Go one wave at a time",
        why: "Big jobs feel easier when we take small steps. Bo took one wave at a time.",
      },
      {
        question: "Where did Bo sail to?",
        options: ["A green island", "A snowy mountain", "A big city", "A cave"],
        answer: "A green island",
        why: "Page 5 tells us he reached a green island with palm trees.",
      },
      {
        question: "Which word best describes Bo at the end?",
        options: ["Brave", "Lazy", "Grumpy", "Lost"],
        answer: "Brave",
        why: "He did something that scared him, and he finished it. That is what being brave means.",
      },
    ],
  },
  {
    id: "zara-and-the-seed",
    title: "Zara and the Tiny Seed",
    emoji: "🌱",
    cover: "from-lime-400 to-emerald-600",
    level: "Bigger",
    theme: "Patience & science",
    backdrop: "garden",
    pages: [
      { scene: "👧🌱🪴", text: "Zara planted a tiny seed in a pot. She patted the soil and gave it a little water." },
      { scene: "☀️🪴👧", text: "'Grow, grow!' she said. She put the pot on the window sill, where the sun could reach it." },
      { backdrop: "rain", scene: "🌧️🪴😴", text: "Days went by and nothing happened. 'Plants need time,' said Grandpa. 'Roots grow first, down in the dark.'" },
      { scene: "🌱😮✨", text: "On the tenth morning, a tiny green shoot pushed out of the soil. Zara gasped with joy." },
      { scene: "🌿🌿☀️", text: "Every day she watered it and turned it toward the light. The shoot grew leaves, then a tall stem." },
      { scene: "🌻🐝👧", text: "By summer, a big yellow sunflower smiled at her. A bee buzzed by. Patience had paid off!" },
    ],
    questions: [
      {
        question: "Why did Zara see nothing for many days?",
        options: ["Roots grow first, under the soil", "The seed was broken", "She forgot the water", "It was too hot"],
        answer: "Roots grow first, under the soil",
        why: "Grandpa explained that roots grow first in the dark. Plants do a lot of growing we cannot see.",
      },
      {
        question: "What three things did the plant need, according to the story?",
        options: ["Water, sun and time", "Toys, music and sand", "Snow, wind and stones", "Paint, glue and paper"],
        answer: "Water, sun and time",
        why: "Zara watered it, put it in the sun, and waited. Plants need water, light and time to grow.",
      },
      {
        question: "What came last in the plant's life in this story?",
        options: ["A yellow sunflower", "The seed", "The first shoot", "The first leaves"],
        answer: "A yellow sunflower",
        why: "Stories happen in order: seed, shoot, leaves and stem, and finally the flower. Putting events in order is called sequencing.",
      },
    ],
  },
  {
    id: "captain-pip-and-the-moon-rocket",
    title: "Captain Pip and the Moon Rocket",
    emoji: "🚀",
    cover: "from-slate-700 to-violet-600",
    level: "Bigger",
    theme: "Space & problem solving",
    backdrop: "space",
    pages: [
      { backdrop: "meadow", scene: "🐧🚀🌕", text: "Captain Pip the penguin built a rocket out of a big silver box. Today he would fly to the Moon!" },
      { scene: "🔟9️⃣8️⃣", text: "'Ten, nine, eight...' Pip counted down. 'Three, two, one... blast off!'" },
      { scene: "🚀✨🌍", text: "WHOOSH! The rocket climbed past the clouds. Far below, the Earth looked like a blue marble." },
      { backdrop: "space", scene: "🌕🧑‍🚀🪨", text: "On the Moon, Pip floated with every step. There was no air and no wind, and the rocks were grey and dusty." },
      { scene: "⛽😬🚀", text: "When it was time to go home, the fuel light blinked red. 'Oh no!' said Pip. 'How can I fix this?'" },
      { scene: "☀️🔋🚀", text: "Pip remembered his solar panels. He spread them in the sunlight and they charged the rocket. Home we go!" },
    ],
    questions: [
      {
        question: "Why did Pip float on the Moon?",
        options: ["The Moon pulls things less than Earth does", "He wore balloons", "The rocket pushed him", "He was asleep"],
        answer: "The Moon pulls things less than Earth does",
        why: "The Moon's gravity is weaker than Earth's, so things weigh less and people can bounce and float.",
      },
      {
        question: "How did Pip solve the fuel problem?",
        options: ["He used sunlight and solar panels", "He asked a bird", "He pushed the rocket", "He waited for rain"],
        answer: "He used sunlight and solar panels",
        why: "Solar panels turn sunlight into energy. Pip used what he had to solve a problem.",
      },
      {
        question: "What did Pip say at the very start of the countdown?",
        options: ["Ten", "One", "Five", "Zero"],
        answer: "Ten",
        why: "A countdown goes backwards: 10, 9, 8 ... 1. It starts with the biggest number.",
      },
    ],
  },
  {
    id: "the-tortoise-and-the-thunder",
    title: "The Tortoise and the Thunder",
    emoji: "🐢",
    cover: "from-amber-400 to-teal-600",
    level: "Bigger",
    theme: "Weather & friendship",
    backdrop: "forest",
    pages: [
      { scene: "🐢🌳☀️", text: "Tilly the tortoise walked slowly along the forest path. She was never in a hurry." },
      { backdrop: "storm", scene: "🌥️🌩️🐿️", text: "Suddenly the sky turned dark. FLASH! A bright light lit up the trees. A moment later, BOOM! thunder rolled." },
      { backdrop: "storm", scene: "🐿️😱🌳", text: "Sam the squirrel shook with fear. 'The sky is angry!' he cried. 'It is shouting at us!'" },
      { scene: "🐢💬⚡", text: "'It is only a storm,' said Tilly gently. 'Lightning is very hot and bright, and the air makes a loud boom around it. We see light first because light travels faster than sound.'" },
      { scene: "🐢🐿️🐚", text: "Tilly invited Sam to hide in her shell until the rain passed. 'Let's count between the flash and the boom,' she said." },
      { backdrop: "rain", scene: "🌈🐢🐿️", text: "The storm moved away. A rainbow arched over the trees. 'I'm not scared any more,' said Sam. 'Knowing why helps!'" },
    ],
    questions: [
      {
        question: "Why do we see lightning before we hear thunder?",
        options: ["Light travels faster than sound", "Thunder is shy", "Lightning is closer than the clouds", "Our ears are slow"],
        answer: "Light travels faster than sound",
        why: "Both happen at the same moment, but light reaches us almost instantly while sound takes longer.",
      },
      {
        question: "How did Tilly help Sam?",
        options: ["She explained the storm and shared her shell", "She ran away", "She laughed at him", "She told him to be quiet"],
        answer: "She explained the storm and shared her shell",
        why: "Tilly stayed calm, gave a reason for the thunder, and offered shelter. Being kind and calm helps a scared friend.",
      },
      {
        question: "Why did Sam stop being scared?",
        options: ["He understood why storms happen", "The rain was warm", "He ate a nut", "He fell asleep"],
        answer: "He understood why storms happen",
        why: "Sam said, 'Knowing why helps!' Understanding the reason can make scary things feel smaller.",
      },
    ],
  },
  {
    id: "benny-bear-counts-the-berries",
    title: "Benny Bear Counts the Berries",
    emoji: "🐻",
    cover: "from-rose-400 to-purple-600",
    level: "Little",
    theme: "Counting & sharing",
    backdrop: "forest",
    pages: [
      { scene: "🐻🫐🌳", text: "Benny the bear found a bush full of blueberries. He counted them: one, two, three, four, five!" },
      { scene: "🐻🍓🌿", text: "Then he found some red strawberries. There were three of them. Benny's tummy rumbled." },
      { scene: "🐰😊🐻", text: "Rosie the rabbit hopped over. 'Hello, Benny! May I please have some berries?' she asked politely." },
      { scene: "🐻🤔🫐", text: "Benny had five blueberries and three strawberries. 'Five and three make eight,' he said. 'Let us share them.'" },
      { scene: "🐻🐰🍓", text: "Benny gave four berries to Rosie and kept four for himself. Four and four make eight, so it was fair." },
      { scene: "🐻🐰💞", text: "They ate their berries side by side. 'Thank you, Benny,' said Rosie. Sharing made the berries taste even sweeter." },
    ],
    questions: [
      {
        question: "How many blueberries did Benny find at the start?",
        options: ["Five", "Three", "Eight", "Four"],
        answer: "Five",
        why: "Page 1 says Benny counted one, two, three, four, five. The last number you count tells you how many there are.",
      },
      {
        question: "How many berries did Benny have altogether?",
        options: ["Eight", "Five", "Three", "Ten"],
        answer: "Eight",
        why: "Five blueberries and three strawberries make eight. Putting groups together is called adding.",
      },
      {
        question: "Why was the sharing fair?",
        options: ["Each friend got four berries", "Benny kept all of them", "Rosie got more", "Nobody got any"],
        answer: "Each friend got four berries",
        why: "Four and four are equal, so both friends had the same amount. Fair sharing means everyone gets the same.",
      },
    ],
  },
  {
    id: "ollie-octopus-and-the-sandcastle",
    title: "Ollie Octopus and the Sandcastle",
    emoji: "🐙",
    cover: "from-teal-400 to-sky-600",
    level: "Little",
    theme: "Teamwork",
    backdrop: "island",
    pages: [
      { scene: "🐙🏖️🏰", text: "Ollie the octopus wanted to build the biggest sandcastle ever. He scooped up sand with all eight arms." },
      { scene: "🐙😟🌊", text: "But a wave came along and washed half of the castle away. 'Oh dear,' sighed Ollie." },
      { scene: "🦀🙂🐙", text: "Cleo the crab scuttled over. 'Would you like some help, Ollie?' she asked kindly. 'Yes, please!' said Ollie." },
      { scene: "🐢🐙🦀", text: "Then Tom the turtle joined in. He carried wet sand on his back. Cleo patted it into tall towers." },
      { scene: "🏰🐙🐚", text: "Ollie decorated the castle with shiny shells. Together they built it higher and stronger than before." },
      { backdrop: "sunset", scene: "🏰🐙🦀", text: "The sun went down on their castle. 'We did it together,' said Ollie. 'Thank you, my friends!'" },
    ],
    questions: [
      {
        question: "What happened to the first sandcastle?",
        options: ["A wave washed half of it away", "It melted", "A bird sat on it", "Ollie knocked it down"],
        answer: "A wave washed half of it away",
        why: "Page 2 says a wave came along and washed half the castle away. Finding the event in the story helps us answer.",
      },
      {
        question: "How did Tom the turtle help?",
        options: ["He carried wet sand on his back", "He swam away", "He drew a picture", "He sang a song"],
        answer: "He carried wet sand on his back",
        why: "The story tells us Tom carried wet sand. Each friend helped in a different way.",
      },
      {
        question: "What is the lesson of this story?",
        options: ["Friends can do more together", "Sandcastles are easy", "Never ask for help", "Waves are friendly"],
        answer: "Friends can do more together",
        why: "Ollie could not rebuild alone, but with Cleo and Tom the castle grew higher. Working together can make big jobs easier.",
      },
    ],
  },
  {
    id: "pearl-the-raindrop",
    title: "Pearl the Raindrop's Big Trip",
    emoji: "💧",
    cover: "from-blue-400 to-indigo-600",
    level: "Bigger",
    theme: "Water cycle & science",
    backdrop: "sea",
    pages: [
      { scene: "💧🌊☀️", text: "Pearl was a tiny drop of water in the big blue sea. One sunny morning, the warm sun made her feel light." },
      { backdrop: "meadow", scene: "☁️💧✨", text: "Pearl rose up into the air as an invisible vapour. This is called evaporation. Higher and higher she floated." },
      { backdrop: "rain", scene: "☁️🌬️💧", text: "High up, the air was cold. Pearl and her friends huddled together and turned back into tiny drops. They made a fluffy cloud. This is called condensation." },
      { backdrop: "storm", scene: "🌧️💧😄", text: "The cloud grew heavy. Plip, plop, splash! Pearl fell down as rain. This is called precipitation." },
      { backdrop: "forest", scene: "🌱💧🌳", text: "Pearl soaked into the soil and a thirsty plant drank her up. Then she trickled into a stream." },
      { backdrop: "sea", scene: "💧🌊🌈", text: "The stream carried Pearl back to the sea, ready to begin again. 'What a trip!' she giggled. The water cycle never stops." },
    ],
    questions: [
      {
        question: "What made Pearl rise into the air?",
        options: ["The warm sun", "A strong wind", "A big fish", "A boat"],
        answer: "The warm sun",
        why: "The sun's heat turns water into vapour that floats up. This is called evaporation.",
      },
      {
        question: "Why did Pearl turn back into drops high in the sky?",
        options: ["The air up high is cold", "She was tired", "She wanted to sing", "The cloud was empty"],
        answer: "The air up high is cold",
        why: "Cold air changes vapour back into tiny drops of water. This is called condensation, and it makes clouds.",
      },
      {
        question: "Where did Pearl end up at the end of her trip?",
        options: ["Back in the sea", "On the Moon", "In a desert", "Inside a rock"],
        answer: "Back in the sea",
        why: "Streams flow into rivers and rivers flow into the sea. Water travels around and around in a cycle.",
      },
    ],
  },

];

export function storyById(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}

/** Splits a page into sentences so the reader can highlight them one by one. */
export function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+['"”’]*|[^.!?]+$/g);
  return (parts ?? [text]).map((s) => s.trim()).filter(Boolean);
}
