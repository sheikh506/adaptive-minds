/**
 * DELETE /api/account/delete
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * A parent account deletion does NOT delete linked children's accounts.
 * A child account deletion preserves teacher/classroom records (anonymised by cascade).
 *
 * The Prisma schema uses onDelete: Cascade on all user relations so a single
 * User deletion removes: sessions, accounts, progress, exercise sessions,
 * badges, notifications, practice goals and parent–child links.
 *
 * Rate-limited to 3 requests per 15 minutes per user to prevent accidental
 * looping from a buggy client.
 */

import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";

const deleteLimit = createRateLimiter(3, 15 * 60 * 1000);

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  if (deleteLimit.isBlocked(userId)) {
    return NextResponse.json(
      { error: "Too many deletion requests. Please wait a few minutes." },
      { status: 429 }
    );
  }
  deleteLimit.hit(userId);

  // Require the user to confirm by sending { "confirm": true } in the body.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!(body && typeof body === "object" && (body as Record<string, unknown>).confirm === true)) {
    return NextResponse.json(
      { error: "Send { \"confirm\": true } to confirm account deletion. This cannot be undone." },
      { status: 400 }
    );
  }

  // Delete the user. Cascade handles all child records.
  await prisma.user.delete({ where: { id: userId } });

  // Return success. The session cookie will become invalid on the next request.
  return NextResponse.json(
    { success: true, message: "Your account and all associated data have been permanently deleted." },
    { status: 200 }
  );
}
