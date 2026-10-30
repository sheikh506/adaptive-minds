"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { VOICE_EVENT, setVoiceEnabled, speechSupported, voiceEnabled } from "./voice";

/** Lets a child (or grown-up) switch the friendly helper voice on or off. */
export default function VoiceToggle() {
  const [on, setOn] = useState(true);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(speechSupported());
    setOn(voiceEnabled());
    const update = () => setOn(voiceEnabled());
    window.addEventListener(VOICE_EVENT, update);
    return () => window.removeEventListener(VOICE_EVENT, update);
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setVoiceEnabled(!on)}
      className="btn-chunky flex items-center gap-2 bg-white px-3 py-1.5 text-sm text-brand-700"
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      Friendly voice: {on ? "On" : "Off"}
    </button>
  );
}
