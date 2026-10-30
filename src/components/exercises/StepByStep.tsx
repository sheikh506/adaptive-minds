"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { playSfx } from "@/components/fun/sfx";

/**
 * A solution shown as short steps, one at a time. The first step is visible straight away; the child taps
 * "Next step" to see the next one, so nothing arrives as a wall of text.
 */
export default function StepByStep({
  steps,
  tone = "brand",
  className,
}: {
  steps: string[];
  tone?: "brand" | "green" | "amber";
  className?: string;
}) {
  const [shown, setShown] = useState(1);
  if (steps.length === 0) return null;
  const visible = Math.min(shown, steps.length);
  const more = visible < steps.length;
  const badge = tone === "green" ? "bg-green-100 text-green-800" : tone === "amber" ? "bg-amber-100 text-amber-900" : "bg-brand-100 text-brand-800";

  return (
    <div className={className}>
      <ol className="space-y-1.5">
        {steps.slice(0, visible).map((step, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-gray-800 animate-pop">
            <span className={cn("mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold", badge)}>
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {more && (
        <button
          type="button"
          onClick={() => {
            playSfx("step");
            setShown((n) => n + 1);
          }}
          className="mt-2 flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100"
        >
          Next step <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
