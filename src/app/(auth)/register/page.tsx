"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Wand2 } from "lucide-react";
import { AVATARS, NAME_HELP, generateMagicPassword, registerSchema } from "@/lib/validation";

const GRADES = [
  { value: "K", label: "K" },
  { value: "G1", label: "1" },
  { value: "G2", label: "2" },
  { value: "G3", label: "3" },
  { value: "G4", label: "4" },
  { value: "G5", label: "5" },
  { value: "G6", label: "6" },
  { value: "G7", label: "7" },
  { value: "G8", label: "8" },
];

const ROLES = [
  { value: "STUDENT", emoji: "🎒", label: "I'm a kid" },
  { value: "PARENT", emoji: "👨‍👩‍👧", label: "I'm a parent" },
  { value: "TEACHER", emoji: "🍎", label: "I'm a teacher" },
];

const input =
  "w-full rounded-2xl border-2 border-border px-4 py-3.5 text-base focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState("STUDENT");
  const [grade, setGrade] = useState("G3");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [field, setField] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState("");

  const isStudent = role === "STUDENT";

  function fail(message: string, f = "") {
    setError(message);
    setField(f);
    setLoading(false);
    // Bring the message into view on small screens
    requestAnimationFrame(() => document.getElementById("form-error")?.scrollIntoView({ block: "center", behavior: "smooth" }));
  }

  function magic() {
    const pw = generateMagicPassword();
    setPassword(pw);
    setShowPw(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setField("");

    const payload = {
      name,
      email,
      password,
      role,
      grade: isStudent ? grade : undefined,
      avatar: isStudent ? avatar : undefined,
      consent: isStudent ? consent : undefined,
    };
    const check = registerSchema.safeParse(payload);
    if (!check.success) {
      const issue = check.error.issues[0];
      return fail(issue.message, String(issue.path[0] ?? ""));
    }

    setLoading(true);
    let res: Response;
    try {
      res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      return fail("We couldn't reach the internet. Check your connection and try again.");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return fail(data.error || "Registration failed. Please try again.", data.field || "");

    // Sign in straight away so a child doesn't have to type everything twice.
    setCreated(check.data.name);
    const signed = await signIn("credentials", { email: check.data.email, password, redirect: false });
    if (signed?.error) {
      router.push("/login?registered=1");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const ring = (f: string) => (field === f ? "border-red-400 ring-4 ring-red-100" : "");

  if (created) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 px-4">
        <div className="text-center" role="status">
          <p className="text-7xl">{isStudent ? avatar : "🎉"}</p>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Welcome, {created.split(" ")[0]}!</h1>
          <p className="mt-2 text-lg text-gray-500">Getting your adventure ready…</p>
          <Loader2 className="mx-auto mt-6 h-8 w-8 animate-spin text-brand-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-3xl font-extrabold text-white">
            A
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Let&apos;s get started!</h1>
          <p className="mt-1 text-lg text-gray-600">It only takes a minute.</p>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div id="form-error" role="alert" className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
              😕 {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <fieldset>
              <legend className="mb-2 text-base font-bold text-gray-800">Who is signing up?</legend>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    aria-pressed={role === r.value}
                    onClick={() => setRole(r.value)}
                    className={`rounded-2xl border-2 px-2 py-3 text-center text-sm font-bold transition-colors ${
                      role === r.value
                        ? "border-brand-500 bg-brand-50 text-brand-800"
                        : "border-border bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block text-3xl">{r.emoji}</span>
                    {r.label}
                  </button>
                ))}
              </div>
              {isStudent && (
                <p className="mt-2 text-sm text-gray-500">
                  Tip: a grown-up can help you fill this in.
                </p>
              )}
            </fieldset>

            <div>
              <label htmlFor="name" className="mb-1.5 block text-base font-bold text-gray-800">
                {isStudent ? "What should we call you?" : "Your name"}
              </label>
              <input
                id="name"
                type="text"
                autoComplete="given-name"
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isStudent ? "Alex" : "Alex Johnson"}
                aria-invalid={field === "name"}
                className={`${input} ${ring("name")}`}
              />
              {isStudent && <p className="mt-1 text-sm text-gray-500">{NAME_HELP}</p>}
            </div>

            {isStudent && (
              <>
                <fieldset>
                  <legend className="mb-2 text-base font-bold text-gray-800">Pick your buddy</legend>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        aria-label={`Choose ${a}`}
                        aria-pressed={avatar === a}
                        onClick={() => setAvatar(a)}
                        className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl transition-transform ${
                          avatar === a ? "scale-110 border-brand-500 bg-brand-50" : "border-border bg-white hover:bg-gray-50"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2 text-base font-bold text-gray-800">What grade are you in?</legend>
                  <div className="grid grid-cols-9 gap-1.5" role="radiogroup" aria-label="Grade">
                    {GRADES.map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        role="radio"
                        aria-checked={grade === g.value}
                        aria-label={g.value === "K" ? "Kindergarten" : `Grade ${g.label}`}
                        onClick={() => setGrade(g.value)}
                        className={`aspect-square rounded-xl border-2 text-lg font-extrabold transition-colors ${
                          grade === g.value
                            ? "border-brand-500 bg-brand-600 text-white"
                            : "border-border bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-base font-bold text-gray-800">
                {isStudent ? "A grown-up's email, or your own" : "Email"}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={field === "email"}
                className={`${input} ${ring("email")}`}
              />
              {isStudent && (
                <p className="mt-1 text-sm text-gray-500">You&apos;ll use this to sign in. We never show it to other kids.</p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-base font-bold text-gray-800">
                  Secret password
                </label>
                <button
                  type="button"
                  onClick={magic}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-bold text-purple-700 hover:bg-purple-200"
                >
                  <Wand2 className="h-4 w-4" /> Magic password
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  aria-invalid={field === "password"}
                  className={`${input} pr-14 ${ring("password")}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2.5 text-gray-500 hover:bg-gray-100"
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Tap <strong>Magic password</strong> for an easy-to-remember one, then write it down somewhere safe.
              </p>
            </div>

            {isStudent && (
              <div
                className={`rounded-2xl border-2 p-4 ${
                  field === "consent" ? "border-red-400 bg-red-50" : "border-amber-200 bg-amber-50"
                }`}
              >
                <p className="mb-3 text-sm font-bold text-amber-900">
                  ⚠️ A parent or guardian must complete this step
                </p>
                <p className="mb-3 text-xs text-amber-800">
                  AdaptiveMinds is designed for children. Before creating an account for a child under 13,
                  a parent or guardian must read our{" "}
                  <Link href="/privacy" target="_blank" className="font-semibold text-brand-700 underline">
                    Privacy Notice
                  </Link>{" "}
                  and tick the box below.
                </p>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-6 w-6 flex-shrink-0 accent-brand-600"
                    aria-describedby="consent-help"
                  />
                  <span id="consent-help" className="text-sm text-gray-700">
                    <strong>I am this child&apos;s parent or guardian.</strong> I have read the Privacy Notice
                    and I give my permission for this account to be created.
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-lg font-extrabold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Creating…" : "Create my account 🚀"}
            </button>
          </form>

          <p className="mt-6 text-center text-base text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
