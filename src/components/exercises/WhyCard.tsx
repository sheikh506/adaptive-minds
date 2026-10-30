"use client";

import { Lightbulb, Volume2 } from "lucide-react";
import { lessonFor } from "@/lib/lessons";
import { cn } from "@/lib/utils";
import { solutionSteps } from "@/lib/hints";
import StepByStep from "@/components/exercises/StepByStep";

/** A stable pick so the same question always shows the same tip (no flicker on re-render). */
export function pickTip(steps: string[], key: string): string {
  if (steps.length === 0) return "";
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return steps[h % steps.length];
}

/**
 * "Why is that the answer?" card shown after every question.
 * It explains this question, repeats one big idea from the skill's lesson, and, after a miss,
 * gives a strategy to try next time. Every part can be read aloud.
 */
export default function WhyCard({
  correct,
  explanation,
  correctAnswer,
  topicId,
  exerciseId,
  onSpeak,
}: {
  correct: boolean;
  explanation?: string;
  correctAnswer: string;
  topicId?: string;
  exerciseId: string;
  onSpeak?: (text: string) => void;
}) {
  const lesson = topicId ? lessonFor(topicId) : null;
  const tip = lesson ? pickTip(lesson.steps, exerciseId) : "";
  const why = explanation?.trim() || `The answer is ${correctAnswer}.`;
  const steps = solutionSteps(why);
  const spoken = [why, tip && `Remember: ${tip}`, !correct && lesson ? `Next time: ${lesson.nudge}` : ""].filter(Boolean).join(" ");

  return (
    <div
      className={cn(
        "mt-2 rounded-2xl border-2 p-3 text-left",
        correct ? "border-green-200 bg-white text-green-950" : "border-amber-200 bg-white text-amber-950"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-display text-sm font-bold">
          <Lightbulb className={cn("h-4 w-4", correct ? "text-green-600" : "text-amber-500")} aria-hidden="true" />
          Show me how
        </p>
        {onSpeak && (
          <button
            type="button"
            onClick={() => onSpeak(spoken)}
            aria-label="Read the explanation aloud"
            className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100"
          >
            <Volume2 className="h-3.5 w-3.5" /> Listen
          </button>
        )}
      </div>
      <StepByStep steps={steps} tone={correct ? "green" : "amber"} className="mt-2" />
      {tip && (
        <p className="mt-2 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-900">
          <span className="font-extrabold">🧩 Remember: </span>
          {tip}
        </p>
      )}
      {!correct && lesson && (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span className="font-extrabold">💪 Next time: </span>
          {lesson.nudge}
        </p>
      )}
    </div>
  );
}
