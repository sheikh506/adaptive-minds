/**
 * Topic-to-Skill Bridge — P1-ENG3
 *
 * Maps existing topic IDs (used in Exercise.topicId) to fine-grained skill IDs
 * (used in LearningSkill.id). A topic may contain exercises that practice
 * multiple skills; this mapping indicates the PRIMARY skill exercised by
 * questions in a given topic.
 *
 * Why a static map here?
 *   - Topics are seeded by prisma/seed.ts with stable string IDs.
 *   - Skills are seeded by scripts/seed-skills.mjs with stable string IDs.
 *   - This bridge avoids a DB join on every answer submission.
 *   - If a topic's primary skill changes, update this map and re-seed.
 *
 * Unmapped topics (e.g. art, games) return undefined — no skill state is updated.
 */

export const TOPIC_SKILL_MAP: Record<string, string> = {
  // ── READING topics ──────────────────────────────────────────────────────
  "topic-phonics":         "ph-cvc-blending",
  "topic-vocabulary":      "vocab-opposites",
  "topic-comprehension":   "vocab-context-clues",
  "topic-letters":         "ph-letter-names",
  "topic-spelling":        "ph-cvc-segmenting",
  "topic-grammar":         "vocab-synonyms",

  // ── MATH topics ─────────────────────────────────────────────────────────
  "topic-counting":        "math-counting-0-10",
  "topic-addition":        "math-addition-to-10",
  "topic-subtraction":     "math-subtraction-within-10",
  "topic-multiplication":  "math-addition-two-digit",
  "topic-fractions":       "math-place-value-tens",
  "topic-geometry":        "math-shapes-2d",
  "topic-measurement":     "math-measurement-length",
  "topic-time":            "math-time-oclock",
  "topic-money":           "math-compare-numbers",
  "topic-data":            "math-counting-0-20",

  // ── SCIENCE topics ───────────────────────────────────────────────────────
  "topic-life-science":    "sci-living-nonliving",
  "topic-earth-space":     "sci-weather-types",
  "topic-matter-energy":   "sci-states-matter",
};

/**
 * Returns the primary skill ID for a given topic, or undefined if the topic
 * is not mapped to any skill (e.g. art, games, placement).
 */
export function skillIdForTopic(topicId: string): string | undefined {
  return TOPIC_SKILL_MAP[topicId];
}
