"use client";

import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSfxEnabled } from "./sfx";

/** On/off switch for the little sound effects. `compact` is a round icon button for headers. */
export default function SfxToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [on, setOn] = useSfxEnabled();
  const label = on ? "Turn sound effects off" : "Turn sound effects on";

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setOn(!on)}
        aria-pressed={on}
        aria-label={label}
        title={label}
        className={cn("rounded-full p-2 transition-colors", on ? "bg-kid-sun text-brand-900" : "bg-white/20 text-current hover:bg-white/30", className)}
      >
        {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      aria-pressed={on}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors",
        on ? "bg-kid-sun/30 text-brand-800" : "text-gray-600 hover:bg-brand-50",
        className
      )}
    >
      {on ? <Volume2 className="h-5 w-5 text-brand-600" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
      {on ? "Sounds: On" : "Sounds: Off"}
    </button>
  );
}
