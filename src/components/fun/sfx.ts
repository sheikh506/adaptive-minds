"use client";

import { useEffect, useState } from "react";
import { sfxNotes, type SfxName } from "@/lib/sfx";
import { audio, playNote } from "./audio";

const KEY = "am-sfx";
const EVT = "am-sfx-change";

/** Sound effects are soft and short, so they are on unless someone turns them off. */
export function sfxEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

export function setSfxEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* storage unavailable: ignore */
  }
  window.dispatchEvent(new Event(EVT));
}

export function useSfxEnabled(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const sync = () => setOn(sfxEnabled());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return [on, setSfxEnabled];
}

/** Plays a named sound effect (see lib/sfx.ts). Does nothing when effects are switched off. */
export function playSfx(name: SfxName, shift = 0) {
  if (!sfxEnabled()) return;
  const a = audio();
  if (!a) return;
  const t0 = a.ctx.currentTime;
  for (const n of sfxNotes(name, shift)) {
    playNote(n.midi, { when: t0 + n.at, dur: n.dur, gain: n.gain, wave: n.wave });
  }
}
