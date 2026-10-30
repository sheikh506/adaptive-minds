"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Confirmation page before account deletion.
 * The user must type "DELETE" to confirm, then the client calls DELETE /api/account/delete.
 */
export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmation.trim().toUpperCase() === "DELETE";

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!canDelete) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (res.ok) {
        // Account deleted — redirect to login and clear session by reloading
        window.location.href = "/login?deleted=1";
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Deletion failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-10 px-4">
      <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-red-700 mb-2">Delete your account</h1>
        <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold mb-1">⚠️ This cannot be undone.</p>
          <p>
            Deleting your account will permanently remove all your learning history, progress,
            badges and personal information from AdaptiveMinds. This action cannot be reversed.
          </p>
        </div>

        <p className="mb-1 text-sm font-semibold text-gray-700">
          Before you delete, consider{" "}
          <a href="/api/account/export" download className="text-brand-700 underline">
            downloading your data
          </a>
          .
        </p>

        <form onSubmit={handleDelete} className="mt-6 space-y-4">
          {error && (
            <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="confirm-input" className="block text-sm font-semibold text-gray-700 mb-1">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              id="confirm-input"
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              className="w-full rounded-2xl border-2 border-red-200 px-4 py-3 text-base focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100"
            />
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/settings"
              className="flex-1 rounded-2xl border-2 border-border py-3 text-center text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canDelete || loading}
              className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-extrabold text-white transition-colors hover:bg-red-700 disabled:opacity-40"
            >
              {loading ? "Deleting…" : "Permanently delete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
