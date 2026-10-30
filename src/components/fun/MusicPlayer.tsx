"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MOODS, buildLoop, moodForPath } from "@/lib/music";
import { audio, playNote } from "@/components/fun/audio";
import { useMusicEnabled } from "@/components/fun/useMusic";

/**
 * Background music that follows the section the child is in (home, quests, stories, art, games).
 * It renders nothing. It is off until switched on, quiet, and pauses when the tab is hidden.
 * The Music Maker page owns the speakers itself, so the background loop pauses there.
 */
export default function MusicPlayer() {
  const pathname = usePathname();
  const [on] = useMusicEnabled();
  const mood = MOODS[moodForPath(pathname)];
  const silent = pathname.startsWith("/dashboard/fun/music");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!on || silent) return;
    const a = audio();
    if (!a) return;
    const { ctx } = a;
    const loop = buildLoop(mood);
    const secPerBeat = 60 / mood.tempo;
    const loopSec = loop.lengthBeats * secPerBeat;
    let loopStart = ctx.currentTime + 0.1;
    let next = 0; // index of the next event to schedule within the current pass

    const tick = () => {
      if (document.hidden) {
        // skip ahead so we do not play a burst of old notes when the tab comes back
        while (loopStart + loopSec < ctx.currentTime) loopStart += loopSec;
        return;
      }
      const horizon = ctx.currentTime + 0.6;
      for (let guard = 0; guard < 200; guard++) {
        const ev = loop.events[next];
        const at = loopStart + ev.beat * secPerBeat;
        if (at > horizon) break;
        if (at >= ctx.currentTime - 0.05) {
          playNote(ev.midi, {
            when: Math.max(at, ctx.currentTime),
            dur: ev.beats * secPerBeat,
            gain: ev.gain * (ev.pad ? 0.7 : ev.bass ? 0.7 : 0.5),
            // the pad is always a pure sine so it stays smooth, whatever the tune plays
            wave: ev.pad ? "sine" : mood.wave,
            attack: ev.attack,
            bus: "music",
          });
        }
        next++;
        if (next >= loop.events.length) {
          next = 0;
          loopStart += loopSec;
        }
      }
    };

    tick();
    timer.current = setInterval(tick, 200);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [on, silent, mood]);

  return null;
}
