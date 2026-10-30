import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, BookOpen, Calculator, FlaskConical, Pencil, Heart, Gamepad2, Code2 } from "lucide-react";
import { SKILL_CURRICULUM } from "@/lib/skill-curriculum";
import type { SkillStage } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * Developmental Pathway Page — P2 Age-Appropriate Design.
 *
 * Shows two clearly labelled learning pathways:
 *   Stage A: Ages 4–5 (Kindergarten, stageMin 0–1)
 *   Stage B: Ages 6–7 (Grade 1–2, stageMin 1–2)
 *
 * Importantly: age is never a gate. The pathways describe skill content,
 * not prerequisites based on birth date.
 *
 * The page also shows the student's current skill states so it functions
 * as a personalised roadmap.
 */

// Pathway definitions — curated skill sets per band
const PATH_A_IDS = new Set([
  "ph-letter-names",
  "ph-letter-sounds-consonants",
  "ph-letter-sounds-vowels-short",
  "ph-phoneme-blending",
  "ph-phoneme-segmentation-cvc",
  "m-counting-to-10",
  "m-counting-to-20",
  "m-number-recognition-1-10",
  "m-comparison-to-10",
  "m-addition-to-5",
]);

const PATH_B_IDS = new Set([
  "ph-cvc-decoding",
  "ph-cvc-blending-reading",
  "ph-digraphs-sh-ch-th",
  "ph-phoneme-segmentation-ccvc",
  "m-addition-to-10",
  "m-subtraction-within-10",
  "m-addition-to-20",
  "m-place-value-tens-ones",
  "m-number-bonds-to-10",
  "r-sight-words-set1",
  "r-sentence-reading",
]);

// Activity hub links shown per pathway — not gated by stage
const PATH_A_ACTIVITIES = [
  { href: "/dashboard/learn/phonics", label: "Phonics Practice", emoji: "🔤", colour: "from-sky-400 to-blue-500" },
  { href: "/dashboard/learn/math", label: "Counting & Numbers", emoji: "🔢", colour: "from-green-400 to-emerald-500" },
  { href: "/dashboard/learn/letters", label: "Letter Formation", emoji: "✏️", colour: "from-amber-400 to-orange-500" },
  { href: "/dashboard/fun", label: "Memory Games", emoji: "🧩", colour: "from-purple-400 to-violet-500" },
  { href: "/dashboard/learn/feelings", label: "Feelings Explorer", emoji: "💛", colour: "from-pink-400 to-rose-500" },
  { href: "/dashboard/stories", label: "Story Time", emoji: "📚", colour: "from-fuchsia-400 to-purple-500" },
];

const PATH_B_ACTIVITIES = [
  { href: "/dashboard/stories/decodable", label: "Decodable Readers", emoji: "📖", colour: "from-sky-400 to-blue-500" },
  { href: "/dashboard/learn/math", label: "Addition & Subtraction", emoji: "➕", colour: "from-green-400 to-emerald-500" },
  { href: "/dashboard/learn/coding", label: "Early Coding", emoji: "🤖", colour: "from-indigo-400 to-violet-500" },
  { href: "/dashboard/learn/science", label: "Science Explore", emoji: "🔬", colour: "from-lime-400 to-green-500" },
  { href: "/dashboard/art/puzzles", label: "Logic Puzzles", emoji: "🧠", colour: "from-amber-400 to-orange-500" },
  { href: "/dashboard/stories", label: "Story Time", emoji: "📚", colour: "from-fuchsia-400 to-purple-500" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default async function PathwayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  // Load the student's skill states so we can show personalised progress
  const skillStates = await prisma.studentSkillState.findMany({
    where: { userId: session.user.id },
    select: { skillId: true, stage: true },
  });

  const masteredIds = new Set(
    skillStates.filter((s) => s.stage === "MASTERED" || s.stage === "REVIEW").map((s) => s.skillId)
  );
  const inProgressIds = new Set(skillStates.map((s) => s.skillId));

  // Count mastered skills per pathway
  const masteredA = SKILL_CURRICULUM.filter((s) => PATH_A_IDS.has(s.id) && masteredIds.has(s.id)).length;
  const masteredB = SKILL_CURRICULUM.filter((s) => PATH_B_IDS.has(s.id) && masteredIds.has(s.id)).length;
  const totalA = PATH_A_IDS.size;
  const totalB = PATH_B_IDS.size;

  function SkillBadge({ skillId }: { skillId: string }) {
    const skill = SKILL_CURRICULUM.find((s) => s.id === skillId);
    if (!skill) return null;
    const mastered = masteredIds.has(skillId);
    const started = inProgressIds.has(skillId);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "8px", background: mastered ? "#dcfce7" : started ? "#fef9c3" : "#f3f4f6", border: `1px solid ${mastered ? "#22c55e" : started ? "#fbbf24" : "#e5e7eb"}` }}>
        <span style={{ fontSize: "16px" }}>{mastered ? "✅" : started ? "🔆" : "⬜"}</span>
        <div>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "13px", color: "#1f2937" }}>{skill.name}</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>{skill.objective.slice(0, 60)}{skill.objective.length > 60 ? "…" : ""}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/play"
          className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
        >
          <ArrowLeft className="h-4 w-4" /> Learn
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🗺️ My Learning Pathway</h1>
          <p className="text-sm text-gray-500">Your personalised skill journey — explore at your own pace.</p>
        </div>
      </div>

      {/* Important note */}
      <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
        <p className="font-bold">💡 Learning goes at YOUR pace</p>
        <p className="mt-1">
          These pathways are organised by skill level, not by age. Skills in Pathway A are usually learned first — but
          you can explore any activity at any time. Your progress is unique to you!
        </p>
      </div>

      {/* Pathway A */}
      <section className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-sky-900">🌱 Pathway A — Early Foundations</h2>
            <p className="text-sm text-sky-700 mt-0.5">Letter names, sounds, counting and early number sense.</p>
            <p className="text-xs text-sky-600 mt-1">Typical starting point for ages 4–5, but start wherever feels right.</p>
          </div>
          <div className="flex-shrink-0 rounded-2xl bg-white px-3 py-2 text-center shadow-sm border border-sky-200">
            <p className="text-2xl font-extrabold text-sky-700">{masteredA}/{totalA}</p>
            <p className="text-[11px] text-sky-600 font-bold">mastered</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-sky-200 overflow-hidden">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${totalA > 0 ? (masteredA / totalA) * 100 : 0}%` }} />
        </div>

        {/* Skill list */}
        <div className="grid gap-2 sm:grid-cols-2">
          {[...PATH_A_IDS].map((id) => <SkillBadge key={id} skillId={id} />)}
        </div>

        {/* Activities */}
        <div>
          <p className="text-sm font-bold text-sky-800 mb-2">Practice activities:</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {PATH_A_ACTIVITIES.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`flex items-center gap-2 rounded-2xl bg-gradient-to-r ${a.colour} px-3 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity`}
              >
                <span className="text-xl">{a.emoji}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pathway B */}
      <section className="rounded-3xl border-2 border-violet-200 bg-violet-50 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-violet-900">🚀 Pathway B — Growing Skills</h2>
            <p className="text-sm text-violet-700 mt-0.5">Decoding words, addition, subtraction, place value and early writing.</p>
            <p className="text-xs text-violet-600 mt-1">Typical starting point for ages 6–7, but explore when you are ready.</p>
          </div>
          <div className="flex-shrink-0 rounded-2xl bg-white px-3 py-2 text-center shadow-sm border border-violet-200">
            <p className="text-2xl font-extrabold text-violet-700">{masteredB}/{totalB}</p>
            <p className="text-[11px] text-violet-600 font-bold">mastered</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-violet-200 overflow-hidden">
          <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${totalB > 0 ? (masteredB / totalB) * 100 : 0}%` }} />
        </div>

        {/* Skill list */}
        <div className="grid gap-2 sm:grid-cols-2">
          {[...PATH_B_IDS].map((id) => <SkillBadge key={id} skillId={id} />)}
        </div>

        {/* Activities */}
        <div>
          <p className="text-sm font-bold text-violet-800 mb-2">Practice activities:</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {PATH_B_ACTIVITIES.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`flex items-center gap-2 rounded-2xl bg-gradient-to-r ${a.colour} px-3 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity`}
              >
                <span className="text-xl">{a.emoji}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Legend */}
      <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 flex flex-wrap gap-4">
        <span>✅ <strong>Mastered</strong> — demonstrated independently</span>
        <span>🔆 <strong>In progress</strong> — practising now</span>
        <span>⬜ <strong>Not yet started</strong> — ready to explore</span>
      </div>
    </div>
  );
}
