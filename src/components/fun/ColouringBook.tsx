"use client";

import { useState } from "react";
import { COLOUR_PAGES, PALETTE } from "@/lib/crafts";
import { awardSticker } from "@/lib/stickers";

/** Tap a shape, then it fills with the chosen colour. Picture progress lives on the page only. */
export default function ColouringBook() {
  const [pageId, setPageId] = useState(COLOUR_PAGES[0].id);
  const [color, setColor] = useState(PALETTE[0]);
  const [fills, setFills] = useState<Record<string, string>>({});

  const page = COLOUR_PAGES.find((p) => p.id === pageId) ?? COLOUR_PAGES[0];
  const painted = page.regions.filter((r) => fills[`${page.id}:${r.id}`]).length;
  const done = painted >= Math.ceil(page.regions.length * 0.7);

  function paint(regionId: string) {
    setFills((f) => ({ ...f, [`${page.id}:${regionId}`]: color }));
    const count = page.regions.filter((r) => r.id === regionId || fills[`${page.id}:${r.id}`]).length;
    if (count >= Math.ceil(page.regions.length * 0.7)) awardSticker("art:colour-page");
  }

  function reset() {
    setFills((f) => {
      const next = { ...f };
      for (const r of page.regions) delete next[`${page.id}:${r.id}`];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pick a picture">
        {COLOUR_PAGES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPageId(p.id)}
            aria-pressed={p.id === pageId}
            className={`btn-chunky px-4 py-2 text-sm ${p.id === pageId ? "bg-brand-500 text-white" : "bg-white text-gray-800"}`}
          >
            {p.emoji} {p.title}
          </button>
        ))}
      </div>

      <div className="stat-card flex flex-wrap gap-1.5" role="group" aria-label="Colours">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Colour ${c}`}
            aria-pressed={color === c}
            onClick={() => setColor(c)}
            className={`h-11 w-11 rounded-full border-2 ${color === c ? "scale-110 border-gray-900" : "border-gray-300"}`}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="stat-card flex justify-center">
        <svg viewBox={page.viewBox} className="max-h-[60vh] w-full max-w-xl" role="img" aria-label={`Colouring page: ${page.title}`}>
          {page.regions.map((r) => (
            <path
              key={r.id}
              d={r.d}
              fill={fills[`${page.id}:${r.id}`] ?? r.start}
              stroke="#334155"
              strokeWidth={2.5}
              strokeLinejoin="round"
              className="cursor-pointer transition-colors hover:opacity-90"
              onClick={() => paint(r.id)}
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={reset} className="btn-chunky bg-white px-5 py-3 text-gray-800">🔄 Start again</button>
        {done && <span role="status" className="font-bold text-green-700">Beautiful colours! 🌈</span>}
      </div>
    </div>
  );
}
