"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { FormState } from "@/app/actions/manage";

type Action = (formData: FormData) => Promise<FormState>;

export const inputClass =
  "w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

/** Form wrapper that runs a server action and shows its error/success message. */
export default function ActionForm({
  action,
  submitLabel,
  children,
}: {
  action: Action;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<FormState>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        const result = await action(formData);
        setState(result);
        if (result.success) form.reset();
      } catch {
        setState({ error: "Something went wrong. Please try again." });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
          {state.success}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
