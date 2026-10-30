"use client";

import { Music, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMusicEnabled } from "@/components/fun/useMusic";

/** On/off switch for background music. `compact` is a round icon button for headers and game screens. */
export default function MusicToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [on, setOn] = useMusicEnabled();
  const label = on ? "Turn music off" : "Turn music on";

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
        {on ? <Music className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
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
      {on ? <Music className="h-5 w-5 text-brand-600" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
      {on ? "Music: On" : "Music: Off"}
    </button>
  );
}
