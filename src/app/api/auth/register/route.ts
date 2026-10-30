import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, firstIssue, DEFAULT_AVATAR } from "@/lib/validation";
import { createRateLimiter } from "@/lib/rate-limit";

// 10 sign-ups per IP per hour: enough for a classroom behind one router to be slowed, not blocked.
const limiter = createRateLimiter(10, 60 * 60 * 1000);

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (limiter.isBlocked(ip)) {
    return NextResponse.json(
      { error: "Too many accounts were created from this network. Please try again in a little while." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const { message, field } = firstIssue(parsed.error);
    return NextResponse.json({ error: message, field }, { status: 400 });
  }
  const { name, email, password, role, grade, avatar } = parsed.data;

  try {
    // Case-insensitive so legacy rows saved with capitals still count as duplicates.
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "There is already an account with this email. Try signing in instead.", field: "email" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        grade: role === "STUDENT" ? grade : undefined,
        // Emoji avatar only: we never store photos of children.
        image: role === "STUDENT" ? avatar ?? DEFAULT_AVATAR : undefined,
      },
    });
    limiter.hit(ip);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    // Unique-constraint race: two sign-ups with the same email at the same moment.
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "There is already an account with this email. Try signing in instead.", field: "email" },
        { status: 409 }
      );
    }
    console.error("register failed", e);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
  }
}
