"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LetterFormation } from "@/lib/letter-formation";

function LetterCard({ lf }: { lf: LetterFormation }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 p-4 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        aria-expanded={open}
      >
        {/* Large letter display */}
        <div className="flex flex-shrink-0 flex-col items-center gap-0.5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-4xl font-extrabold text-brand-700 leading-none">
            {lf.lower}
          </span>
          <span className="text-xs font-bold text-gray-400">{lf.letter}</span>
        </div>
        {/* Verbal cue preview */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{lf.verbCue}</p>
        </div>
        <span className="text-gray-400 text-sm flex-shrink-0" aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          {/* Steps */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">How to write it</p>
            <ol className="space-y-1.5">
              {lf.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-800">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-extrabold text-brand-700">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Verbal cue */}
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3">
            <p className="text-xs font-bold text-yellow-700 mb-1">🗣️ Say while you write</p>
            <p className="text-sm font-semibold text-yellow-900 italic">"{lf.verbCue}"</p>
          </div>

          {/* Common error */}
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-xs font-bold text-red-700 mb-1">⚠️ Watch out for</p>
            <p className="text-sm text-red-900">{lf.commonError}</p>
            <p className="mt-1 text-sm font-semibold text-red-800">✅ Fix it: {lf.correction}</p>
          </div>

          {/* Practice prompt */}
          <div className="rounded-xl bg-brand-50 px-4 py-3">
            <p className="text-sm font-bold text-brand-800">Practice: write the letter 5 times, saying the cue each time. Then write a word that starts with <strong>{lf.letter}</strong>.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LetterFormationGuide({ groups }: { groups: Record<string, LetterFormation[]> }) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const groupNames = Object.keys(groups);

  return (
    <div className="space-y-6">
      {/* Group filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Letter groups">
        <button
          onClick={() => setActiveGroup(null)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-bold transition-colors",
            activeGroup === null ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
          role="tab"
          aria-selected={activeGroup === null}
        >
          All letters
        </button>
        {groupNames.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-bold transition-colors",
              activeGroup === g ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            role="tab"
            aria-selected={activeGroup === g}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Letter cards */}
      {groupNames
        .filter((g) => activeGroup === null || g === activeGroup)
        .map((g) => (
          <section key={g} aria-labelledby={`group-${g}`}>
            <h2 id={`group-${g}`} className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-500">
              {g}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {groups[g].map((lf) => (
                <LetterCard key={lf.letter} lf={lf} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
