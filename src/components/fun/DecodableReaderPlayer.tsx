"use client";

/**
 * DecodableReaderPlayer
 *
 * A minimal, calm reading player for decodable books.
 * - One page at a time, large readable text
 * - Tap any word to hear it (Web Speech API)
 * - Comprehension activities after reading (sequencing, retelling, prediction, vocab, Q&A)
 * - No timers, no scores, no speed pressure
 * - Accessible: large touch targets, high contrast, screen-reader friendly
 */

import { useState } from "react";
import { CheckCircle, Volume2, ArrowLeft, ArrowRight, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DecodableReader, ComprehensionActivity } from "@/lib/decodable-readers";
import { say, speechSupported } from "@/components/fun/voice";

// ─── Comprehension activity renderer ─────────────────────────────────────────

function RetellActivity({ activity }: { activity: ComprehensionActivity }) {
  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-2">🗣️ Retell</p>
      <p className="text-base font-semibold text-gray-900">{activity.prompt}</p>
      <p className="mt-3 text-sm text-amber-800">
        Talk it through with a grown-up. There is no wrong answer — just tell the story in your own words!
      </p>
    </div>
  );
}

function SequenceActivity({ activity }: { activity: ComprehensionActivity }) {
  const [order, setOrder] = useState<string[]>(activity.events ? [...activity.events].sort(() => Math.random() - 0.5) : []);
  const [checked, setChecked] = useState(false);
  const correct = JSON.stringify(order) === JSON.stringify(activity.events);

  const move = (i: number, dir: -1 | 1) => {
    if (checked) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  return (
    <div className="rounded-2xl bg-purple-50 border border-purple-200 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-purple-700 mb-2">🔢 Put in order</p>
      <p className="text-sm font-semibold text-gray-700 mb-3">{activity.prompt}</p>
      <ol className="space-y-2">
        {order.map((event, i) => (
          <li key={event} className="flex items-center gap-2">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-200 text-xs font-extrabold text-purple-800">
              {i + 1}
            </span>
            <span className={cn(
              "flex-1 rounded-xl px-3 py-2 text-sm font-semibold",
              checked
                ? activity.events![i] === event ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
                : "bg-white border border-purple-200"
            )}>
              {event}
            </span>
            {!checked && (
              <div className="flex flex-col gap-0.5">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded bg-purple-100 px-1 text-[10px] font-bold text-purple-700 hover:bg-purple-200 disabled:opacity-30" aria-label="Move up">▲</button>
                <button onClick={() => move(i, 1)} disabled={i === order.length - 1} className="rounded bg-purple-100 px-1 text-[10px] font-bold text-purple-700 hover:bg-purple-200 disabled:opacity-30" aria-label="Move down">▼</button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {!checked && (
        <button onClick={() => setChecked(true)} className="mt-3 rounded-2xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700">
          Check my order
        </button>
      )}
      {checked && (
        <p className={cn("mt-3 rounded-xl px-3 py-2 text-sm font-bold", correct ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>
          {correct ? "✅ Perfect order!" : "📖 Look back at the story to check the order."}
        </p>
      )}
    </div>
  );
}

function PredictActivity({ activity }: { activity: ComprehensionActivity }) {
  return (
    <div className="rounded-2xl bg-sky-50 border border-sky-200 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-sky-700 mb-2">🔮 Predict</p>
      <p className="text-base font-semibold text-gray-900">{activity.prompt}</p>
      <p className="mt-3 text-sm text-sky-800">
        There is no right or wrong answer yet — make your best guess, then keep reading to find out!
      </p>
    </div>
  );
}

function VocabActivity({ activity }: { activity: ComprehensionActivity }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-2xl bg-teal-50 border border-teal-200 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-teal-700 mb-2">📝 New word</p>
      <p className="text-2xl font-extrabold text-teal-900 mb-2">{activity.word}</p>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">
          What does it mean?
        </button>
      ) : (
        <p className="text-sm font-semibold text-gray-800 bg-white rounded-xl p-3 border border-teal-200">{activity.definition}</p>
      )}
    </div>
  );
}

function QuestionActivity({ activity }: { activity: ComprehensionActivity }) {
  const [selected, setSelected] = useState<string | null>(null);
  const correct = selected === activity.answer;
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">💬 Think about it</p>
      <p className="text-base font-semibold text-gray-900 mb-3">{activity.prompt}</p>
      <div className="grid gap-2">
        {activity.options?.map((opt) => {
          let state = "";
          if (selected) {
            if (opt === activity.answer) state = "correct";
            else if (opt === selected) state = "incorrect";
          }
          return (
            <button
              key={opt}
              onClick={() => { if (!selected) setSelected(opt); }}
              disabled={!!selected}
              className={cn(
                "flex w-full items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all",
                state === "correct" ? "border-green-400 bg-green-50 text-green-900" :
                state === "incorrect" ? "border-red-400 bg-red-50 text-red-900" :
                "border-gray-200 bg-gray-50 text-gray-900 hover:border-brand-400 hover:bg-brand-50"
              )}
              aria-pressed={opt === selected}
            >
              {state === "correct" && <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />}
              {state === "incorrect" && <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />}
              {opt}
            </button>
          );
        })}
      </div>
      {selected && correct && (
        <p className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
          ✅ {activity.why}
        </p>
      )}
      {selected && !correct && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          Look back at the story and try again. {activity.why}
        </p>
      )}
    </div>
  );
}

function ComprehensionPanel({ activities }: { activities: ComprehensionActivity[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold text-gray-900">Think about the story</h2>
      {activities.map((a, i) => (
        <div key={i}>
          {a.type === "retell" && <RetellActivity activity={a} />}
          {a.type === "sequence" && <SequenceActivity activity={a} />}
          {a.type === "predict" && <PredictActivity activity={a} />}
          {a.type === "vocab" && <VocabActivity activity={a} />}
          {a.type === "question" && <QuestionActivity activity={a} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main player ──────────────────────────────────────────────────────────────

export default function DecodableReaderPlayer({ reader }: { reader: DecodableReader }) {
  const [page, setPage] = useState(0);
  const [phase, setPhase] = useState<"read" | "comprehension">("read");
  const canSpeak = typeof window !== "undefined" && speechSupported();

  const current = reader.pages[page];
  const isLast = page === reader.pages.length - 1;
  const isFirst = page === 0;

  // Tap a word to hear it
  const speakWord = (word: string) => {
    if (canSpeak) say(word.replace(/[^a-zA-Z]/g, ""));
  };

  if (phase === "comprehension") {
    return (
      <div className="space-y-6">
        <ComprehensionPanel activities={reader.comprehension} />
        <button
          onClick={() => { setPage(0); setPhase("read"); }}
          className="flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Read again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page display */}
      <div className="rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-sm min-h-48 flex flex-col items-center justify-center gap-4">
        <div className="text-6xl text-center" aria-hidden="true">{current.scene}</div>
        <p className="text-center text-2xl font-extrabold leading-relaxed text-gray-900 max-w-sm">
          {current.text.split(/\s+/).map((word, i) => (
            <span key={i}>
              <button
                type="button"
                onClick={() => speakWord(word)}
                className="rounded hover:bg-brand-50 hover:text-brand-700 px-0.5 transition-colors"
                aria-label={`Tap to hear: ${word}`}
                title="Tap to hear"
              >
                {word}
              </button>
              {" "}
            </span>
          ))}
        </p>
        {canSpeak && (
          <button
            type="button"
            onClick={() => say(current.text)}
            className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100"
            aria-label="Read this page aloud"
          >
            <Volume2 className="h-4 w-4" /> Read to me
          </button>
        )}
      </div>

      {/* Page counter */}
      <p className="text-center text-xs font-bold text-gray-400">
        Page {page + 1} of {reader.pages.length}
      </p>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={isFirst}
          className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {!isLast ? (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-brand-700"
            aria-label="Next page"
          >
            Next page <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setPhase("comprehension")}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-green-700"
            aria-label="Finished reading — go to comprehension"
          >
            I finished! Think about it → 
          </button>
        )}
      </div>
    </div>
  );
}
