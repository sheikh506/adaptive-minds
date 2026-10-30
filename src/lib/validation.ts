/**
 * Shared, framework-free validation for account creation and profile edits.
 * Used by the register API, server actions and the sign-up form so the rules never drift apart.
 */
import { z } from "zod";

export const GRADES = ["K", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G12"] as const;
export const ROLES = ["STUDENT", "TEACHER", "PARENT"] as const;

/** Avatars are plain emoji (no photo upload, so no child ever shares a picture of themselves). */
export const AVATARS = ["🦊", "🐼", "🦁", "🐯", "🐸", "🐵", "🦄", "🐙", "🐢", "🦉", "🐬", "🚀"] as const;
export const DEFAULT_AVATAR = AVATARS[0];

const COMMON_PASSWORDS = new Set([
  "password", "password1", "password12", "password123", "passw0rd", "12345678", "123456789", "1234567890",
  "123123123", "11111111", "00000000", "qwerty123", "qwertyuiop", "abc12345", "abcd1234", "iloveyou",
  "letmein1", "welcome1", "admin123", "1q2w3e4r", "football1", "baseball1", "princess1", "superman1",
  "minecraft", "roblox123", "fortnite1", "sunshine1",
]);

export function isCommonPassword(pw: string): boolean {
  const lower = pw.toLowerCase();
  return COMMON_PASSWORDS.has(lower) || /^(.)\1+$/.test(lower);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Letters (any language), digits, spaces, apostrophes, dots and hyphens. Built with RegExp() so the
// Unicode property escapes do not depend on the TypeScript compile target.
const NAME_RE = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M}\\p{N} '.\\-]*$", "u");

export const NAME_HELP = "Use your first name or a nickname. Please don't share your last name.";

export const nameSchema = z
  .string({ required_error: "Please tell us what to call you." })
  .transform((s) => s.trim().replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(2, "Your name needs at least 2 letters.")
      .max(40, "That name is a bit long. Try a shorter one.")
      .regex(NAME_RE, "Names can only use letters, numbers, spaces, - and '.")
      .refine((s) => !/\d{5,}/.test(s), "Please don't put phone numbers in your name.")
      .refine((s) => !/https?|www\.|\.(com|net|org)\b/i.test(s), "Please don't put web addresses in your name.")
  );

export const emailSchema = z
  .string({ required_error: "Please enter an email." })
  .trim()
  .toLowerCase()
  .max(254, "That email is too long.")
  .email("That doesn't look like an email address.");

export const passwordSchema = z
  .string({ required_error: "Please choose a password." })
  .min(8, "Your password needs at least 8 characters.")
  .max(72, "Your password can be at most 72 characters.")
  .refine((pw) => !isCommonPassword(pw), "That password is too easy to guess. Try the magic password button!");

export const avatarSchema = z.enum(AVATARS, { errorMap: () => ({ message: "Please pick one of the animals." }) });

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(ROLES, { errorMap: () => ({ message: "Please choose who you are." }) }),
    grade: z.enum(GRADES, { errorMap: () => ({ message: "Please pick your grade." }) }).optional(),
    avatar: avatarSchema.optional(),
    consent: z.boolean().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.role === "STUDENT") {
      if (!d.grade) ctx.addIssue({ code: "custom", path: ["grade"], message: "Please pick your grade." });
      if (d.consent !== true) {
        ctx.addIssue({
          code: "custom",
          path: ["consent"],
          message: "A parent, guardian or teacher needs to say it's OK first.",
        });
      }
    }
    const pw = d.password.toLowerCase();
    if (pw === d.email.split("@")[0] || pw === d.name.toLowerCase().replace(/\s/g, "")) {
      ctx.addIssue({ code: "custom", path: ["password"], message: "Your password can't be the same as your name or email." });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/** First human-readable problem from a failed parse, plus the field it belongs to. */
export function firstIssue(error: z.ZodError): { message: string; field: string } {
  const issue = error.issues[0];
  return { message: issue?.message ?? "Please check the form and try again.", field: String(issue?.path[0] ?? "") };
}

// ─── Magic password ("Happy-Panda-Jumps-42") ────────────────────────────────

const WORDS_A = ["Happy", "Brave", "Sunny", "Clever", "Jolly", "Swift", "Gentle", "Cosmic", "Fuzzy", "Lucky", "Mighty", "Silly", "Bright", "Calm", "Proud", "Zippy"];
const WORDS_B = ["Panda", "Tiger", "Otter", "Rocket", "Dragon", "Koala", "Falcon", "Turtle", "Penguin", "Dolphin", "Wizard", "Robot", "Comet", "Maple", "River", "Pickle"];
const WORDS_C = ["Jumps", "Dances", "Climbs", "Sings", "Glows", "Races", "Smiles", "Flies", "Paints", "Builds", "Reads", "Swims", "Spins", "Waves", "Hops", "Zooms"];

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] % max;
}

/** Easy to read aloud and remember, ~20 bits of entropy; online guessing is rate limited server-side. */
export function generateMagicPassword(): string {
  const pick = (list: string[]) => list[randomInt(list.length)];
  return `${pick(WORDS_A)}-${pick(WORDS_B)}-${pick(WORDS_C)}-${10 + randomInt(90)}`;
}
