"use client";

/**
 * SkillMasteryMap
 *
 * Displays a child's skill mastery state across all subjects for the Parent
 * Learning Companion. Data is sourced entirely from SkillAttempt and
 * StudentSkillState rows — no XP, stars or streaks are used to infer learning.
 *
 * Designed to be readable at a glance and accessible.
 */

import { useState } from "react";
import type { ChildCompanionData, SubjectSkillMap, SkillMasteryEntry } from "@/lib/parent-companion";

// ─── Stage badge colours ──────────────────────────────────────────────────────

const STAGE_COLOUR: Record<string, string> = {
  TEACH: "bg-gray-100 text-gray-600",
  GUIDED_PRACTICE: "bg-sky-100 text-sky-800",
  INDEPENDENT: "bg-amber-100 text-amber-800",
  MASTERY_CHECK: "bg-purple-100 text-purple-800",
  MASTERED: "bg-green-100 text-green-800",
  REVIEW: "bg-teal-100 text-teal-800",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkillRow({ skill }: { skill: SkillMasteryEntry }) {
  const [open, setOpen] = useState(false);
  const hasActivity = skill.totalAttempts > 0;
  const acc = hasActivity ? Math.round((skill.correctAttempts / skill.totalAttempts) * 100) : null;

  return (
    <li className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        aria-expanded={open}
        aria-label={`${skill.skillName}: ${skill.badge}. ${open ? "Collapse" : "Expand"} details.`}
      >
        <span className="text-xl flex-shrink-0" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-gray-900">{skill.skillName}</span>
          {hasActivity && (
            <span className="text-xs text-gray-500">
              {skill.correctAttempts}/{skill.totalAttempts} correct
              {acc !== null && ` (${acc}%)`}
            </span>
          )}
        </span>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${STAGE_COLOUR[skill.stage] ?? "bg-gray-100 text-gray-600"}`}>
          {skill.badge}
        </span>
      </button>

      {open && (
        <div className="px-12 pb-4 text-sm text-gray-700 space-y-1">
          <p>{skill.detail}</p>
          {skill.masteredAt && (
            <p className="text-green-700 font-medium">
              Demonstrated with unseen questions on {new Date(skill.masteredAt).toLocaleDateString()}.
            </p>
          )}
          {skill.nextReviewAt && skill.stage === "REVIEW" && (
            <p className="text-teal-700">
              Next review: {new Date(skill.nextReviewAt).toLocaleDateString()}.
            </p>
          )}
          {!hasActivity && (
            <p className="text-gray-400 italic">No practice recorded yet for this skill.</p>
          )}
        </div>
      )}
    </li>
  );
}

function SubjectPanel({ map }: { map: SubjectSkillMap }) {
  const [expanded, setExpanded] = useState(false);
  const hasActivity = map.started > 0;

  return (
    <section className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Subject header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 p-5 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        aria-expanded={expanded}
      >
        <span className="text-2xl flex-shrink-0" aria-hidden="true">{map.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{map.label}</p>
          <p className="text-xs text-gray-500">
            {hasActivity
              ? `${map.mastered} mastered · ${map.started} started · ${map.skills.length} total skills`
              : `${map.skills.length} skills available — not yet started`}
          </p>
        </div>
        {/* Mini progress bar */}
        <div className="flex-shrink-0 w-24">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${map.skills.length > 0 ? Math.round((map.mastered / map.skills.length) * 100) : 0}%` }}
              role="presentation"
            />
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-0.5">
            {map.skills.length > 0 ? Math.round((map.mastered / map.skills.length) * 100) : 0}% mastered
          </p>
        </div>
        <span className="text-gray-400 text-sm" aria-hidden="true">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Skill list */}
      {expanded && (
        <ul className="border-t border-gray-100">
          {map.skills.map((skill) => (
            <SkillRow key={skill.skillId} skill={skill} />
          ))}
        </ul>
      )}
    </section>
  );
}

function NextStepCard({
  step,
}: {
  step: ChildCompanionData["nextSteps"][number];
}) {
  const SUBJECT_EMOJI: Record<string, string> = { MATH: "🔢", READING: "📚", SCIENCE: "🔬" };
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">{SUBJECT_EMOJI[step.subject] ?? "🎯"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{step.skillName}</p>
          <p className="text-xs text-gray-600 mt-0.5">{step.reason}</p>
          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 mb-1">
              🏠 Try at home
            </p>
            <p className="text-xs text-amber-900">{step.offlineActivity}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SkillMasteryMap({ data }: { data: ChildCompanionData }) {
  return (
    <div className="space-y-6">
      {/* Summary narrative */}
      <div className="rounded-2xl bg-brand-50 border border-brand-100 px-5 py-4">
        <p className="text-sm font-semibold text-brand-900 leading-relaxed">{data.narrative}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Stat label="Skills mastered" value={data.totalMastered} colour="text-green-700" />
          <Stat label="In progress" value={data.totalInProgress} colour="text-amber-700" />
          <Stat label="Sessions this week" value={data.weeklySessionCount} colour="text-brand-700" />
        </div>
      </div>

      {/* Recommended next steps */}
      {data.nextSteps.length > 0 && (
        <section aria-labelledby="next-steps-heading">
          <h3 id="next-steps-heading" className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Recommended next steps
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.nextSteps.map((step) => (
              <NextStepCard key={step.skillId} step={step} />
            ))}
          </div>
        </section>
      )}

      {/* Subject skill maps */}
      <section aria-labelledby="skill-map-heading">
        <h3 id="skill-map-heading" className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
          Skill mastery map
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          ⭐ Mastered = demonstrated correctly on unseen questions. 
          Attempts, practice and mastery are tracked separately.
        </p>
        <div className="space-y-4">
          {data.subjectMaps.map((map) => (
            <SubjectPanel key={map.subject} map={map} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg font-extrabold ${colour}`}>{value}</span>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}
