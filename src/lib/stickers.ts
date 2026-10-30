/**
 * Sticker album. Stickers are earned by finishing stories, making art and music, and playing games.
 * They are stored on this device only (no account data, nothing sent anywhere), and there is no
 * ranking or comparing with other children. Pure catalogue + tiny storage helpers.
 */

export type StickerGroup = "story" | "art" | "music" | "game" | "puzzle" | "quest";

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  how: string;
  group: StickerGroup;
}

export const STICKERS: Sticker[] = [
  // Stories
  { id: "story:luna-and-the-lost-star", emoji: "🌟", name: "Star Friend", how: "Finish “Luna and the Lost Star”", group: "story" },
  { id: "story:milo-the-messy-painter", emoji: "🐒", name: "Messy Painter", how: "Finish “Milo the Messy Painter”", group: "story" },
  { id: "story:the-brave-little-boat", emoji: "⛵", name: "Brave Sailor", how: "Finish “The Brave Little Boat”", group: "story" },
  { id: "story:zara-and-the-seed", emoji: "🌻", name: "Green Thumb", how: "Finish “Zara and the Tiny Seed”", group: "story" },
  { id: "story:captain-pip-and-the-moon-rocket", emoji: "🚀", name: "Moon Pilot", how: "Finish “Captain Pip and the Moon Rocket”", group: "story" },
  { id: "story:the-tortoise-and-the-thunder", emoji: "🐢", name: "Storm Buddy", how: "Finish “The Tortoise and the Thunder”", group: "story" },
  { id: "story:benny-bear-counts-the-berries", emoji: "🐻", name: "Berry Counter", how: "Finish “Benny Bear Counts the Berries”", group: "story" },
  { id: "story:ollie-octopus-and-the-sandcastle", emoji: "🏰", name: "Castle Builder", how: "Finish “Ollie Octopus and the Sandcastle”", group: "story" },
  { id: "story:pearl-the-raindrop", emoji: "💧", name: "Water Explorer", how: "Finish “Pearl the Raindrop's Big Trip”", group: "story" },
  { id: "story:all-correct", emoji: "🧠", name: "Story Detective", how: "Answer all three story questions right", group: "story" },
  // Art
  { id: "art:first-drawing", emoji: "🖍️", name: "First Masterpiece", how: "Save your first drawing", group: "art" },
  { id: "art:colour-page", emoji: "🌈", name: "Colour Splash", how: "Colour a picture page", group: "art" },
  { id: "art:craft", emoji: "✂️", name: "Crafty Kid", how: "Finish a craft project", group: "art" },
  // Music
  { id: "music:first-notes", emoji: "🎵", name: "First Notes", how: "Play the xylophone", group: "music" },
  { id: "music:song", emoji: "🎶", name: "Song Player", how: "Play a whole song along", group: "music" },
  { id: "music:composer", emoji: "🎼", name: "Little Composer", how: "Record and play back your own tune", group: "music" },
  // Games
  { id: "game:memory", emoji: "🧩", name: "Memory Match", how: "Win a memory game", group: "game" },
  { id: "game:animal-sounds", emoji: "🐾", name: "Animal Expert", how: "Finish the animal sounds game", group: "game" },
  { id: "game:bubbles", emoji: "🫧", name: "Bubble Popper", how: "Pop 20 bubbles", group: "game" },
  { id: "game:breathe", emoji: "🧘", name: "Calm Cloud", how: "Finish a breathing break", group: "game" },
  // Puzzles
  { id: "puzzle:match", emoji: "🔗", name: "Match Maker", how: "Finish 3 Match-Up puzzles", group: "puzzle" },
  { id: "puzzle:spot", emoji: "🔍", name: "Eagle Eye", how: "Finish 3 Spot the Difference puzzles", group: "puzzle" },
  { id: "puzzle:blocks", emoji: "🧱", name: "Block Builder", how: "Finish 3 Block Builder puzzles", group: "puzzle" },
  { id: "puzzle:slide", emoji: "🧩", name: "Slide Master", how: "Finish 3 Slide puzzles", group: "puzzle" },
  { id: "puzzle:count", emoji: "🔢", name: "Counting Star", how: "Finish 3 Count & Pick puzzles", group: "puzzle" },
  { id: "puzzle:bubbles", emoji: "🫧", name: "Number Popper", how: "Finish 3 Number Bubbles puzzles", group: "puzzle" },
  { id: "puzzle:pattern", emoji: "🎯", name: "Pattern Pro", how: "Finish 3 What Comes Next puzzles", group: "puzzle" },
  { id: "puzzle:odd", emoji: "🤔", name: "Odd Spotter", how: "Finish 3 Odd One Out puzzles", group: "puzzle" },
  { id: "puzzle:all", emoji: "🏆", name: "Puzzle Champion", how: "Earn all the other puzzle stickers", group: "puzzle" },
  // Learning quests
  { id: "quest:first", emoji: "🏅", name: "Quest Starter", how: "Finish a learning quest", group: "quest" },
  { id: "quest:five", emoji: "🥈", name: "Quest Hero", how: "Finish 5 quests", group: "quest" },
  { id: "quest:twenty", emoji: "🥇", name: "Quest Champion", how: "Finish 20 quests", group: "quest" },
];

const KEY = "am-stickers";
const COUNT_KEY = "am-quests-done";
const EVT = "am-stickers-change";

export const stickerById = (id: string) => STICKERS.find((s) => s.id === id);

export function readEarned(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string" && !!stickerById(x)) : [];
  } catch {
    return [];
  }
}

/** Gives a sticker once. Returns the sticker when it is NEW, otherwise null. */
export function awardSticker(id: string): Sticker | null {
  const s = stickerById(id);
  if (!s || typeof window === "undefined") return null;
  const have = readEarned();
  if (have.includes(id)) return null;
  localStorage.setItem(KEY, JSON.stringify([...have, id]));
  window.dispatchEvent(new CustomEvent(EVT, { detail: s }));
  return s;
}

/** Called when a learning quest is finished: counts it and gives milestone stickers. */
export function recordQuestDone(): Sticker[] {
  if (typeof window === "undefined") return [];
  const n = Number(localStorage.getItem(COUNT_KEY) ?? "0") + 1;
  localStorage.setItem(COUNT_KEY, String(n));
  return [n >= 1 && awardSticker("quest:first"), n >= 5 && awardSticker("quest:five"), n >= 20 && awardSticker("quest:twenty")].filter(
    (x): x is Sticker => !!x
  );
}

export const STICKER_EVENT = EVT;

export const PUZZLE_IDS = ["match", "spot", "blocks", "slide", "count", "bubbles", "pattern", "odd"] as const;
export type PuzzleId = (typeof PUZZLE_IDS)[number];
export const PUZZLE_WINS_NEEDED = 3;
const PUZZLE_KEY = "am-puzzle-wins";

/** Counts a finished puzzle. After a few of each kind a sticker is given; all eight kinds earn the champion sticker. */
export function recordPuzzleWin(id: PuzzleId): Sticker[] {
  if (typeof window === "undefined") return [];
  let wins: Record<string, number> = {};
  try {
    const raw = JSON.parse(localStorage.getItem(PUZZLE_KEY) ?? "{}");
    if (raw && typeof raw === "object") wins = raw;
  } catch {
    wins = {};
  }
  const n = (Number(wins[id]) || 0) + 1;
  wins[id] = n;
  try {
    localStorage.setItem(PUZZLE_KEY, JSON.stringify(wins));
  } catch {
    /* storage full or blocked: carry on */
  }
  const earned: (Sticker | null)[] = [n >= PUZZLE_WINS_NEEDED ? awardSticker(`puzzle:${id}`) : null];
  const have = readEarned();
  if (PUZZLE_IDS.every((p) => have.includes(`puzzle:${p}`))) earned.push(awardSticker("puzzle:all"));
  return earned.filter((s): s is Sticker => !!s);
}
