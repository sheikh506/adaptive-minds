/**
 * Minimal email sender using the Resend HTTP API (https://resend.com).
 * Without RESEND_API_KEY nothing is sent — the caller is told so, instead of silently pretending.
 */
export interface SendResult {
  sent: boolean;
  reason?: string;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: "RESEND_API_KEY is not configured" };

  const from = process.env.EMAIL_FROM ?? "AdaptiveMinds <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, ...params }),
  });
  if (!res.ok) return { sent: false, reason: `Resend responded ${res.status}: ${await res.text()}` };
  return { sent: true };
}
