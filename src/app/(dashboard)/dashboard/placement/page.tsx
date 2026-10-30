"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  BookOpen,
  Sparkles,
  CheckCircle,
  XCircle,
  Volume2,
  Award,
} from "lucide-react";
import {
  fetchDiagnosticQuestion,
  checkDiagnosticAnswer,
  completeDiagnosticPlacement,
} from "@/app/actions/diagnostic";
import { markPlacementDone } from "@/app/actions/exercises";
import type { DiagnosticAnswerRecord, DiagnosticResult } from "@/lib/diagnostic";
import type { PublicExercise } from "@/lib/question-types";
import VisualHelper from "@/components/exercises/VisualHelper";
import Character from "@/components/art/Character";
import { cn } from "@/lib/utils";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function PlacementPage() {
  const router = useRouter();
  const [subject, setSubject] = useState<"MATH" | "READING" | null>(null);
  const [currentQ, setCurrentQ] = useState<{
    exercise: PublicExercise;
    step: number;
    targetLevel: number;
  } | null>(null);
  const [history, setHistory] = useState<DiagnosticAnswerRecord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [stepResult, setStepResult] = useState<{
    correct: boolean;
    correctAnswer: string;
    explanation?: string;
  } | null>(null);
  const [finalResult, setFinalResult] = useState<(DiagnosticResult & { bonusXP: number; bonusStars: number }) | null>(null);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState("");
  const startTime = useRef(Date.now());

  const skipPlacement = () => {
    startTransition(async () => {
      try {
        await markPlacementDone();
        router.push("/dashboard/play");
      } catch {
        setError("Could not skip right now. Please try again.");
      }
    });
  };

  const startSubjectPlacement = (sub: "MATH" | "READING") => {
    setSubject(sub);
    setHistory([]);
    setStepResult(null);
    setFinalResult(null);
    setError("");
    startTransition(async () => {
      try {
        const q = await fetchDiagnosticQuestion(sub, []);
        setCurrentQ(q);
        startTime.current = Date.now();
      } catch {
        setError("Could not load diagnostic assessment. Please try again.");
      }
    });
  };

  const handleSelectAnswer = (ans: string) => {
    if (stepResult) return;
    setSelectedAnswer(ans);
  };

  const submitStepAnswer = () => {
    if (!selectedAnswer || !currentQ || stepResult || loading) return;
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

    startTransition(async () => {
      try {
        const res = await checkDiagnosticAnswer(currentQ.exercise.id, selectedAnswer);
        setStepResult(res);

        const newRecord: DiagnosticAnswerRecord = {
          step: currentQ.step,
          levelTested: currentQ.targetLevel,
          correct: res.correct,
          timeTakenSec: timeTaken,
        };
        const updatedHistory = [...history, newRecord];
        setHistory(updatedHistory);

        // If step 5 was completed, finish test
        if (updatedHistory.length >= 5) {
          const finished = await completeDiagnosticPlacement(subject!, updatedHistory);
          setFinalResult(finished);
        }
      } catch {
        setError("Error saving step answer.");
      }
    });
  };

  const nextStep = () => {
    if (!subject) return;
    setStepResult(null);
    setSelectedAnswer(null);
    setError("");

    startTransition(async () => {
      try {
        const q = await fetchDiagnosticQuestion(subject, history);
        setCurrentQ(q);
        startTime.current = Date.now();
      } catch {
        setError("Error loading next diagnostic step.");
      }
    });
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      {finalResult && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <Confetti recycle={false} numberOfPieces={300} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/play"
          className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the map
        </Link>
        <div className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          <Sparkles className="h-3.5 w-3.5" /> 5-Question Adaptive Placement
        </div>
      </div>

      {/* 1. Subject Selection Screen */}
      {!subject && (
        <div className="rounded-3xl border-2 border-brand-100 bg-white p-6 shadow-sm sm:p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
            <Award className="h-10 w-10 text-brand-600" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-gray-900 sm:text-3xl">Diagnostic Placement Quest</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-lg mx-auto">
            Take a quick 5-question adaptive quiz. The questions automatically adjust to calibrate your exact skill level, unlocking personalized exercises!
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => startSubjectPlacement("MATH")}
              className="flex flex-col items-center rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-6 text-center transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
            >
              <div className="rounded-2xl bg-blue-500 p-4 text-white shadow-sm">
                <Calculator className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-black text-blue-950">Math Placement</h3>
              <p className="mt-1 text-xs text-blue-800">Addition, Times Tables, Fractions & Word Problems</p>
              <span className="mt-4 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white">
                Start Math Placement →
              </span>
            </button>

            <button
              onClick={() => startSubjectPlacement("READING")}
              className="flex flex-col items-center rounded-2xl border-2 border-purple-200 bg-purple-50/50 p-6 text-center transition-all hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
            >
              <div className="rounded-2xl bg-purple-500 p-4 text-white shadow-sm">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-black text-purple-950">Reading Placement</h3>
              <p className="mt-1 text-xs text-purple-800">Phonics, Vocabulary, Grammar & Stories</p>
              <span className="mt-4 rounded-full bg-purple-600 px-4 py-1.5 text-xs font-bold text-white">
                Start Reading Placement →
              </span>
            </button>
          </div>

          {error && <p className="mt-4 text-xs font-bold text-red-600">{error}</p>}
          <button
            type="button"
            onClick={skipPlacement}
            disabled={loading}
            className="mt-6 text-sm font-bold text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline disabled:opacity-50"
          >
            Skip for now. I&apos;ll start from the beginning.
          </button>
        </div>
      )}

      {/* 2. Active Diagnostic Question View */}
      {subject && !finalResult && currentQ && (
        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-7">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1.5">
              <span>
                Question {currentQ.step} of 5 ({subject === "MATH" ? "Math" : "Reading"})
              </span>
              <span className="text-brand-700">Testing Level {currentQ.targetLevel}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-300"
                style={{ width: `${(currentQ.step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Question passage & prompt */}
          {currentQ.exercise.data.passage && (
            <div className="mb-3 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm text-gray-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1">Passage</p>
              {currentQ.exercise.data.passage}
            </div>
          )}

          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{currentQ.exercise.data.question}</h2>
            <button
              type="button"
              onClick={() => speak(currentQ.exercise.data.question)}
              className="rounded-full bg-brand-50 p-2 text-brand-700 hover:bg-brand-100"
              aria-label="Listen to question"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {currentQ.exercise.data.visual && <VisualHelper visual={currentQ.exercise.data.visual} />}

          {/* Options */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {currentQ.exercise.data.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              let btnClass = "border-gray-200 bg-white hover:border-brand-300";

              if (stepResult) {
                if (opt === stepResult.correctAnswer) {
                  btnClass = "border-green-500 bg-green-50 text-green-900 font-bold";
                } else if (isSelected) {
                  btnClass = "border-red-400 bg-red-50 text-red-900";
                }
              } else if (isSelected) {
                btnClass = "border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-300 font-bold";
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={!!stepResult || loading}
                  onClick={() => handleSelectAnswer(opt)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border-2 p-3 text-left transition-all",
                    btnClass
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold">{opt}</span>
                  </span>
                  {stepResult && opt === stepResult.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                  {stepResult && isSelected && !stepResult.correct && (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Step Feedback */}
          {stepResult && (
            <div
              className={cn(
                "mt-4 rounded-2xl p-3 text-sm",
                stepResult.correct ? "bg-green-50 text-green-900" : "bg-amber-50 text-amber-900"
              )}
            >
              <p className="font-extrabold">{stepResult.correct ? "Great answer! 🎉" : "Good attempt! 👍"}</p>
              {stepResult.explanation && <p className="mt-0.5 text-xs text-gray-700">{stepResult.explanation}</p>}
            </div>
          )}

          {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}

          {/* Action button */}
          <div className="mt-6 flex justify-end">
            {!stepResult ? (
              <button
                type="button"
                disabled={!selectedAnswer || loading}
                onClick={submitStepAnswer}
                className="rounded-2xl bg-brand-600 px-6 py-3 font-extrabold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
              >
                {loading ? "Checking…" : "Submit Answer"}
              </button>
            ) : history.length < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 font-extrabold text-white transition-colors hover:bg-brand-700"
              >
                {loading ? "Loading…" : "Next Question"} <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* 3. Final Placement Results Screen */}
      {finalResult && (
        <div className="rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-lg sm:p-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
            <Award className="h-14 w-14 text-brand-600" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-gray-900">Placement Complete!</h2>
          <p className="mt-2 text-sm text-gray-600">{finalResult.summary}</p>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-4 max-w-md mx-auto">
            <div>
              <p className="text-2xl font-black text-brand-600">Level {finalResult.recommendedLevel}</p>
              <p className="text-[11px] font-bold text-gray-500">Starting Level</p>
            </div>
            <div>
              <p className="text-2xl font-black text-purple-600">{finalResult.recommendedGrade}</p>
              <p className="text-[11px] font-bold text-gray-500">Grade Placement</p>
            </div>
            <div>
              <p className="text-2xl font-black text-yellow-500">+{finalResult.bonusXP} XP</p>
              <p className="text-[11px] font-bold text-gray-500">Bonus Earned</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/play"
              className="w-full sm:w-auto rounded-2xl bg-brand-600 px-8 py-3.5 text-base font-extrabold text-white hover:bg-brand-700 transition-colors"
            >
              Start Practising on Map 🚀
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto rounded-2xl border-2 border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
