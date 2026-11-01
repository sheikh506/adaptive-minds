import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Code2 } from "lucide-react";
import CodingGame from "@/components/learn/CodingGame";

export const dynamic = "force-dynamic";

/**
 * Early Coding hub — block-based robot sequencing.
 *
 * Objectives:
 * - Understand that computers follow step-by-step instructions.
 * - Experience the idea of sequence (order matters).
 * - Develop planning and debugging habits of mind.
 *
 * P2 Developmental Learning. Suitable for ages 5–7.
 */

export default async function CodingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/play"
          className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🤖 Early Coding</h1>
          <p className="text-sm text-gray-500">Give the robot step-by-step instructions to reach the star.</p>
        </div>
      </div>

      {/* What is coding? */}
      <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-sm text-indigo-900">
        <p className="font-bold">💡 What is coding?</p>
        <p className="mt-1">
          Coding means giving a computer a list of instructions to follow — one step at a time.
          The computer does <em>exactly</em> what you say, in the order you say it.
          If the robot goes the wrong way, look at your program and fix it — that is called <strong>debugging</strong>!
        </p>
      </div>

      {/* Game */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6">
        <CodingGame />
      </div>

      {/* Learning notes */}
      <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4 text-sm text-violet-900">
        <p className="font-bold">🧠 What you are learning</p>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          <li><strong>Sequence</strong> — instructions must be in the right order.</li>
          <li><strong>Debugging</strong> — when something goes wrong, read your program and find the mistake.</li>
          <li><strong>Decomposition</strong> — break a big journey into small steps.</li>
          <li><strong>Logical thinking</strong> — think ahead before you run the program.</li>
        </ul>
      </div>

      {/* Parent note */}
      <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-xs text-gray-600">
        <p className="font-bold text-gray-800">👋 For parents and carers</p>
        <p className="mt-1">
          This activity supports early computational thinking — sequencing, planning and debugging — without any screen-based programming syntax.
          The block-based approach is widely used in Early Years and KS1 computing curricula.
          Encourage your child to say each step aloud before pressing Run: &quot;first right, then down…&quot;.
        </p>
      </div>
    </div>
  );
}
