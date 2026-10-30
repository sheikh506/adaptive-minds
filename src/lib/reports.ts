/**
 * Weekly report generation. The summarising/rendering functions are pure so they can be unit tested;
 * `collectWeeklyReports` is the only part that touches the database.
 */
import { prisma } from "@/lib/prisma";

export interface SessionInput {
  correct: boolean;
  timeTaken: number;
  xpEarned: number;
  completedAt: Date;
  topicName: string;
}

export interface StudentWeekSummary {
  studentId: string;
  name: string;
  answered: number;
  correct: number;
  accuracy: number | null; // 0-100, null when nothing answered
  xpEarned: number;
  activeDays: number;
  /** avgSeconds removed: response time must not be used as a proxy for ability. */
  streakDays: number;
  topics: { name: string; answered: number; accuracy: number }[];
  strongest?: string;
  weakest?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function summarizeStudent(
  student: { id: string; name: string | null; streakDays: number },
  sessions: SessionInput[]
): StudentWeekSummary {
  const answered = sessions.length;
  const correct = sessions.filter((s) => s.correct).length;
  const byTopic = new Map<string, { answered: number; correct: number }>();
  for (const s of sessions) {
    const t = byTopic.get(s.topicName) ?? { answered: 0, correct: 0 };
    t.answered += 1;
    if (s.correct) t.correct += 1;
    byTopic.set(s.topicName, t);
  }
  const topics = [...byTopic.entries()]
    .map(([name, t]) => ({
      name,
      answered: t.answered,
      accuracy: Math.round((t.correct / t.answered) * 100),
    }))
    .sort((a, b) => b.accuracy - a.accuracy || b.answered - a.answered);

  // Only call something a strength/weakness when there is enough data (>= 3 answers)
  const enough = topics.filter((t) => t.answered >= 3);
  const strongest = enough.length ? enough[0].name : undefined;
  const weakest =
    enough.length > 1 && enough[enough.length - 1].accuracy < 70
      ? enough[enough.length - 1].name
      : undefined;

  return {
    studentId: student.id,
    name: student.name ?? "Student",
    answered,
    correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
    xpEarned: sessions.reduce((sum, s) => sum + s.xpEarned, 0),
    activeDays: new Set(sessions.map((s) => s.completedAt.toISOString().slice(0, 10))).size,
    streakDays: student.streakDays,
    topics,
    strongest,
    weakest,
  };
}

/** A student "needs support" with at least 5 answers and under 60% accuracy. */
export function needsSupport(s: StudentWeekSummary): boolean {
  return s.accuracy !== null && s.answered >= 5 && s.accuracy < 60;
}

const wrap = (title: string, body: string) =>
  `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:auto;color:#1f2328">` +
  `<h2 style="color:#2563eb">${escapeHtml(title)}</h2>${body}` +
  `<p style="color:#888;font-size:12px;margin-top:24px">Sent by AdaptiveMinds.</p></div>`;

export function renderParentEmail(parentName: string, kids: StudentWeekSummary[]): RenderedEmail {
  const subject = `Weekly learning report${kids.length === 1 ? ` for ${kids[0].name}` : ""}`;
  const textLines: string[] = [`Hi ${parentName},`, "", "Here is last week's learning summary:", ""];
  let html = `<p>Hi ${escapeHtml(parentName)}, here is last week's learning summary:</p>`;

  for (const k of kids) {
    if (k.answered === 0) {
      textLines.push(`${k.name}: no practice this week. A few minutes a day makes a big difference!`, "");
      html += `<h3>${escapeHtml(k.name)}</h3><p>No practice this week. A few minutes a day makes a big difference!</p>`;
      continue;
    }
    textLines.push(
      `${k.name}: ${k.answered} questions, ${k.accuracy}% correct, ${k.xpEarned} XP, active ${k.activeDays} day(s), streak ${k.streakDays} day(s).`
    );
    if (k.strongest) textLines.push(`  Strongest topic: ${k.strongest}`);
    if (k.weakest) textLines.push(`  Could use practice: ${k.weakest}`);
    textLines.push("");
    html +=
      `<h3>${escapeHtml(k.name)}</h3><ul>` +
      `<li><b>${k.answered}</b> questions answered, <b>${k.accuracy}%</b> correct</li>` +
      `<li>Active <b>${k.activeDays}</b> day(s) this week</li>` +
      `<li>Current streak: <b>${k.streakDays}</b> day(s)</li>` +
      (k.strongest ? `<li>Strongest topic: ${escapeHtml(k.strongest)}</li>` : "") +
      (k.weakest ? `<li>Could use practice: ${escapeHtml(k.weakest)}</li>` : "") +
      `</ul>`;
  }
  return { subject, html: wrap("Weekly learning report", html), text: textLines.join("\n") };
}

export function renderTeacherEmail(
  teacherName: string,
  classrooms: { name: string; students: StudentWeekSummary[] }[]
): RenderedEmail {
  const subject = "Weekly class report";
  const textLines: string[] = [`Hi ${teacherName},`, "", "Here is last week's class summary:", ""];
  let html = `<p>Hi ${escapeHtml(teacherName)}, here is last week's class summary:</p>`;

  for (const c of classrooms) {
    const active = c.students.filter((s) => s.answered > 0);
    const inactive = c.students.filter((s) => s.answered === 0);
    const support = c.students.filter(needsSupport);
    const avg = active.length
      ? Math.round(active.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) / active.length)
      : null;

    textLines.push(
      `${c.name}: ${c.students.length} students, ${active.length} active, class accuracy ${avg === null ? "n/a" : avg + "%"}.`
    );
    html +=
      `<h3>${escapeHtml(c.name)}</h3><p>${c.students.length} students, ${active.length} active, ` +
      `class accuracy <b>${avg === null ? "n/a" : avg + "%"}</b></p>`;

    if (support.length) {
      textLines.push(`  Need support: ${support.map((s) => `${s.name} (${s.accuracy}%)`).join(", ")}`);
      html += `<p><b>Need support:</b> ${support.map((s) => `${escapeHtml(s.name)} (${s.accuracy}%)`).join(", ")}</p>`;
    }
    if (inactive.length) {
      textLines.push(`  No activity: ${inactive.map((s) => s.name).join(", ")}`);
      html += `<p><b>No activity:</b> ${inactive.map((s) => escapeHtml(s.name)).join(", ")}</p>`;
    }
    textLines.push("");
  }
  return { subject, html: wrap("Weekly class report", html), text: textLines.join("\n") };
}

export interface PlannedReport {
  to: string;
  role: "PARENT" | "TEACHER";
  email: RenderedEmail;
}

/** Builds every report due for the period [since, now]. Does not send anything. */
export async function collectWeeklyReports(since: Date): Promise<PlannedReport[]> {
  const sessions = await prisma.exerciseSession.findMany({
    where: { completedAt: { gte: since } },
    select: {
      userId: true,
      correct: true,
      timeTaken: true,
      xpEarned: true,
      completedAt: true,
      exercise: { select: { topic: { select: { name: true } } } },
    },
  });
  const byUser = new Map<string, SessionInput[]>();
  for (const s of sessions) {
    const list = byUser.get(s.userId) ?? [];
    list.push({
      correct: s.correct,
      timeTaken: s.timeTaken,
      xpEarned: s.xpEarned,
      completedAt: s.completedAt,
      topicName: s.exercise.topic.name,
    });
    byUser.set(s.userId, list);
  }
  const summaryFor = (u: { id: string; name: string | null; streakDays: number }) =>
    summarizeStudent(u, byUser.get(u.id) ?? []);

  const reports: PlannedReport[] = [];

  const parents = await prisma.user.findMany({
    where: { role: "PARENT", email: { not: null }, children: { some: {} } },
    include: { children: { include: { child: true } } },
  });
  for (const p of parents) {
    reports.push({
      to: p.email!,
      role: "PARENT",
      email: renderParentEmail(p.name ?? "there", p.children.map((c) => summaryFor(c.child))),
    });
  }

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", email: { not: null }, classroomsAsTeacher: { some: {} } },
    include: {
      classroomsAsTeacher: { include: { enrollments: { include: { student: true } } } },
    },
  });
  for (const t of teachers) {
    reports.push({
      to: t.email!,
      role: "TEACHER",
      email: renderTeacherEmail(
        t.name ?? "there",
        t.classroomsAsTeacher.map((c) => ({
          name: c.name,
          students: c.enrollments.map((e) => summaryFor(e.student)),
        }))
      ),
    });
  }
  return reports;
}
