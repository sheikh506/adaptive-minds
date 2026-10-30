"use client";

import { useState } from "react";
import Link from "next/link";
import type { Craft } from "@/lib/crafts";
import { awardSticker } from "@/lib/stickers";

/** Materials, steps to tick off, what-you-learn and a grown-up note. */
export default function CraftGuide({ craft }: { craft: Craft }) {
  const [done, setDone] = useState<boolean[]>(() => craft.steps.map(() => false));
  const [finished, setFinished] = useState(false);
  const all = done.every(Boolean);

  function finish() {
    awardSticker("art:craft");
    setFinished(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/dashboard/art" className="text-sm font-bold text-brand-700 hover:underline">← Art &amp; Craft</Link>

      <div className={`rounded-3xl bg-gradient-to-br ${craft.cover} p-6 text-white shadow-lg`}>
        <p className="animate-float text-6xl" aria-hidden="true">{craft.emoji}</p>
        <h1 className="mt-2 text-3xl font-bold">{craft.title}</h1>
        <p className="mt-1 text-white/95">{craft.time}</p>
      </div>

      <section className="stat-card">
        <h2 className="text-lg font-bold text-gray-900">🧺 You will need</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-800">
          {craft.materials.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </section>

      <section className="stat-card">
        <h2 className="text-lg font-bold text-gray-900">👣 Let&apos;s make it</h2>
        <ol className="mt-3 space-y-2">
          {craft.steps.map((s, i) => (
            <li key={s}>
              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 ${done[i] ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"}`}>
                <input
                  type="checkbox"
                  checked={done[i]}
                  onChange={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
                  className="mt-1 h-5 w-5 accent-green-600"
                />
                <span className="text-gray-900"><strong>Step {i + 1}.</strong> {s}</span>
              </label>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl bg-yellow-50 p-5 ring-2 ring-yellow-200">
        <h2 className="text-lg font-bold text-gray-900">💡 What you learn</h2>
        <p className="mt-1 text-gray-800">{craft.learn}</p>
      </section>

      <section className="rounded-3xl bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-200">
        <strong>For the grown-up:</strong> {craft.grownUp}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={finish}
          disabled={!all || finished}
          className="btn-chunky bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-white disabled:opacity-50"
        >
          ✅ I made it!
        </button>
        {!all && <span className="text-sm text-gray-600">Tick every step to finish.</span>}
        {finished && <span role="status" className="font-bold text-green-700">Wonderful! Check your sticker album 🎉</span>}
      </div>
    </div>
  );
}
