"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Volume2,
  XCircle,
  Mic,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Character from "@/components/art/Character";
import VisualHelper from "@/components/exercises/VisualHelper";
import { cn } from "@/lib/utils";
import LessonScreen, { WorkedExampleCard } from "@/components/exercises/LessonCard";
import WhyCard from "@/components/exercises/WhyCard";
import MusicToggle from "@/components/fun/MusicToggle";
import SfxToggle from "@/components/fun/SfxToggle";
import { playSfx } from "@/components/fun/sfx";
import { makeUtterance } from "@/components/fun/voice";
import { recordQuestDone } from "@/lib/stickers";
import {
  fetchNextQuestion,
  getHint,
  markLessonSeen,
  submitExerciseAnswer,
  type HintStep,
  type SubmitResult,
} from "@/app/actions/exercises";
import { MAX_HINT_STAGE, questEndLine, type World } from "@/lib/game";
import type { Lesson } from "@/lib/lessons";
import type { DoneSummary, PlayState, PublicExercise, QuestionNote } from "@/lib/question-types";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

interface Props {
  initial: PlayState;
  topic: { id: string; name: string; icon: string | null };
  world: World;
  topicLevel: number;
  /** The skill's "Learn first" lesson, if it has one. */
  lesson?: Lesson | null;
  /** Show the lesson before the first question (the child has not seen it yet). */
  lessonFirst?: boolean;
  /** Ages 5–8: read questions aloud unless the child turned that off. */
  readAloudByDefault?: boolean;
}

/** A gentle stretch reminder after this many minutes of practice in one go. */
const BREAK_EVERY_SEC = 15 * 60;

/** Pre-reader voice narration helper using Web Speech API */
function usePreReaderSpeech(defaultOn = false) {
  const [autoRead, setAutoRead] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("am-auto-read");
    setAutoRead(saved === null ? defaultOn : saved === "1");
  }, [defaultOn]);

  const toggleAutoRead = () =>
    setAutoRead((v) => {
      localStorage.setItem("am-auto-read", v ? "0" : "1");
      return !v;
    });

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      if (!text.trim()) return;

      // The same polite, friendly voice as the story books (and the music dips while it talks)
      const utterance = makeUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { autoRead, toggleAutoRead, speak, stop, isSpeaking };
}

const mins = (sec: number) => Math.floor(sec / 60);

export default function ExercisePlayer({ initial, topic, world, topicLevel, lesson = null, lessonFirst = false, readAloudByDefault = false }: Props) {
  const [play, setPlay] = useState<PlayState>(initial);
  const [lessonOpen, setLessonOpen] = useState(lessonFirst && !!lesson);
  const [level, setLevel] = useState(topicLevel);
  const [time, setTime] = useState(
    initial.status === "question" ? { used: initial.usedSec, goal: initial.goalSec } : { used: 0, goal: 0 }
  );
  const [loadingNext, startNext] = useTransition();
  const [error, setError] = useState("");
  const [onBreak, setOnBreak] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const speech = usePreReaderSpeech(readAloudByDefault);

  function closeLesson() {
    speech.stop();
    setLessonOpen(false);
    void markLessonSeen(topic.id).catch(() => undefined);
  }

  useEffect(() => {
    setSize({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  const celebrate = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setConfetti(true);
    setTimeout(() => setConfetti(false), 4500);
  }, []);

  function goNext() {
    speech.stop();
    setError("");
    startNext(async () => {
      try {
        const next = await fetchNextQuestion(topic.id);
        if (next.status === "question") {
          setLevel(next.level);
          setTime({ used: next.usedSec, goal: next.goalSec });
        }
        setPlay(next);
        if (next.status === "done") {
          celebrate();
          playSfx("win");
        }
      } catch {
        setError("Hmm, we couldn't load the next question. Please try again.");
      }
    });
  }

  function onResult(r: SubmitResult, usedBefore: number) {
    setTime({ used: r.usedSec, goal: r.goalSec });
    if (r.levelChange !== "same") setLevel((l) => Math.max(1, Math.min(10, l + (r.levelChange === "up" ? 1 : -1))));
    if (Math.floor(r.usedSec / BREAK_EVERY_SEC) > Math.floor(usedBefore / BREAK_EVERY_SEC) && !r.timeUp) setOnBreak(true);
    if (r.evolvedTo || r.newBadges.length > 0 || r.levelChange === "up") {
      celebrate();
      setTimeout(() => playSfx("levelup"), 700);
    }
  }

  const pct = time.goal > 0 ? Math.min(100, Math.round((time.used / time.goal) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {confetti && size.w > 0 && (
        <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
          <Confetti width={size.w} height={size.h} recycle={false} numberOfPieces={220} />
        </div>
      )}

      {/* Slim top bar */}
      <header className={cn("flex items-center gap-3 bg-gradient-to-r px-3 py-2 text-white sm:px-5", world.gradient)}>
        <Link href="/dashboard/play" className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-sm font-bold hover:bg-white/30" aria-label="Back to the map">
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Map</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold leading-tight">
            {topic.icon ?? "📘"} {world.name}
            <span className="ml-2 text-xs font-semibold text-white/80">Level {level}</span>
          </p>
          {time.goal > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-black/20"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-label={`Practice time today: ${mins(time.used)} of ${mins(time.goal)} minutes`}
              >
                <div className="h-full rounded-full bg-yellow-300 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="whitespace-nowrap text-[11px] font-bold text-white/90">
                {mins(time.used)}/{mins(time.goal)} min
              </span>
            </div>
          )}
        </div>

        {lesson && !lessonOpen && play.status === "question" && (
          <button
            type="button"
            onClick={() => setLessonOpen(true)}
            className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/30"
            title="Read the lesson again"
          >
            <span aria-hidden="true">📖</span>
            <span className="hidden md:inline">Lesson</span>
            <span className="sr-only">Read the lesson again</span>
          </button>
        )}

        <MusicToggle compact />
        <SfxToggle compact />

        {/* Pre-reader / Auto-read button */}
        <button
          type="button"
          onClick={speech.toggleAutoRead}
          aria-pressed={speech.autoRead}
          title={speech.autoRead ? "Pre-reader voice auto-read ON" : "Turn auto-read ON for pre-readers"}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold transition-all",
            speech.autoRead ? "bg-amber-300 text-amber-950 ring-2 ring-amber-400" : "bg-white/20 text-white hover:bg-white/30"
          )}
        >
          <Mic className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{speech.autoRead ? "Read to me: ON" : "Pre-reader"}</span>
        </button>
      </header>

      {play.status === "question" && lessonOpen && lesson && (
        <LessonScreen lesson={lesson} world={world} onStart={closeLesson} onSpeak={speech.speak} />
      )}

      {play.status === "question" && !onBreak && !lessonOpen && (
        <QuestionView
          key={play.exercise.id}
          exercise={play.exercise}
          note={play.note}
          world={world}
          usedAtStart={time.used}
          goalSec={time.goal}
          speech={speech}
          loadingNext={loadingNext}
          error={error}
          onResult={onResult}
          onNext={goNext}
        />
      )}

      {play.status === "question" && onBreak && (
        <main className="flex flex-1 items-center justify-center overflow-y-auto p-4">
          <div role="alert" className="w-full max-w-md rounded-3xl border-2 border-purple-200 bg-purple-50 p-6 text-center">
            <p className="text-5xl">🧘</p>
            <h2 className="mt-2 text-2xl font-extrabold text-purple-900">Great work! Time for a stretch</h2>
            <p className="mt-1 text-base text-purple-800">Stand up, take a sip of water and rest your eyes for a minute.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  setOnBreak(false);
                  goNext();
                }}
                className="rounded-2xl bg-purple-600 px-6 py-3 text-base font-bold text-white hover:bg-purple-700"
              >
                I&apos;m ready to keep going
              </button>
              <Link href="/dashboard" className="rounded-2xl border-2 border-purple-200 bg-white px-6 py-3 text-base font-bold text-purple-700 hover:bg-purple-100">
                That&apos;s enough for now
              </Link>
            </div>
          </div>
        </main>
      )}

      {play.status === "done" && <DoneView summary={play} world={world} topicName={topic.name} />}

      {play.status === "empty" && (
        <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <Character kind={world.guide} size={96} />
          <h2 className="mt-4 text-xl font-bold text-gray-700">{world.guideName} is still building this world. Check back soon!</h2>
          <Link href="/dashboard/play" className="mt-4 rounded-2xl bg-brand-600 px-6 py-3 font-bold text-white">
            Back to the map
          </Link>
        </main>
      )}
    </div>
  );
}

/* ─────────────────────────────── One question ─────────────────────────────── */

function QuestionView({
  exercise,
  note,
  world,
  usedAtStart,
  goalSec,
  speech,
  loadingNext,
  error,
  onResult,
  onNext,
}: {
  exercise: PublicExercise;
  note?: QuestionNote;
  world: World;
  usedAtStart: number;
  goalSec: number;
  speech: ReturnType<typeof usePreReaderSpeech>;
  loadingNext: boolean;
  error: string;
  onResult: (r: SubmitResult, usedBefore: number) => void;
  onNext: () => void;
}) {
  const { data } = exercise;
  const interactionType = data.interactionType || "multiple_choice";

  const [selected, setSelected] = useState<string | null>(null);
  const [orderingList, setOrderingList] = useState<string[]>(() => {
    return data.orderingInitial || (data.options.length > 0 ? [...data.options] : []);
  });
  const [tapCount, setTapCount] = useState<number>(0);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [msg, setMsg] = useState("");
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [hintStage, setHintStage] = useState(0);
  const [nudge, setNudge] = useState<string | null>(null);
  const [example, setExample] = useState<HintStep["example"] | null>(null);
  const [hintBusy, setHintBusy] = useState(false);
  const canEliminate = interactionType === "multiple_choice" && data.options.length >= 3;
  const lastStage = canEliminate ? MAX_HINT_STAGE : MAX_HINT_STAGE - 1;
  // Only the worked example and the 50:50 cost XP, which is what the server charges.
  const hintCosts = hintStage >= 2;
  const [isPending, startTransition] = useTransition();
  const startedAt = useRef(Date.now());

  // Pre-reader voice auto-read on question load
  useEffect(() => {
    if (speech.autoRead) {
      const parts = [data.passage ? `Story: ${data.passage}` : "", data.question];
      if (interactionType === "multiple_choice") {
        data.options.forEach((opt, idx) => parts.push(`Option ${idx + 1}: ${opt}`));
      }
      speech.speak(parts.filter(Boolean).join(". "));
    }
  }, [exercise.id, speech.autoRead, data.passage, data.question, data.options, interactionType, speech]);

  const readQuestionAloud = () => {
    const text = [data.passage, data.question, ...(interactionType === "multiple_choice" ? data.options : [])]
      .filter(Boolean)
      .join(". ");
    speech.speak(text);
  };

  const submit = useCallback(() => {
    const finalAnswer =
      interactionType === "ordering"
        ? orderingList.join(", ")
        : interactionType === "tap_to_count"
        ? String(tapCount)
        : selected;

    if (!finalAnswer || result || isPending) return;
    setMsg("");
    const timeTaken = Math.round((Date.now() - startedAt.current) / 1000);
    startTransition(async () => {
      try {
        const r = await submitExerciseAnswer({
          exerciseId: exercise.id,
          selectedAnswer: finalAnswer,
          timeTaken,
          hintStage,
        });
        setResult(r);
        if (r.questDone) recordQuestDone();
        playSfx(r.correct ? "correct" : "gentle");
        if (speech.autoRead) {
          speech.speak(r.correct ? "Awesome! That is correct!" : `Good try! The answer is ${r.correctAnswer}. ${r.explanation || ""}`);
        }
        onResult(r, usedAtStart);
      } catch {
        setMsg("Oops, we couldn't save that answer. Please try again.");
      }
    });
  }, [
    selected,
    orderingList,
    tapCount,
    interactionType,
    result,
    isPending,
    exercise.id,
    hintStage,
    speech,
    onResult,
    usedAtStart,
  ]);

  async function hint() {
    if (hintStage >= lastStage || hintBusy || result) return;
    setHintBusy(true);
    try {
      const step = await getHint(exercise.id, hintStage + 1);
      if (step.kind === "nudge") setNudge(step.text ?? null);
      if (step.kind === "example") setExample(step.example ?? null);
      if (step.kind === "eliminate") {
        const gone = step.eliminate ?? [];
        setEliminated(gone);
        if (selected && gone.includes(selected)) setSelected(null);
      }
      setHintStage(step.stage);
      playSfx("hint");
      if (speech.autoRead) {
        if (step.kind === "nudge" && step.text) speech.speak(step.text);
        if (step.kind === "example" && step.example) {
          speech.speak(`${step.example.question} ${step.example.steps.join(" ")} The answer is ${step.example.answer}.`);
        }
      }
    } catch {
      setMsg("The hint isn't available right now.");
    } finally {
      setHintBusy(false);
    }
  }

  // Keyboard: 1-4 choose, Enter locks in / continues
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") {
        if (result) onNext();
        else submit();
        return;
      }
      if (interactionType === "multiple_choice") {
        const opt = data.options[Number(e.key) - 1];
        if (!result && opt && !eliminated.includes(opt)) setSelected(opt);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, submit, onNext, data.options, eliminated, interactionType]);

  const correct = result?.correct;
  const mood = !result ? (hintStage > 0 ? "think" : "happy") : correct ? "cheer" : "oops";
  const bubble = result
    ? result.cheer
    : eliminated.length > 0
    ? "Two wrong answers are gone. You've got this!"
    : hintStage > 0
    ? "Take your time. You can do it!"
    : note?.kind === "recovery"
    ? "Let's warm up with a gentler one, then get back to the tricky one."
    : note?.kind === "review"
    ? `A memory refresher from ${note.topicName}. Let's see what you remember!`
    : usedAtStart === 0
    ? world.intro
    : "Here's another one. You can do it!";
  const shortOptions = data.options.every((o) => o.length <= 14) && !data.icons;
  const lastOfTime = !result?.timeUp;

  // Interaction handlers
  const moveOrderItem = (fromIndex: number, toIndex: number) => {
    if (result || toIndex < 0 || toIndex >= orderingList.length) return;
    setOrderingList((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  return (
    <>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-2 overflow-y-auto px-3 py-2 sm:gap-3 sm:py-4">
        {/* Guide + speech bubble */}
        <div className="flex items-center gap-2" aria-live="polite">
          <div
            className={cn(
              "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16",
              world.soft,
              result && (correct ? "animate-hop" : "animate-wiggle")
            )}
            aria-hidden="true"
          >
            <Character kind={world.guide} size={50} mood={mood} />
          </div>
          <div className="min-w-0 flex-1 rounded-2xl rounded-bl-sm border-2 border-border bg-white px-3 py-1.5 shadow-sm">
            <p className="text-[11px] font-bold leading-tight text-gray-500">{world.guideName}</p>
            <p className="text-sm font-semibold leading-snug text-gray-900 sm:text-base">{bubble}</p>
          </div>
        </div>

        {note && !result && (
          <p className="self-start rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800" role="status">
            {note.kind === "review" ? `🧠 Memory refresher · ${note.topicName}` : "🌱 Warm-up question"}
          </p>
        )}

        {/* Question card */}
        <section className="rounded-3xl border border-border bg-white p-3 shadow-sm sm:p-5">
          {data.passage && (
            <div className="mb-2 max-h-36 overflow-y-auto rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm leading-relaxed text-gray-700 sm:max-h-48 sm:text-base">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Read this story</p>
                <button
                  type="button"
                  onClick={() => speech.speak(data.passage || "")}
                  className="rounded-full bg-amber-200/70 p-1 text-amber-900 hover:bg-amber-200"
                  aria-label="Read passage aloud"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {data.passage}
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold leading-snug text-gray-900 sm:text-2xl">{data.question}</h2>
            <button
              type="button"
              onClick={readQuestionAloud}
              aria-label="Read this question aloud"
              className={cn(
                "flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors",
                speech.isSpeaking ? "bg-amber-100 text-amber-900 ring-2 ring-amber-300" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
              )}
            >
              <Volume2 className="h-4 w-4" /> <span className="hidden sm:inline">Listen</span>
            </button>
          </div>

          {data.visual && <VisualHelper visual={data.visual} />}

          {nudge && !result && (
            <p className="mt-3 rounded-2xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="status">
              💡 {nudge}
            </p>
          )}
          {example && !result && (
            <div className="mt-3">
              <WorkedExampleCard example={example} onSpeak={speech.speak} />
            </div>
          )}

          {/* 1. Multiple Choice */}
          {interactionType === "multiple_choice" && (
            <div
              className={cn("mt-3 grid gap-2", shortOptions || data.icons ? "grid-cols-2" : "grid-cols-1")}
              role="radiogroup"
              aria-label="Answer options"
            >
              {data.options.map((option, i) => {
                const gone = eliminated.includes(option);
                let state = "";
                if (result) {
                  if (option === result.correctAnswer) state = "correct";
                  else if (option === selected) state = "incorrect";
                } else if (option === selected) state = "selected";
                return (
                  <button
                    key={option}
                    role="radio"
                    aria-checked={option === selected}
                    onClick={() => {
                      if (!result && !gone) {
                        setSelected(option);
                        if (speech.autoRead) speech.speak(option);
                      }
                    }}
                    disabled={!!result || gone}
                    className={cn(
                      "exercise-option flex w-full items-center gap-2 !p-2.5 sm:!p-3",
                      data.icons ? "flex-col justify-center text-center" : "",
                      state,
                      gone && "pointer-events-none line-through opacity-30"
                    )}
                  >
                    {data.icons?.[option] ? (
                      <span className="text-4xl leading-none sm:text-5xl" aria-hidden="true">
                        {data.icons[option]}
                      </span>
                    ) : (
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {i + 1}
                      </span>
                    )}
                    <span className={cn("text-base font-semibold sm:text-lg", data.icons ? "" : "flex-1")}>
                      {option}
                    </span>
                    {state === "correct" && <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />}
                    {state === "incorrect" && <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Number Line Interaction */}
          {interactionType === "number_line" && (
            <div className="mt-4 rounded-2xl bg-brand-50/60 p-4 border border-brand-100">
              <p className="text-center text-xs font-bold text-gray-600 mb-3">Slide or tap the number line to pick your answer:</p>
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2">
                {Array.from({
                  length:
                    Math.round(
                      ((data.numberLineConfig?.max ?? 10) - (data.numberLineConfig?.min ?? 0)) /
                        (data.numberLineConfig?.step ?? 1)
                    ) + 1,
                }).map((_, idx) => {
                  const val = (data.numberLineConfig?.min ?? 0) + idx * (data.numberLineConfig?.step ?? 1);
                  const valStr = String(val);
                  const isSelected = selected === valStr;
                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={!!result}
                      onClick={() => {
                        setSelected(valStr);
                        if (speech.autoRead) speech.speak(valStr);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl p-2 min-w-[2.75rem] transition-all",
                        isSelected
                          ? "bg-brand-600 text-white font-extrabold shadow-md scale-105"
                          : "bg-white text-gray-800 font-bold border border-gray-200 hover:border-brand-400"
                      )}
                    >
                      <span className="text-sm sm:text-base">{val}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-gray-500">Selected Answer: </span>
                <span className="text-lg font-black text-brand-700">{selected ?? "Tap a number"}</span>
              </div>
            </div>
          )}

          {/* 3. Tap To Count Interaction */}
          {interactionType === "tap_to_count" && (
            <div className="mt-4 rounded-2xl bg-amber-50/70 p-4 border border-amber-200">
              <p className="text-center text-xs font-bold text-amber-900 mb-2">Tap the items to count them up:</p>
              <div className="flex flex-wrap justify-center gap-2 p-2 bg-white rounded-2xl shadow-inner min-h-[5rem]">
                {Array.from({ length: data.tapCountConfig?.maxCount ?? 12 }).map((_, idx) => {
                  const isTapped = idx < tapCount;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!!result}
                      onClick={() => {
                        const newCount = idx + 1 === tapCount ? idx : idx + 1;
                        setTapCount(newCount);
                        setSelected(String(newCount));
                        if (speech.autoRead) speech.speak(String(newCount));
                      }}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-all",
                        isTapped
                          ? "bg-yellow-200 ring-4 ring-yellow-400 scale-105 shadow-sm"
                          : "bg-gray-100 opacity-40 hover:opacity-80"
                      )}
                    >
                      {data.tapCountConfig?.emoji || "⭐"}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between px-2">
                <button
                  type="button"
                  disabled={!!result || tapCount === 0}
                  onClick={() => {
                    setTapCount(0);
                    setSelected("0");
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset count
                </button>
                <div className="text-sm font-bold text-gray-700">
                  Total Counted: <span className="text-xl font-black text-brand-700">{tapCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Fill in the blank / Numeric input with on-screen keypad */}
          {interactionType === "fill_blank" && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selected ?? ""}
                  onChange={(e) => setSelected(e.target.value)}
                  disabled={!!result}
                  placeholder={data.placeholder || "Your answer"}
                  className="rounded-2xl border-2 border-brand-300 bg-white px-4 py-2 text-center text-xl font-black text-brand-900 shadow-inner focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 w-48"
                />
                {selected && !result && (
                  <button
                    type="button"
                    onClick={() => setSelected("")}
                    className="rounded-full bg-gray-200 p-2 text-gray-600 hover:bg-gray-300"
                    aria-label="Clear answer"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Kid-friendly number keypad */}
              <div className="grid grid-cols-5 gap-1.5 rounded-2xl bg-gray-100 p-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={!!result}
                    onClick={() => {
                      setSelected((prev) => (prev ? prev + n : n));
                      if (speech.autoRead) speech.speak(n);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-extrabold text-gray-800 shadow-sm hover:bg-brand-50 active:scale-95"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Ordering Interaction */}
          {interactionType === "ordering" && (
            <div className="mt-4 rounded-2xl bg-purple-50/70 p-4 border border-purple-200">
              <p className="text-center text-xs font-bold text-purple-900 mb-3">Arrange in the correct order (left to right):</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {orderingList.map((item, idx) => (
                  <div key={`${item}-${idx}`} className="flex items-center gap-1 rounded-2xl bg-white border-2 border-purple-300 p-2 shadow-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-extrabold text-purple-800">
                      {idx + 1}
                    </span>
                    <span className="px-2 text-base font-extrabold text-gray-900">{item}</span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={!!result || idx === 0}
                        onClick={() => moveOrderItem(idx, idx - 1)}
                        className="rounded bg-purple-100 px-1 text-[10px] font-bold text-purple-700 hover:bg-purple-200 disabled:opacity-30"
                        aria-label={`Move ${item} left`}
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        disabled={!!result || idx === orderingList.length - 1}
                        onClick={() => moveOrderItem(idx, idx + 1)}
                        className="rounded bg-purple-100 px-1 text-[10px] font-bold text-purple-700 hover:bg-purple-200 disabled:opacity-30"
                        aria-label={`Move ${item} right`}
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback stays inside the page: one compact block */}
          {result && (
            <div
              className={cn("mt-3 rounded-2xl px-3 py-2 text-sm", correct ? "bg-green-50 text-green-900" : "bg-amber-50 text-amber-900")}
              role="status"
            >
              <p className="font-display text-base font-bold">{correct ? "Correct! 🎉" : "Not quite yet. 💪"}</p>
              <WhyCard
                correct={!!correct}
                explanation={result.explanation}
                correctAnswer={result.correctAnswer}
                topicId={exercise.topicId}
                exerciseId={exercise.id}
                onSpeak={speech.speak}
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-bold">
                {result.starsEarned > 0 && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800">⭐ +{result.starsEarned}</span>}
                {result.xpEarned > 0 && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-brand-800">+{result.xpEarned} XP</span>}
                {result.combo >= 2 && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-800">x{result.combo} in a row</span>}
                {hintCosts && correct && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Hint used: half XP</span>}
                {result.questDone && result.quest && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-800">
                    {"⭐".repeat(result.quest.stars)} {questEndLine(result.quest.correct)}
                  </span>
                )}
                {result.levelChange !== "same" && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-800">{result.message}</span>}
              </div>
              {result.evolvedTo && (
                <p className="mt-1.5 font-bold text-purple-900">
                  {result.evolvedTo.emoji} Your buddy grew into a {result.evolvedTo.name}!
                </p>
              )}
              {result.newBadges.map((b) => (
                <p key={b} className="mt-1 font-semibold text-purple-800">
                  🏅 New badge: {b}
                </p>
              ))}
            </div>
          )}

          {(msg || error) && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{msg || error}</p>}
        </section>
      </main>

      {/* Pinned action bar: always on screen */}
      <footer className="border-t border-border bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          {!result ? (
            <>
              <button
                type="button"
                onClick={hint}
                disabled={hintStage >= lastStage || hintBusy}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 py-3 text-sm font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-40"
                title={
                  hintStage + 1 >= 3 && canEliminate
                    ? "Hide two wrong answers (half XP for this question)"
                    : hintStage + 1 === 2
                    ? "See a worked example (half XP for this question)"
                    : "Get a free nudge"
                }
              >
                <Lightbulb className="h-5 w-5" />{" "}
                {hintStage >= lastStage ? "Used" : hintStage === 0 ? "Hint" : `Hint ${hintStage + 1}`}
              </button>
              <button
                onClick={submit}
                disabled={
                  (interactionType === "multiple_choice" && !selected) ||
                  (interactionType === "fill_blank" && !selected?.trim()) ||
                  (interactionType === "number_line" && !selected) ||
                  (interactionType === "tap_to_count" && tapCount === 0) ||
                  isPending
                }
                className="flex-1 rounded-2xl bg-brand-600 py-3 text-lg font-extrabold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
              >
                {isPending ? "Checking…" : "Lock it in!"}
              </button>
            </>
          ) : (
            <button
              onClick={onNext}
              disabled={loadingNext}
              autoFocus
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 text-lg font-extrabold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {loadingNext ? "Loading…" : lastOfTime ? "See how I did" : "Next question"} <ArrowRight className="h-5 w-5" />
            </button>
          )}
          <Link href="/dashboard" className="flex-shrink-0 rounded-2xl px-3 py-3 text-xs font-bold text-gray-500 hover:bg-gray-100 sm:text-sm">
            Done for today
          </Link>
        </div>
        {goalSec > 0 && <p className="sr-only">Questions keep coming until your practice time is used.</p>}
      </footer>
    </>
  );
}

/* ─────────────────────────────── Done View ─────────────────────────────── */

function DoneView({ summary, world, topicName }: { summary: DoneSummary; world: World; topicName: string }) {
  return (
    <main className="flex flex-1 items-center justify-center overflow-y-auto p-4">
      <div className="w-full max-w-md rounded-3xl border-2 border-brand-200 bg-white p-6 text-center shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <Character kind={world.guide} size={64} mood="cheer" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-gray-900">
          {summary.reason === "rest" ? "Rest day for this world!" : "Today's quest is complete! 🌟"}
        </h2>
        <p className="mt-1 text-sm font-semibold text-gray-600">
          You practised <strong className="text-brand-700">{topicName}</strong> today.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-3">
          <div>
            <p className="text-xl font-black text-gray-900">{summary.answered}</p>
            <p className="text-[11px] font-bold text-gray-500">Answered</p>
          </div>
          <div>
            <p className="text-xl font-black text-green-600">{summary.correct}</p>
            <p className="text-[11px] font-bold text-gray-500">Correct</p>
          </div>
          <div>
            <p className="text-xl font-black text-brand-600">+{summary.xp}</p>
            <p className="text-[11px] font-bold text-gray-500">XP Earned</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {summary.next ? (
            <Link
              href={`/dashboard/learn/${summary.next.id}`}
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-base font-extrabold text-white hover:bg-brand-700"
            >
              Next world: {summary.next.name} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-base font-extrabold text-white hover:bg-brand-700"
            >
              Back to Dashboard
            </Link>
          )}
          <Link
            href="/dashboard/play"
            className="rounded-2xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Visit the World Map
          </Link>
        </div>
      </div>
    </main>
  );
}
