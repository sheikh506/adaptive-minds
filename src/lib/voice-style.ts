/**
 * The friendly voice. Pure data and helpers (no browser APIs) so they can be tested:
 * warm, polite phrases and a scorer that picks the gentlest English voice a device has.
 */

export type Rng = () => number;

export const GREETINGS = [
  "Hello, my friend! It is lovely to see you.",
  "Hi there, friend! I am so happy you are here.",
  "Welcome, my friend! Shall we begin together?",
];

export const CHEERS = [
  "Well done, my friend!",
  "Wonderful! Thank you for trying so hard.",
  "That was lovely. Great job!",
  "Hooray! You did that beautifully.",
  "Super! I am so proud of you.",
];

export const GENTLE_RETRIES = [
  "Nice try! Shall we look again together?",
  "That is okay. Please try once more. You can do it!",
  "Good thinking. Let us give it another go.",
  "No worries at all. Mistakes help us learn.",
];

export const THANKS = [
  "Thank you for playing with me.",
  "Thank you for being such a kind friend.",
  "It was a pleasure to play with you.",
];

export function pick<T>(items: readonly T[], rng: Rng = Math.random): T {
  return items[Math.floor(rng() * items.length)];
}

/** Voices whose names suggest a soft, natural, friendly sound. */
const FRIENDLY = /(female|samantha|karen|moira|tessa|serena|zira|aria|jenny|libby|sonia|natasha|hazel|susan|google uk english female|google us english)/i;
const NATURAL = /(natural|neural|online|enhanced|premium)/i;
const HARSH = /(\bmale\b|david|mark|daniel|fred|alex|george|espeak|junior|albert|bad news|zarvox|whisper)/i;

/**
 * Scores a speech voice for a friendly, polite read-aloud. Higher is better; negative means "do not use"
 * (not English).
 */
export function scoreVoice(name: string, lang: string): number {
  if (!/^en/i.test(lang)) return -1;
  let score = 1;
  if (/en[-_](GB|AU|US|IE|NZ|ZA|IN)/i.test(lang)) score += 1;
  if (NATURAL.test(name)) score += 2;
  if (FRIENDLY.test(name)) score += 3;
  if (HARSH.test(name)) score -= 4;
  return score;
}

export function bestVoice<T extends { name: string; lang: string }>(voices: readonly T[]): T | undefined {
  let best: T | undefined;
  let bestScore = 0;
  for (const v of voices) {
    const s = scoreVoice(v.name, v.lang);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return best ?? voices.find((v) => /^en/i.test(v.lang));
}
