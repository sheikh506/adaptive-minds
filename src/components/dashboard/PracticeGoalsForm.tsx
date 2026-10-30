"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { savePracticeGoals } from "@/app/actions/manage";
import { PRACTICE_MINUTE_CHOICES } from "@/lib/game";

interface TopicRow {
  id: string;
  name: string;
  subject: "MATH" | "READING" | "SCIENCE";
  icon: string | null;
  minutes: number;
}

const label = (m: number) => (m === 0 ? "Rest (no practice)" : `${m} min`);

/** A parent chooses how long a child practises each skill per day. */
export default function PracticeGoalsForm({ childId, topics }: { childId: string; topics: TopicRow[] }) {
  const [values, setValues] = useState<Record<string, number>>(() => Object.fromEntries(topics.map((t) => [t.id, t.minutes])));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const total = Object.values(values).reduce((a, b) => a + b, 0);

  function setAll(minutes: number) {
    setValues(Object.fromEntries(topics.map((t) => [t.id, minutes])));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("childId", childId);
    for (const t of topics) fd.set(`minutes:${t.id}`, String(values[t.id]));
    startTransition(async () => {
      try {
        const r = await savePracticeGoals(fd);
        setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: r.success ?? "Saved!" });
      } catch {
        setMsg({ ok: false, text: "Something went wrong. Please try again." });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-gray-500">Set all skills to:</span>
        {[5, 10, 15, 20].map((m) => (
          <button key={m} type="button" onClick={() => setAll(m)} className="rounded-full border border-border px-3 py-1 font-semibold text-gray-700 hover:bg-gray-50">
            {m} min
          </button>
        ))}
      </div>

      {(["MATH", "READING", "SCIENCE"] as const).map((subject) => (
        <fieldset key={subject}>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
            {subject === "MATH" ? "Math" : subject === "READING" ? "Reading" : "Science"}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {topics
              .filter((t) => t.subject === subject)
              .map((t) => (
                <label key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm">
                  <span className="font-medium text-gray-800">
                    <span aria-hidden="true">{t.icon ?? "📘"}</span> {t.name}
                  </span>
                  <select
                    value={values[t.id]}
                    onChange={(e) => setValues((v) => ({ ...v, [t.id]: Number(e.target.value) }))}
                    aria-label={`Daily minutes for ${t.name}`}
                    className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                  >
                    {PRACTICE_MINUTE_CHOICES.map((m) => (
                      <option key={m} value={m}>
                        {label(m)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
          </div>
        </fieldset>
      ))}

      <p className="text-sm text-gray-600">
        Total: <strong>{total} minutes a day</strong> if every skill is practised. Questions keep coming, getting easier or harder
        as your child answers, until each skill&apos;s time is used. Then the app says well done.
      </p>

      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`rounded-xl px-4 py-2.5 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}
      <button type="submit" disabled={pending} className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Save practice time
      </button>
    </form>
  );
}
