"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";
import { readMusic, writeMusic } from "./useMusic";

const ASKED = "am-music-asked";

/**
 * A one-time, polite question: "Would you like soft music?" Music stays off until someone says yes
 * (browsers need a tap before they allow sound, and some children prefer quiet). Remembers the answer.
 */
export default function MusicInvite() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(ASKED) === "1" || readMusic()) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, []);

  function answer(yes: boolean) {
    try {
      localStorage.setItem(ASKED, "1");
    } catch {
      /* ignore */
    }
    if (yes) writeMusic(true);
    setShow(false);
  }

  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-20 z-[65] flex justify-center px-4 lg:bottom-6" role="dialog" aria-label="Soft music">
      <div className="flex max-w-md animate-pop items-center gap-3 rounded-3xl border-4 border-brand-200 bg-white px-4 py-3 shadow-2xl">
        <span className="text-3xl" aria-hidden="true">🎵</span>
        <div className="flex-1">
          <p className="font-display text-base font-bold text-brand-800">Would you like some soft music?</p>
          <p className="text-xs text-gray-600">It plays quietly in the background. You can switch it off any time.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={() => answer(true)} className="btn-chunky flex items-center gap-1 bg-brand-600 px-3 py-1.5 text-sm text-white">
            <Music className="h-4 w-4" /> Yes please
          </button>
          <button type="button" onClick={() => answer(false)} className="rounded-xl px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
