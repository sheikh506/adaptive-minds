"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const input =
  "w-full rounded-2xl border-2 border-border px-4 py-3.5 text-base focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100";

// Set NEXT_PUBLIC_HIDE_DEMO=true in production to remove the shared demo accounts from the UI.
const SHOW_DEMO = process.env.NEXT_PUBLIC_HIDE_DEMO !== "true";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    setRegistered(new URLSearchParams(window.location.search).get("registered") === "1");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Hmm, that email or password doesn't match. Check them and try again.");
        setLoading(false);
        return;
      }
    } catch {
      setError("We couldn't reach the internet. Check your connection and try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-3xl font-extrabold text-white">
            A
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome back! 👋</h1>
          <p className="mt-1 text-lg text-gray-600">Ready to keep learning?</p>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
          {registered && !error && (
            <div role="status" className="mb-5 rounded-2xl bg-green-50 px-4 py-3 text-base font-semibold text-green-700">
              🎉 Your account is ready. Please sign in.
            </div>
          )}
          {error && (
            <div role="alert" className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
              😕 {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-base font-bold text-gray-800">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-base font-bold text-gray-800">
                Secret password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={`${input} pr-14`}
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
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-lg font-extrabold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Signing in…" : "Let's go! 🚀"}
            </button>
          </form>

          <p className="mt-6 text-center text-base text-gray-600">
            New here?{" "}
            <Link href="/register" className="font-bold text-brand-700 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Forgot your password? Ask a parent or teacher to help you.
          </p>
        </div>

        {SHOW_DEMO && (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-4">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
              Try a demo account
            </p>
            <div className="space-y-2">
              {[
                { label: "🎒 Student", email: "student@demo.com" },
                { label: "🍎 Teacher", email: "teacher@demo.com" },
                { label: "👨‍👩‍👧 Parent", email: "parent@demo.com" },
              ].map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword("password123");
                  }}
                  className="w-full rounded-xl border border-border bg-gray-50 px-4 py-3 text-left text-sm transition-colors hover:bg-gray-100"
                >
                  <span className="font-semibold text-gray-700">{d.label}</span>
                  <span className="ml-2 text-gray-500">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
