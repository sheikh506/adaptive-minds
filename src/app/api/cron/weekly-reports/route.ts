import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { collectWeeklyReports } from "@/lib/reports";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // refuse everything if no secret is configured
  const given = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`.
 * `?dryRun=1` builds the reports and returns them without sending anything.
 */
export async function GET(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const reports = await collectWeeklyReports(since);

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      count: reports.length,
      reports: reports.map((r) => ({ to: r.to, role: r.role, subject: r.email.subject, text: r.email.text })),
    });
  }

  const results = [];
  for (const r of reports) {
    const outcome = await sendEmail({ to: r.to, ...r.email });
    results.push({ to: r.to, role: r.role, ...outcome });
  }
  return NextResponse.json({
    dryRun: false,
    attempted: results.length,
    sent: results.filter((r) => r.sent).length,
    results,
  });
}
