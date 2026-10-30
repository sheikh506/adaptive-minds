import { describe, expect, it } from "vitest";
import { buildExercises } from "./content";
import { WORLDS } from "../src/lib/game";
import { LESSONS, lessonFor } from "../src/lib/lessons";
import { TOPIC_PREREQUISITES } from "../src/lib/spaced-repetition";
import type { Visual } from "../src/lib/question-types";

type Q = { question: string; options: string[]; answer: string; visual?: Visual };
const dataOf = (e: { data: unknown }) => e.data as Q;

const NEW_TOPICS = [
  "topic-counting",
  "topic-geometry",
  "topic-measurement",
  "topic-time",
  "topic-money",
  "topic-data",
  "topic-letters",
  "topic-spelling",
  "topic-grammar",
  "topic-life-science",
  "topic-earth-space",
  "topic-matter-energy",
];

describe("phase 3 question bank", () => {
  const all = buildExercises();

  it.each(NEW_TOPICS)("%s has at least 10 questions at every level 1-10", (topicId) => {
    for (let level = 1; level <= 10; level++) {
      const n = all.filter((e) => e.topicId === topicId && e.level === level).length;
      expect(n, `${topicId} level ${level}`).toBeGreaterThanOrEqual(10);
    }
  });

  it("question text is never empty and options are non-empty strings", () => {
    for (const e of all.filter((x) => NEW_TOPICS.includes(x.topicId))) {
      const d = dataOf(e);
      expect(d.question.trim().length, e.id).toBeGreaterThan(5);
      for (const o of d.options) expect(o.trim().length, e.id).toBeGreaterThan(0);
    }
  });

  it("clock questions use a valid time and never print the time in the question text", () => {
    const clocks = all.filter((e) => dataOf(e).visual?.type === "clock");
    expect(clocks.length).toBeGreaterThan(0);
    for (const e of clocks) {
      const v = dataOf(e).visual as Extract<Visual, { type: "clock" }>;
      expect(v.hour, e.id).toBeGreaterThanOrEqual(1);
      expect(v.hour, e.id).toBeLessThanOrEqual(12);
      expect(v.minute, e.id).toBeGreaterThanOrEqual(0);
      expect(v.minute, e.id).toBeLessThanOrEqual(59);
      expect(dataOf(e).question, e.id).not.toContain(dataOf(e).answer);
    }
  });

  it("is deterministic, so re-seeding changes nothing", () => {
    expect(JSON.stringify(buildExercises())).toBe(JSON.stringify(all));
  });
});

describe("lessons", () => {
  const topicIds = new Set(buildExercises().map((e) => e.topicId));

  it("every topic with questions has a lesson", () => {
    for (const id of topicIds) expect(lessonFor(id), id).not.toBeNull();
  });

  it("every lesson is complete and its worked example is solved", () => {
    for (const [id, l] of Object.entries(LESSONS)) {
      expect(l.title.length, id).toBeGreaterThan(3);
      expect(l.steps.length, id).toBeGreaterThanOrEqual(2);
      expect(l.nudge.length, id).toBeGreaterThan(10);
      expect(l.example.question.length, id).toBeGreaterThan(5);
      expect(l.example.steps.length, id).toBeGreaterThanOrEqual(1);
      expect(l.example.answer.trim().length, id).toBeGreaterThan(0);
    }
  });

  it("a worked example never repeats a quiz question verbatim", () => {
    const questions = new Set(buildExercises().map((e) => dataOf(e).question));
    for (const [id, l] of Object.entries(LESSONS)) expect(questions.has(l.example.question), id).toBe(false);
  });

  it("returns null for an unknown topic", () => {
    expect(lessonFor("topic-nope")).toBeNull();
  });
});

describe("curriculum wiring", () => {
  it("every prerequisite points at a real topic", () => {
    const ids = new Set(Object.keys(LESSONS));
    for (const [topic, reqs] of Object.entries(TOPIC_PREREQUISITES)) {
      expect(ids.has(topic), topic).toBe(true);
      for (const r of reqs) expect(ids.has(r), `${topic} needs ${r}`).toBe(true);
    }
  });

  it("the prerequisite graph has no cycles", () => {
    const visiting = new Set<string>();
    const done = new Set<string>();
    const visit = (id: string) => {
      expect(visiting.has(id), `cycle at ${id}`).toBe(false);
      if (done.has(id)) return;
      visiting.add(id);
      for (const r of TOPIC_PREREQUISITES[id] ?? []) visit(r);
      visiting.delete(id);
      done.add(id);
    };
    Object.keys(TOPIC_PREREQUISITES).forEach(visit);
  });

  it("every new topic has a themed world", () => {
    const names = ["Counting", "Geometry", "Measurement", "Time", "Money", "Data", "Letters", "Spelling", "Grammar", "Life Science", "Earth & Space", "Matter & Energy"];
    for (const n of names) expect(WORLDS[n], n).toBeDefined();
  });
});
