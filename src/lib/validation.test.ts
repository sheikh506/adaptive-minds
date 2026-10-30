import { describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rate-limit";
import {
  AVATARS,
  firstIssue,
  generateMagicPassword,
  isCommonPassword,
  nameSchema,
  normalizeEmail,
  passwordSchema,
  registerSchema,
} from "./validation";

const good = {
  name: "Alex",
  email: "Alex@Example.com ",
  password: "Sunny-Day-42",
  role: "STUDENT",
  grade: "G3",
  avatar: AVATARS[1],
  consent: true,
};

describe("registerSchema", () => {
  it("accepts a valid student and normalises the email", () => {
    const r = registerSchema.safeParse(good);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("alex@example.com");
  });

  it("rejects ADMIN and unknown roles", () => {
    expect(registerSchema.safeParse({ ...good, role: "ADMIN" }).success).toBe(false);
  });

  it("rejects an invalid grade instead of letting the DB fail", () => {
    const r = registerSchema.safeParse({ ...good, grade: "ZZZ" });
    expect(r.success).toBe(false);
  });

  it("requires a grade and parental consent for students only", () => {
    const noGrade = registerSchema.safeParse({ ...good, grade: undefined });
    expect(noGrade.success).toBe(false);
    const noConsent = registerSchema.safeParse({ ...good, consent: false });
    expect(noConsent.success).toBe(false);
    if (!noConsent.success) expect(firstIssue(noConsent.error).field).toBe("consent");
    expect(registerSchema.safeParse({ ...good, role: "PARENT", grade: undefined, consent: undefined }).success).toBe(true);
  });

  it("rejects passwords equal to the name or email", () => {
    expect(registerSchema.safeParse({ ...good, password: "alexalex1", name: "alexalex1" }).success).toBe(false);
  });

  it("rejects avatars outside the allow-list", () => {
    expect(registerSchema.safeParse({ ...good, avatar: "http://evil.example/x.png" }).success).toBe(false);
  });
});

describe("nameSchema", () => {
  it("trims and collapses whitespace", () => {
    expect(nameSchema.parse("  Mary   Jane ")).toBe("Mary Jane");
  });
  it.each(["  ", "A", "<script>alert(1)</script>", "kid@mail.com", "call 5551234567", "www.site.com", "x".repeat(41)])(
    "rejects %j",
    (bad) => expect(nameSchema.safeParse(bad).success).toBe(false)
  );
  it.each(["Zoë", "José", "O'Neil", "Anne-Marie", "李明", "Mr. Lee"])("accepts %j", (ok) =>
    expect(nameSchema.safeParse(ok).success).toBe(true)
  );
});

describe("passwords", () => {
  it("flags common passwords", () => {
    expect(isCommonPassword("Password123")).toBe(true);
    expect(isCommonPassword("aaaaaaaa")).toBe(true);
    expect(passwordSchema.safeParse("password").success).toBe(false);
  });
  it("enforces length bounds (bcrypt ignores bytes after 72)", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("a1".repeat(40)).success).toBe(false);
  });
  it("generated magic passwords always pass validation", () => {
    for (let i = 0; i < 200; i++) expect(passwordSchema.safeParse(generateMagicPassword()).success).toBe(true);
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => expect(normalizeEmail("  A@B.Com ")).toBe("a@b.com"));
});

describe("createRateLimiter", () => {
  it("blocks after the limit and recovers after the window", () => {
    vi.useFakeTimers();
    const l = createRateLimiter(3, 1000);
    for (let i = 0; i < 3; i++) {
      expect(l.isBlocked("k")).toBe(false);
      l.hit("k");
    }
    expect(l.isBlocked("k")).toBe(true);
    expect(l.isBlocked("other")).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(l.isBlocked("k")).toBe(false);
    l.hit("k");
    l.reset("k");
    expect(l.isBlocked("k")).toBe(false);
    vi.useRealTimers();
  });
});
