"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb, Pause, Play, RotateCcw, Volume2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { splitSentences, type Story } from "@/lib/storybook";
import { findAnswerPage, solutionSteps, storyNudge } from "@/lib/hints";
import StepByStep from "@/components/exercises/StepByStep";
import { playSfx } from "./sfx";
import { awardSticker } from "@/lib/stickers";
import { CHEERS, GENTLE_RETRIES, GREETINGS, THANKS, pick as pickOne } from "@/lib/voice-style";
import SceneArt from "@/components/art/SceneArt";
import VoiceToggle from "./VoiceToggle";
import { makeUtterance, say, speechSupported, stopSpeaking } from "./voice";

type Phase = "read" | "quiz" | "done";

/**
 * Picture-book reader. Every page is an illustration with a few lines of text underneath, like a real
 * storybook. "Read to me" speaks one sentence at a time in a gentle, friendly voice and highlights it, then
 * turns the page. Tap any sentence to hear just that one. Afterwards: three think-about-it questions,
 * each with a "why".
 */
export default function StoryReader({ story }: { story: Story }) {
  const [phase, setPhase] = useState<Phase>("read");
  const [page, setPage] = useState(0);
  const [sentence, setSentence] = useState(-1); // sentence being read; -1 = none
  const [reading, setReading] = useState(false);
  const [autoTurn, setAutoTurn] = useState(true);
  const [supported, setSupported] = useState(false);
  const stopRef = useRef(false);

  const current = story.pages[page];
  const sentences = splitSentences(current.text);
  const backdrop = current.backdrop ?? story.backdrop;

  const stop = useCallback(() => {
    stopRef.current = true;
    stopSpeaking();
    setReading(false);
    setSentence(-1);
  }, []);

  useEffect(() => {
    setSupported(speechSupported());
    // A warm hello when the book opens (only if the friendly voice is on).
    say(`${pickOne(GREETINGS)} Let us read ${story.title} together.`);
    return stop;
  }, [stop, story.title]);

  const speakFrom = useCallback(
    (pageIndex: number, from: number) => {
      if (!speechSupported()) return;
      window.speechSynthesis.cancel();
      stopRef.current = false;
      setReading(true);
      const parts = splitSentences(story.pages[pageIndex].text);

      const next = (i: number) => {
        if (stopRef.current) return;
        if (i >= parts.length) {
          setSentence(-1);
          if (autoTurn && pageIndex < story.pages.length - 1) {
            setTimeout(() => {
              if (stopRef.current) return;
              setPage(pageIndex + 1);
              speakFrom(pageIndex + 1, 0);
            }, 900);
          } else {
            setReading(false);
          }
          return;
        }
        setSentence(i);
        const u = makeUtterance(parts[i], { rate: 0.85, pitch: 1.08 });
        u.onend = () => next(i + 1);
        u.onerror = () => {
          setReading(false);
          setSentence(-1);
        };
        window.speechSynthesis.speak(u);
      };
      next(from);
    },
    [autoTurn, story.pages]
  );

  function goTo(n: number) {
    stop();
    playSfx("page");
    setPage(n);
  }

  // ── Quiz state ──
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [hintStage, setHintStage] = useState(0); // 0 none, 1 nudge, 2 look at the page, 3 two wrong answers hidden
  const q = story.questions[qi];
  const answerPage = findAnswerPage(story, q);
  const canEliminate = q.options.length >= 3;
  const lastHint = canEliminate ? 3 : 2;
  // Two wrong answers go away with the last hint (never the right one)
  const hidden = hintStage >= 3 ? q.options.filter((o) => o !== q.answer).slice(0, 2) : [];

  function showHint() {
    if (picked || hintStage >= lastHint) return;
    const stage = hintStage + 1;
    setHintStage(stage);
    playSfx("hint");
    if (stage === 1) say(storyNudge(q));
    if (stage === 2) say(answerPage !== null ? `Let us look at page ${answerPage + 1} together.` : "Think back to the story.");
    if (stage === 3) say("I took away two answers. You can do it!");
  }

  function pickAnswer(opt: string) {
    if (picked) return;
    setPicked(opt);
    const right = opt === q.answer;
    if (right) setScore((s) => s + 1);
    playSfx(right ? "correct" : "gentle");
    say(`${right ? pickOne(CHEERS) : pickOne(GENTLE_RETRIES)} ${q.why}`);
  }

  function nextQuestion() {
    if (qi + 1 < story.questions.length) {
      setQi(qi + 1);
      setPicked(null);
      setHintStage(0);
      stopSpeaking();
    } else {
      awardSticker(`story:${story.id}`);
      if (score === story.questions.length) awardSticker("story:all-correct");
      setPhase("done");
      playSfx("win");
      say(`The end! ${pickOne(THANKS)} I added a sticker to your album.`);
    }
  }

  // ── Reading screen ──
  if (phase === "read") {
    const last = page === story.pages.length - 1;
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard/stories" onClick={stop} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-brand-700 shadow-sm hover:bg-brand-50">
            <ArrowLeft className="h-4 w-4" /> Books
          </Link>
          <p className="truncate font-display text-lg font-bold text-gray-800">{story.emoji} {story.title}</p>
          <VoiceToggle />
        </div>

        {/* The open book */}
        <div className="rounded-[2rem] bg-amber-900 p-2 shadow-2xl sm:p-3">
          <div className="overflow-hidden rounded-[1.5rem] border-4 border-amber-100 bg-amber-50">
            <SceneArt key={`art-${page}`} backdrop={backdrop} scene={current.scene} className="border-b-4 border-amber-100" />
            <div className="min-h-[9rem] space-y-1 bg-[#fffaf0] p-5 text-xl leading-relaxed sm:p-7 sm:text-2xl" aria-live="polite">
              {sentences.map((s, i) => (
                <button
                  key={`${page}-${i}`}
                  type="button"
                  disabled={!supported}
                  onClick={() => speakFrom(page, i)}
                  className={cn(
                    "mr-1 inline rounded-lg px-1 text-left font-semibold text-gray-900 transition-colors",
                    sentence === i ? "bg-kid-sun text-brand-900" : "hover:bg-brand-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-[#fffaf0] pb-3" role="presentation">
              {story.pages.map((_, i) => (
                <span key={i} className={cn("h-2 rounded-full transition-all", i === page ? "w-6 bg-brand-500" : "w-2 bg-amber-200")} />
              ))}
              <span className="ml-2 text-xs font-bold text-gray-500">Page {page + 1} of {story.pages.length}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goTo(Math.max(0, page - 1))}
            disabled={page === 0}
            className="btn-chunky flex items-center gap-1 bg-white px-4 py-3 text-brand-700 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {supported ? (
            reading ? (
              <button type="button" onClick={stop} className="btn-chunky flex items-center gap-2 bg-kid-coral px-6 py-3 text-lg text-white">
                <Pause className="h-5 w-5" /> Pause
              </button>
            ) : (
              <button type="button" onClick={() => speakFrom(page, 0)} className="btn-chunky flex items-center gap-2 bg-brand-600 px-6 py-3 text-lg text-white">
                <Volume2 className="h-5 w-5" /> Read to me
              </button>
            )
          ) : (
            <p className="rounded-2xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">This device cannot read aloud, but you can read along!</p>
          )}

          {!last ? (
            <button type="button" onClick={() => goTo(page + 1)} className="btn-chunky flex items-center gap-1 bg-white px-4 py-3 text-brand-700" aria-label="Next page">
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                stop();
                setPhase("quiz");
                say("That was a lovely story. Now let us think about it together.");
              }}
              className="btn-chunky flex items-center gap-2 bg-kid-mint px-5 py-3 text-lg text-white"
            >
              Think about it <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>

        <label className="mx-auto flex w-fit items-center gap-2 text-sm font-semibold text-gray-600">
          <input type="checkbox" checked={autoTurn} onChange={(e) => setAutoTurn(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Turn pages by itself
        </label>
        <p className="text-center text-xs text-gray-500">Tip: tap any sentence to hear just that one.</p>
      </div>
    );
  }

  // ── Quiz ──
  if (phase === "quiz") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-center text-sm font-bold text-gray-500">Think about it · {qi + 1} of {story.questions.length}</p>
        <div className="rounded-3xl border-4 border-white bg-white p-5 shadow-xl sm:p-7">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{q.question}</h2>
            <button
              type="button"
              aria-label="Read the question aloud"
              onClick={() => {
                if (!speechSupported()) return;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(makeUtterance([q.question, ...q.options].join(". ")));
              }}
              className="flex-shrink-0 rounded-full bg-brand-50 p-2 text-brand-700 hover:bg-brand-100"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
          {/* Hints: a nudge, then the page to look at, then two wrong answers fade away. Never the answer itself. */}
          {!picked && hintStage >= 1 && (
            <p className="mt-3 rounded-2xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="status">
              💡 {storyNudge(q)}
            </p>
          )}
          {!picked && hintStage >= 2 && answerPage !== null && (
            <div className="mt-3 overflow-hidden rounded-2xl border-2 border-amber-200 bg-[#fffaf0]">
              <p className="bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
                📖 Look at page {answerPage + 1}
              </p>
              <SceneArt
                backdrop={story.pages[answerPage].backdrop ?? story.backdrop}
                scene={story.pages[answerPage].scene}
                className="max-h-40 w-full"
              />
              <p className="px-3 py-2 text-base font-semibold text-gray-800">{story.pages[answerPage].text}</p>
            </div>
          )}
          {!picked && hintStage === 3 && <p className="mt-2 text-sm font-semibold text-amber-800">Two answers faded away. 🌫️</p>}

          <div className="mt-4 grid gap-2">
            {q.options.map((o) => {
              const gone = hidden.includes(o);
              const state = !picked ? "" : o === q.answer ? "correct" : o === picked ? "incorrect" : "";
              return (
                <button
                  key={o}
                  type="button"
                  disabled={!!picked || gone}
                  onClick={() => pickAnswer(o)}
                  className={cn("exercise-option flex items-center justify-between", state, gone && "pointer-events-none line-through opacity-30")}
                >
                  <span>{o}</span>
                  {state === "correct" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {state === "incorrect" && <XCircle className="h-5 w-5 text-red-500" />}
                </button>
              );
            })}
          </div>

          {!picked && (
            <button
              type="button"
              onClick={showHint}
              disabled={hintStage >= lastHint}
              className="mt-3 flex items-center gap-1.5 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-40"
            >
              <Lightbulb className="h-4 w-4" /> {hintStage >= lastHint ? "No more hints" : hintStage === 0 ? "Hint" : `Hint ${hintStage + 1}`}
            </button>
          )}

          {picked && (
            <div className="mt-4 rounded-2xl border-2 border-brand-200 bg-brand-50 p-4 text-brand-950">
              <p className="font-display text-lg font-bold">{picked === q.answer ? "Yes! Well done 🎉" : "Nice try, my friend 💪"}</p>
              <p className="mt-2 text-sm font-extrabold">Show me how</p>
              <StepByStep key={qi} steps={solutionSteps(q.why)} tone="brand" className="mt-1" />
            </div>
          )}
        </div>
        {picked && (
          <button type="button" onClick={nextQuestion} className="btn-chunky mx-auto flex items-center gap-2 bg-brand-600 px-8 py-3 text-lg text-white">
            {qi + 1 < story.questions.length ? "Next" : "Finish"} <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }

  // ── Done ──
  return (
    <div className="mx-auto max-w-xl space-y-4 text-center">
      <div className="rounded-3xl bg-gradient-to-br from-kid-sun to-kid-orange p-8 shadow-xl">
        <p className="animate-hop text-7xl" aria-hidden="true">🎉</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-900">The End!</h2>
        <p className="mt-1 text-lg font-semibold text-brand-900">You got {score} of {story.questions.length} right.</p>
        <p className="mt-1 text-brand-900">A sticker was added to your album. Thank you for reading with me!</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setPhase("read");
            setPage(0);
            setQi(0);
            setPicked(null);
            setScore(0);
          }}
          className="btn-chunky flex items-center gap-2 bg-white px-5 py-3 text-brand-700"
        >
          <RotateCcw className="h-5 w-5" /> Read again
        </button>
        <Link href="/dashboard/stories" className="btn-chunky flex items-center gap-2 bg-brand-600 px-5 py-3 text-white">
          <Play className="h-5 w-5" /> More stories
        </Link>
        <Link href="/dashboard/fun/stickers" className="btn-chunky flex items-center gap-2 bg-kid-pink px-5 py-3 text-white">
          🎟️ My stickers
        </Link>
      </div>
    </div>
  );
}
