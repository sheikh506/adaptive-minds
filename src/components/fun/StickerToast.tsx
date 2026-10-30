"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STICKER_EVENT, type Sticker } from "@/lib/stickers";

/** Pops up when a new sticker is earned anywhere in the app. Closes by itself. */
export default function StickerToast() {
  const [sticker, setSticker] = useState<Sticker | null>(null);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const on = (e: Event) => {
      setSticker((e as CustomEvent<Sticker>).detail);
      clearTimeout(t);
      t = setTimeout(() => setSticker(null), 5000);
    };
    window.addEventListener(STICKER_EVENT, on);
    return () => {
      window.removeEventListener(STICKER_EVENT, on);
      clearTimeout(t);
    };
  }, []);

  if (!sticker) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-4" role="status" aria-live="polite">
      <div className="pointer-events-auto flex animate-pop items-center gap-3 rounded-3xl border-4 border-kid-sun bg-white px-5 py-3 shadow-2xl">
        <span className="animate-wiggle text-5xl" aria-hidden="true">{sticker.emoji}</span>
        <div>
          <p className="font-display text-lg font-bold text-brand-700">New sticker: {sticker.name}!</p>
          <Link href="/dashboard/fun/stickers" className="text-sm font-bold text-brand-600 underline">
            See my sticker album
          </Link>
        </div>
        <button type="button" onClick={() => setSticker(null)} aria-label="Close" className="ml-1 rounded-full bg-gray-100 px-2 py-1 text-sm font-bold text-gray-600 hover:bg-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
}
