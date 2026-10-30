"use client";

import { bestVoice } from "@/lib/voice-style";
import { setMusicDucked } from "@/components/fun/audio";

const OFF_KEY = "am-voice-off";
export const VOICE_EVENT = "am-voice-change";

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** The friendly helper voice is on unless the child (or a grown-up) switched it off. */
export function voiceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OFF_KEY) !== "1";
  } catch {
    return true;
  }
}

export function setVoiceEnabled(on: boolean) {
  try {
    if (on) localStorage.removeItem(OFF_KEY);
    else localStorage.setItem(OFF_KEY, "1");
  } catch {
    /* storage unavailable: ignore */
  }
  if (!on) stopSpeaking();
  window.dispatchEvent(new Event(VOICE_EVENT));
}

/** A gentle utterance: slightly slow, soft pitch, best friendly voice the device has. */
export function makeUtterance(text: string, opts: { rate?: number; pitch?: number } = {}): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  u.rate = opts.rate ?? 0.88;
  u.pitch = opts.pitch ?? 1.08;
  u.volume = 1;
  const v = bestVoice(window.speechSynthesis.getVoices());
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  }
  // The soft music dips while the helper talks, then comes back. addEventListener keeps this working
  // even when a caller sets its own onend / onerror.
  u.addEventListener("start", () => setMusicDucked(true));
  u.addEventListener("end", () => setMusicDucked(false));
  u.addEventListener("error", () => setMusicDucked(false));
  return u;
}

/** Says something kindly, if the helper voice is on. Replaces whatever was being said. */
export function say(text: string, opts: { rate?: number; pitch?: number; onEnd?: () => void } = {}) {
  if (!speechSupported() || !voiceEnabled()) {
    opts.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = makeUtterance(text, opts);
  if (opts.onEnd) {
    u.onend = opts.onEnd;
    u.onerror = opts.onEnd;
  }
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
  setMusicDucked(false);
}
