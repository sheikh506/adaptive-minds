"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GRADES, nameSchema, avatarSchema, normalizeEmail } from "@/lib/validation";
import { createSharedRateLimiter } from "@/lib/rate-limit";
import { PRACTICE_MINUTE_CHOICES } from "@/lib/game";

// Linking asks for a child's password, so it must not be usable as a password-guessing oracle.
const linkAttempts = createSharedRateLimiter("link", 5, 15 * 60 * 1000);

export type FormState = { error?: string; success?: string };

async function requireUser(role?: "STUDENT" | "TEACHER" | "PARENT") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (role && session.user.role !== role) throw new Error("Not allowed");
  return session.user.id;
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export async function createClassroom(formData: FormData): Promise<FormState> {
  const teacherId = await requireUser("TEACHER");
  const parsed = z
    .object({ name: z.string().trim().min(2).max(60), grade: z.enum(GRADES) })
    .safeParse({ name: formData.get("name"), grade: formData.get("grade") });
  if (!parsed.success) return { error: "Please enter a class name and grade." };

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await prisma.classroom.create({
        data: { ...parsed.data, teacherId, code: generateCode() },
      });
      revalidatePath("/dashboard", "layout");
      return { success: "Classroom created!" };
    } catch {
      // join-code collision: retry with a new code
    }
  }
  return { error: "Could not create classroom. Please try again." };
}

export async function joinClassroom(formData: FormData): Promise<FormState> {
  const studentId = await requireUser("STUDENT");
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { error: "Enter a join code." };

  const classroom = await prisma.classroom.findUnique({ where: { code } });
  if (!classroom) return { error: "No classroom found with that code." };

  await prisma.enrollment.upsert({
    where: { studentId_classroomId: { studentId, classroomId: classroom.id } },
    update: {},
    create: { studentId, classroomId: classroom.id },
  });
  revalidatePath("/dashboard", "layout");
  return { success: `You joined ${classroom.name}!` };
}

/**
 * A parent links a child by entering the child's email AND password.
 * Requiring the child's password prevents anyone from viewing a stranger's data.
 */
export async function linkChild(formData: FormData): Promise<FormState> {
  const parentId = await requireUser("PARENT");
  if (await linkAttempts.isBlocked(parentId)) {
    return { error: "Too many tries. Please wait a few minutes and try again." };
  }
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter your child's email and password." };

  const child = await prisma.user.findFirst({
    where: { email: { equals: normalizeEmail(parsed.data.email), mode: "insensitive" } },
  });
  const ok =
    child && child.role === "STUDENT" && child.password
      ? await bcrypt.compare(parsed.data.password, child.password)
      : false;
  if (!child || !ok) {
    await linkAttempts.hit(parentId);
    return { error: "Email or password is incorrect, or this is not a student account." };
  }

  await prisma.parentChild.upsert({
    where: { parentId_childId: { parentId, childId: child.id } },
    update: {},
    create: { parentId, childId: child.id },
  });
  revalidatePath("/dashboard", "layout");
  return { success: `${child.name} was linked to your account.` };
}

export async function unlinkChild(formData: FormData) {
  const parentId = await requireUser("PARENT");
  const childId = String(formData.get("childId") ?? "");
  await prisma.parentChild.deleteMany({ where: { parentId, childId } });
  revalidatePath("/dashboard", "layout");
}

/**
 * A parent chooses how many minutes per day their child practises each skill.
 * Form fields are named `minutes:<topicId>`. Only linked children can be changed.
 */
export async function savePracticeGoals(formData: FormData): Promise<FormState> {
  const parentId = await requireUser("PARENT");
  const childId = String(formData.get("childId") ?? "");
  const link = await prisma.parentChild.findUnique({ where: { parentId_childId: { parentId, childId } } });
  if (!link) return { error: "That child is not linked to your account." };

  const topics = await prisma.topic.findMany({ select: { id: true } });
  const allowed = new Set<number>(PRACTICE_MINUTE_CHOICES);
  const updates: { topicId: string; minutes: number }[] = [];
  for (const t of topics) {
    const raw = formData.get(`minutes:${t.id}`);
    if (raw === null) continue;
    const minutes = Number(raw);
    if (!Number.isInteger(minutes) || !allowed.has(minutes)) return { error: "Please pick one of the listed times." };
    updates.push({ topicId: t.id, minutes });
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.practiceGoal.upsert({
        where: { childId_topicId: { childId, topicId: u.topicId } },
        update: { minutes: u.minutes },
        create: { childId, topicId: u.topicId, minutes: u.minutes },
      })
    )
  );
  revalidatePath("/dashboard", "layout");
  return { success: "Saved! Your child's daily practice time is updated." };
}

export async function updateProfile(formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: name.error.issues[0]?.message ?? "Please check the name." };

  const data: { name: string; image?: string } = { name: name.data };
  if (session.user.role === "STUDENT" && formData.has("avatar")) {
    const avatar = avatarSchema.safeParse(formData.get("avatar"));
    if (!avatar.success) return { error: "Please pick one of the animals." };
    data.image = avatar.data;
  }
  await prisma.user.update({ where: { id: userId }, data });
  revalidatePath("/dashboard", "layout");
  return { success: "Profile updated." };
}

export async function markNotificationsRead() {
  const userId = await requireUser();
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  revalidatePath("/dashboard", "layout");
}
