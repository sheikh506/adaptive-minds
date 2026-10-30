"use client";

import { useEffect, useState } from "react";
import { STICKERS, STICKER_EVENT, readEarned, type StickerGroup } from "@/lib/stickers";

const GROUPS: { id: StickerGroup; title: string }[] = [
  { id: "quest", title: "Learning quests" },
  { id: "story", title: "Stories" },
  { id: "art", title: "Art & craft" },
  { id: "music", title: "Music" },
  { id: "puzzle", title: "Puzzles" },
  { id: "game", title: "Games" },
];

/** Stickers are kept on this device only. Nothing is compared with other children. */
export default function StickerAlbum() {
  const [earned, setEarned] = useState<string[]>([]);

  useEffect(() => {
    setEarned(readEarned());
    const update = () => setEarned(readEarned());
    window.addEventListener(STICKER_EVENT, update);
    return () => window.removeEventListener(STICKER_EVENT, update);
  }, []);

  return (
    <div className="space-y-6">
      <p className="font-semibold text-gray-700">
        {earned.length} of {STICKERS.length} stickers collected
      </p>
      {GROUPS.map((g) => (
        <section key={g.id}>
          <h2 className="mb-3 text-lg font-bold text-gray-900">{g.title}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {STICKERS.filter((s) => s.group === g.id).map((s) => {
              const have = earned.includes(s.id);
              return (
                <div key={s.id} className={`badge-card ${have ? "" : "opacity-70"}`}>
                  <span className={`text-5xl ${have ? "" : "opacity-30 grayscale"}`} aria-hidden="true">{s.emoji}</span>
                  <p className="font-bold text-gray-900">{have ? s.name : "???"}</p>
                  <p className="text-xs text-gray-600">{have ? "Collected!" : s.how}</p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
