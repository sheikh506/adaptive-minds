"use client";

import { ArrowRight, Volume2 } from "lucide-react";
import Character from "@/components/art/Character";
import type { Lesson, WorkedExample } from "@/lib/lessons";
import type { World } from "@/lib/game";

/** A solved example of a DIFFERENT problem. Used by the "Learn first" screen and by hint stage 2. */
export function WorkedExampleCard({ example, onSpeak }: { example: WorkedExample; onSpeak?: (text: string) => void }) {
  const spoken = `${example.question} ${example.steps.join(" ")} The answer is ${example.answer}.`;
  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 text-sky-950" role="note">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">Let&apos;s solve one together</p>
        {onSpeak && (
          <button
            type="button"
            onClick={() => onSpeak(spoken)}
            aria-label="Read this example aloud"
            className="rounded-full bg-sky-200/70 p-1 text-sky-900 hover:bg-sky-200"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="mt-1 font-bold">{example.question}</p>
      <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">
        {example.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <p className="mt-1.5 text-sm font-extrabold">So the answer is {example.answer}.</p>
    </div>
  );
}

/** The "Learn first" screen: a short lesson before the quest. Always skippable. */
export default function LessonScreen({
  lesson,
  world,
  onStart,
  onSpeak,
}: {
  lesson: Lesson;
  world: World;
  onStart: () => void;
  onSpeak: (text: string) => void;
}) {
  const spoken = `${lesson.title}. ${lesson.steps.join(" ")}`;
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 overflow-y-auto px-3 py-4">
      <div className="flex items-center gap-2">
        <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full ${world.soft}`} aria-hidden="true">
          <Character kind={world.guide} size={54} mood="happy" />
        </div>
        <div className="min-w-0 flex-1 rounded-2xl rounded-bl-sm border-2 border-border bg-white px-3 py-2 shadow-sm">
          <p className="text-[11px] font-bold leading-tight text-gray-500">{world.guideName}</p>
          <p className="text-sm font-semibold text-gray-900 sm:text-base">Let&apos;s learn a trick first. It only takes a minute!</p>
        </div>
      </div>

      <section className="rounded-3xl border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
            <span aria-hidden="true">{lesson.emoji}</span> {lesson.title}
          </h2>
          <button
            type="button"
            onClick={() => onSpeak(spoken)}
            aria-label="Read this lesson aloud"
            className="flex flex-shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100"
          >
            <Volume2 className="h-4 w-4" /> <span className="hidden sm:inline">Listen</span>
          </button>
        </div>
        <ol className="mt-3 space-y-2">
          {lesson.steps.map((s, i) => (
            <li key={s} className="flex items-start gap-3 text-base text-gray-800">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-extrabold text-brand-800">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <WorkedExampleCard example={lesson.example} onSpeak={onSpeak} />
        </div>
      </section>

      <button
        type="button"
        onClick={onStart}
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 text-lg font-extrabold text-white hover:bg-brand-700"
      >
        I&apos;m ready, start my quest <ArrowRight className="h-5 w-5" />
      </button>
    </main>
  );
}
