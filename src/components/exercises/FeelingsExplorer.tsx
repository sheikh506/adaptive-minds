"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FeelingsCard, SocialScenario } from "@/lib/feelings";

// ─── Feelings card ────────────────────────────────────────────────────────────

function FeelingsTile({ card, onSelect, selected }: { card: FeelingsCard; onSelect: (id: string) => void; selected: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card.id)}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center rounded-3xl border-2 p-4 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
        selected ? "border-brand-500 bg-brand-50 shadow-md scale-105" : "border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50"
      )}
    >
      <span className="text-5xl" aria-hidden="true">{card.emoji}</span>
      <span className="mt-2 text-sm font-extrabold text-gray-900">{card.feeling}</span>
    </button>
  );
}

function FeelingsDetail({ card }: { card: FeelingsCard }) {
  return (
    <div className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-6 space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-6xl" aria-hidden="true">{card.emoji}</span>
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">{card.feeling}</h3>
          <p className="text-sm text-gray-700">{card.description}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">You might feel {card.feeling.toLowerCase()} when…</p>
        <ul className="space-y-1">
          {card.examples.map((ex, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
              <span className="mt-0.5 flex-shrink-0 text-brand-500">•</span> {ex}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-white border border-brand-200 px-4 py-3">
        <p className="text-xs font-bold text-brand-700 mb-1">👀 What to look for on someone&apos;s face</p>
        <p className="text-sm text-gray-800">{card.faceClue}</p>
      </div>
      <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
        <p className="text-xs font-bold text-green-700 mb-1">💡 What can help</p>
        <p className="text-sm text-gray-800">{card.copingTip}</p>
      </div>
    </div>
  );
}

// ─── Social scenario ──────────────────────────────────────────────────────────

function ScenarioCard({ scenario }: { scenario: SocialScenario }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const choice = chosen !== null ? scenario.choices[chosen] : null;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-4xl flex-shrink-0" aria-hidden="true">{scenario.emoji}</span>
        <div>
          <h3 className="font-extrabold text-gray-900">{scenario.title}</h3>
          <p className="text-sm text-gray-700 mt-1">{scenario.situation}</p>
        </div>
      </div>
      <p className="font-semibold text-gray-900 text-sm">{scenario.question}</p>
      <div className="grid gap-2">
        {scenario.choices.map((c, i) => {
          const isSelected = chosen === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => { if (chosen === null) setChosen(i); }}
              disabled={chosen !== null}
              className={cn(
                "w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all",
                chosen === null
                  ? "border-gray-200 bg-gray-50 text-gray-900 hover:border-brand-400 hover:bg-brand-50"
                  : isSelected
                    ? c.isKind
                      ? "border-green-400 bg-green-50 text-green-900"
                      : "border-amber-400 bg-amber-50 text-amber-900"
                    : c.isKind
                      ? "border-green-200 bg-green-50/50 text-green-800 opacity-70"
                      : "border-gray-100 bg-gray-50 text-gray-500 opacity-60"
              )}
              aria-pressed={isSelected}
            >
              {c.text}
            </button>
          );
        })}
      </div>
      {choice && (
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm font-semibold",
          choice.isKind ? "bg-green-50 text-green-900 border border-green-200" : "bg-amber-50 text-amber-900 border border-amber-200"
        )}>
          {choice.isKind ? "💚 " : "💛 "}{choice.response}
        </div>
      )}
      {choice && (
        <button
          type="button"
          onClick={() => setChosen(null)}
          className="text-xs font-bold text-brand-600 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FeelingsExplorer({
  feelings,
  scenarios,
}: {
  feelings: FeelingsCard[];
  scenarios: SocialScenario[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"feelings" | "scenarios">("feelings");
  const selected = feelings.find((f) => f.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2" role="tablist">
        <button
          onClick={() => { setTab("feelings"); setSelectedId(null); }}
          role="tab"
          aria-selected={tab === "feelings"}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-bold transition-colors",
            tab === "feelings" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          💛 Feelings
        </button>
        <button
          onClick={() => setTab("scenarios")}
          role="tab"
          aria-selected={tab === "scenarios"}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-bold transition-colors",
            tab === "scenarios" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          🤝 Social Situations
        </button>
      </div>

      {tab === "feelings" && (
        <div className="space-y-5">
          {/* Grid of feeling tiles */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {feelings.map((f) => (
              <FeelingsTile
                key={f.id}
                card={f}
                onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
                selected={selectedId === f.id}
              />
            ))}
          </div>

          {/* Detail card */}
          {selected && <FeelingsDetail card={selected} />}

          {!selected && (
            <p className="text-center text-sm text-gray-500 py-4">
              Tap a feeling to learn more about it.
            </p>
          )}
        </div>
      )}

      {tab === "scenarios" && (
        <div className="space-y-5">
          <p className="text-sm text-gray-600 bg-gray-50 rounded-2xl px-4 py-3">
            Read each situation and choose what you would do. There can be more than one kind answer!
          </p>
          {scenarios.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      )}
    </div>
  );
}
