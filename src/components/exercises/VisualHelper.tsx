"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Visual } from "@/lib/question-types";

// ─── Ten Frame ───────────────────────────────────────────────────────────────

/**
 * Displays a ten-frame (or double ten-frame for numbers > 10).
 * The filled cells are pre-populated to show a quantity.
 * Tapping toggles cells so a child can manipulate the frame.
 */
function TenFrame({ total, filled }: { total: number; filled: number }) {
  // Support double ten-frame (up to 20)
  const frameCount = total > 10 ? 2 : 1;
  const [tapped, setTapped] = useState<Set<number>>(
    () => new Set(Array.from({ length: filled }, (_, i) => i))
  );
  const toggle = (i: number) =>
    setTapped((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {Array.from({ length: frameCount }).map((_, frame) => (
        <div
          key={frame}
          className="grid grid-cols-5 gap-1.5 rounded-xl border-2 border-brand-400 bg-white p-2"
          role="group"
          aria-label={`Ten frame ${frame + 1}`}
        >
          {Array.from({ length: 10 }).map((_, cell) => {
            const idx = frame * 10 + cell;
            const on = tapped.has(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggle(idx)}
                aria-pressed={on}
                aria-label={`Cell ${idx + 1}${on ? " (filled)" : " (empty)"}`}
                className={cn(
                  "h-9 w-9 rounded-lg border-2 transition-all",
                  on
                    ? "border-brand-600 bg-brand-500 shadow-sm"
                    : "border-gray-300 bg-gray-50 hover:border-brand-300 hover:bg-brand-50"
                )}
              />
            );
          })}
        </div>
      ))}
      <Footer>
        Ten frame · Filled: <span className="text-base text-brand-700">{tapped.size}</span>
        {tapped.size !== filled && (
          <ResetButton onClick={() => setTapped(new Set(Array.from({ length: filled }, (_, i) => i)))} />
        )}
      </Footer>
    </div>
  );
}

// ─── Number Bond ─────────────────────────────────────────────────────────────

function NumberBond({ whole, part1, part2 }: { whole: number | null; part1: number | null; part2: number | null }) {
  return (
    <div className="flex flex-col items-center gap-2 py-3" role="img" aria-label={`Number bond: whole is ${whole}`}>
      {/* Whole */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-3 border-brand-500 bg-brand-50 text-xl font-extrabold text-brand-800">
        {whole}
      </div>
      {/* Connecting lines (SVG) */}
      <svg width="100" height="30" aria-hidden="true">
        <line x1="50" y1="0" x2="20" y2="30" stroke="#94a3b8" strokeWidth="2" />
        <line x1="50" y1="0" x2="80" y2="30" stroke="#94a3b8" strokeWidth="2" />
      </svg>
      {/* Parts */}
      <div className="flex gap-10">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border-3 text-xl font-extrabold",
          part1 !== null ? "border-green-500 bg-green-50 text-green-800" : "border-dashed border-gray-400 bg-white text-gray-400"
        )}>
          {part1 !== null ? part1 : "?"}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border-3 text-xl font-extrabold",
          part2 !== null ? "border-green-500 bg-green-50 text-green-800" : "border-dashed border-gray-400 bg-white text-gray-400"
        )}>
          {part2 !== null ? part2 : "?"}
        </div>
      </div>
      <Footer>
        {whole} = {part1 !== null ? part1 : "?"} + {part2 !== null ? part2 : "?"}
      </Footer>
    </div>
  );
}

// ─── Part-Whole Model ─────────────────────────────────────────────────────────

function PartWhole({ whole, parts }: { whole: number | null; parts: (number | null)[] }) {
  return (
    <div className="flex flex-col items-center gap-2 py-3" role="img" aria-label="Part-whole model">
      {/* Whole box */}
      <div className={cn(
        "flex h-14 w-28 items-center justify-center rounded-xl border-2 text-2xl font-extrabold",
        whole !== null ? "border-brand-500 bg-brand-50 text-brand-800" : "border-dashed border-gray-400 bg-white text-gray-400"
      )}>
        {whole !== null ? whole : "?"}
      </div>
      <svg width={80 * parts.length} height="30" aria-hidden="true">
        {parts.map((_, i) => (
          <line
            key={i}
            x1={40 * parts.length}
            y1="0"
            x2={40 * i + 20}
            y2="30"
            stroke="#94a3b8"
            strokeWidth="2"
          />
        ))}
      </svg>
      {/* Part boxes */}
      <div className="flex gap-3">
        {parts.map((p, i) => (
          <div key={i} className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl border-2 text-xl font-extrabold",
            p !== null ? "border-green-500 bg-green-50 text-green-800" : "border-dashed border-gray-400 bg-white text-gray-400"
          )}>
            {p !== null ? p : "?"}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Place Value Blocks ───────────────────────────────────────────────────────

function PlaceValueBlocks({ hundreds, tens, ones }: { hundreds: number; tens: number; ones: number }) {
  const total = hundreds * 100 + tens * 10 + ones;
  return (
    <div className="flex flex-wrap items-end justify-center gap-4 py-3" role="img" aria-label={`Place value: ${total}`}>
      {hundreds > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-wrap justify-center gap-0.5" aria-hidden="true">
            {Array.from({ length: hundreds }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-px rounded border-2 border-blue-500 bg-blue-100 p-0.5">
                {Array.from({ length: 9 }).map((_, j) => (
                  <div key={j} className="h-2.5 w-2.5 rounded-sm bg-blue-400" />
                ))}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-bold text-blue-700">{hundreds} hundred{hundreds > 1 ? "s" : ""}</span>
        </div>
      )}
      {tens > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-wrap justify-center gap-0.5" aria-hidden="true">
            {Array.from({ length: tens }).map((_, i) => (
              <div key={i} className="flex flex-col gap-px rounded border-2 border-green-500 bg-green-100 p-0.5">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="h-2.5 w-2.5 rounded-sm bg-green-400" />
                ))}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-bold text-green-700">{tens} ten{tens > 1 ? "s" : ""}</span>
        </div>
      )}
      {ones > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-wrap justify-center gap-0.5 max-w-[5rem]" aria-hidden="true">
            {Array.from({ length: ones }).map((_, i) => (
              <div key={i} className="h-5 w-5 rounded border-2 border-orange-400 bg-orange-100" />
            ))}
          </div>
          <span className="text-[11px] font-bold text-orange-700">{ones} one{ones > 1 ? "s" : ""}</span>
        </div>
      )}
      <Footer>
        {hundreds > 0 && `${hundreds} hundreds `}{tens > 0 && `${tens} tens `}{ones > 0 && `${ones} ones`}
        {" = "}<span className="text-brand-700 font-extrabold">{total}</span>
      </Footer>
    </div>
  );
}

// ─── Letter Tiles (display) ──────────────────────────────────────────────────

function LetterTilesVisual({ tiles, targetGraphemes }: { tiles: string[]; targetGraphemes: string[] }) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex flex-wrap justify-center gap-2">
        {tiles.map((letter, i) => (
          <div
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-brand-400 bg-brand-50 text-xl font-extrabold text-brand-800 shadow-sm"
            aria-label={`Letter tile: ${letter}`}
          >
            {letter}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {targetGraphemes.map((g, i) => (
          <div
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-xl font-extrabold text-gray-300"
            aria-label={`Target slot ${i + 1}`}
          >
            _
          </div>
        ))}
      </div>
      <Footer>Use the tiles above to build the word</Footer>
    </div>
  );
}

// ─── Phoneme Boxes (display) ─────────────────────────────────────────────────

function PhonemeBoxesVisual({ wordEmoji, boxCount }: { wordEmoji: string; boxCount: number }) {
  const [filled, setFilled] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-300 bg-amber-50 text-5xl" aria-hidden="true">
        {wordEmoji}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: boxCount }).map((_, i) => {
          const on = i < filled;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setFilled(i < filled ? i : i + 1)}
              aria-pressed={on}
              aria-label={`Phoneme box ${i + 1}${on ? " (tapped)" : ""}`}
              className={cn(
                "h-12 w-12 rounded-xl border-2 text-center transition-all",
                on ? "border-brand-500 bg-brand-100 font-extrabold text-brand-800" : "border-dashed border-gray-300 bg-white"
              )}
            />
          );
        })}
      </div>
      <Footer>
        Tap a box for each sound you hear: <span className="text-brand-700">{filled}/{boxCount}</span>
        {filled > 0 && <ResetButton onClick={() => setFilled(0)} />}
      </Footer>
    </div>
  );
}

/**
 * Hands-on helpers shown above or alongside the answer options. They only show what the question already says
 * (they never contain the answer) and a child can freely interact with them. Every control is accessible.
 */

const item = "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-2xl leading-none transition-transform active:scale-90 sm:h-10 sm:w-10";

function Footer({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-center text-xs font-bold text-gray-600" aria-live="polite">{children}</p>;
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600 hover:bg-gray-200">
      Start over
    </button>
  );
}

/** Tap things to count them. Used for adding, and for equal groups. */
function Tappable({ groups }: { groups: { emoji: string; count: number }[] }) {
  const [counted, setCounted] = useState<Set<string>>(new Set());
  const toggle = (k: string) =>
    setCounted((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {groups.map((g, gi) => (
          <div key={gi} className="flex items-center gap-2">
            {gi > 0 && <span className="text-xl font-extrabold text-gray-400" aria-hidden="true">+</span>}
            <div className="flex flex-wrap justify-center gap-0.5 rounded-xl bg-white/70 p-1">
              {Array.from({ length: g.count }).map((_, i) => {
                const k = `${gi}-${i}`;
                const on = counted.has(k);
                return (
                  <button key={k} type="button" aria-pressed={on} aria-label={`Count item ${i + 1}`} onClick={() => toggle(k)} className={cn(item, on ? "bg-yellow-200 ring-2 ring-yellow-400" : "hover:bg-white")}>
                    {g.emoji}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <Footer>
        Tap to count: <span className="text-base text-brand-700">{counted.size}</span>
        {counted.size > 0 && <ResetButton onClick={() => setCounted(new Set())} />}
      </Footer>
    </div>
  );
}

function Takeaway({ emoji, total }: { emoji: string; total: number }) {
  const [gone, setGone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setGone((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} type="button" aria-pressed={gone.has(i)} aria-label={`Take away item ${i + 1}`} onClick={() => toggle(i)} className={cn(item, gone.has(i) ? "opacity-20 grayscale" : "hover:bg-white")}>
            {emoji}
          </button>
        ))}
      </div>
      <Footer>
        Tap the ones that go away. Left: <span className="text-base text-brand-700">{total - gone.size}</span>
        {gone.size > 0 && <ResetButton onClick={() => setGone(new Set())} />}
      </Footer>
    </div>
  );
}

function Share({ emoji, total, plates }: { emoji: string; total: number; plates: number }) {
  const [counts, setCounts] = useState<number[]>(() => Array(plates).fill(0));
  const left = total - counts.reduce((a, b) => a + b, 0);
  const give = (p: number) => left > 0 && setCounts((c) => c.map((v, i) => (i === p ? v + 1 : v)));
  return (
    <div>
      <p className="flex flex-wrap justify-center gap-0.5 text-xl" aria-hidden="true">
        {Array.from({ length: left }).map((_, i) => (
          <span key={i}>{emoji}</span>
        ))}
        {left === 0 && <span className="text-xs font-bold text-gray-500">All shared out!</span>}
      </p>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        {counts.map((c, p) => (
          <button key={p} type="button" onClick={() => give(p)} aria-label={`Give one to plate ${p + 1}. It has ${c}.`} className="flex min-h-[3.25rem] min-w-[3.25rem] flex-col items-center rounded-full border-2 border-gray-300 bg-white px-2 py-1 hover:border-brand-400">
            <span className="flex max-w-[5rem] flex-wrap justify-center text-sm leading-none" aria-hidden="true">
              {Array.from({ length: c }).map((_, i) => (
                <span key={i}>{emoji}</span>
              ))}
            </span>
            <span className="text-xs font-extrabold text-gray-700">{c}</span>
          </button>
        ))}
      </div>
      <Footer>
        Tap a plate to hand one out. {left} left
        {left !== total && <ResetButton onClick={() => setCounts(Array(plates).fill(0))} />}
      </Footer>
    </div>
  );
}

function Pack({ emoji, total, size }: { emoji: string; total: number; size: number }) {
  const [groups, setGroups] = useState(0);
  const left = total - groups * size;
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: groups }).map((_, g) => (
          <span key={g} className="rounded-lg border-2 border-brand-300 bg-brand-50 px-1 text-lg leading-tight">
            {emoji.repeat(size)}
          </span>
        ))}
        <span className="px-1 text-lg leading-tight">{emoji.repeat(Math.max(0, left))}</span>
      </div>
      <div className="mt-1 flex items-center justify-center gap-2">
        <button type="button" disabled={left < size} onClick={() => setGroups((g) => g + 1)} className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-40">
          Pack {size}
        </button>
        <span className="text-xs font-bold text-gray-600" aria-live="polite">
          Groups made: <span className="text-base text-brand-700">{groups}</span>
        </span>
        {groups > 0 && <ResetButton onClick={() => setGroups(0)} />}
      </div>
    </div>
  );
}

function wedge(i: number, n: number) {
  const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
  const [x0, y0, x1, y1] = [50 + 46 * Math.cos(a0), 50 + 46 * Math.sin(a0), 50 + 46 * Math.cos(a1), 50 + 46 * Math.sin(a1)];
  return `M50 50 L${x0.toFixed(2)} ${y0.toFixed(2)} A46 46 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

function Pizza({ slices }: { slices: number }) {
  const [on, setOn] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOn((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  return (
    <div className="flex items-center justify-center gap-3">
      <svg viewBox="0 0 100 100" width="104" height="104" role="group" aria-label={`A pizza cut into ${slices} equal slices`}>
        <circle cx="50" cy="50" r="48" fill="#f59e0b" />
        {Array.from({ length: slices }).map((_, i) => (
          <path
            key={i}
            d={wedge(i, slices)}
            role="button"
            tabIndex={0}
            aria-pressed={on.has(i)}
            aria-label={`Slice ${i + 1}`}
            onClick={() => toggle(i)}
            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), toggle(i))}
            fill={on.has(i) ? "#ef4444" : "#fde68a"}
            stroke="#b45309"
            strokeWidth="1.5"
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>
      <div className="text-center text-xs font-bold text-gray-600" aria-live="polite">
        Tap slices to colour them
        <p className="mt-0.5 text-lg font-extrabold text-brand-700">
          {on.size}/{slices}
        </p>
        {on.size > 0 && <ResetButton onClick={() => setOn(new Set())} />}
      </div>
    </div>
  );
}

function NumberLineVisual({ min, max, step = 1, target, label }: { min: number; max: number; step?: number; target?: number; label?: string }) {
  const [activeNum, setActiveNum] = useState<number | null>(target ?? null);
  const totalSteps = Math.round((max - min) / step);
  const numbers: number[] = [];
  for (let i = 0; i <= totalSteps; i++) {
    numbers.push(min + i * step);
  }

  return (
    <div className="w-full px-2 py-3">
      {label && <p className="mb-2 text-center text-xs font-bold text-gray-700">{label}</p>}
      <div className="relative flex items-center justify-between border-b-2 border-brand-500 pb-2">
        {numbers.map((n) => {
          const isSelected = activeNum === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setActiveNum(n)}
              className={cn(
                "group relative flex flex-col items-center transition-all",
                isSelected ? "scale-110 font-black text-brand-700" : "text-gray-600 hover:text-brand-600"
              )}
              aria-label={`Number line point ${n}`}
            >
              <span className={cn("h-3 w-0.5 rounded-full", isSelected ? "h-4 bg-brand-600 ring-2 ring-brand-300" : "bg-gray-400 group-hover:bg-brand-400")} />
              <span className={cn("mt-1.5 text-xs sm:text-sm font-semibold", isSelected && "rounded-full bg-brand-100 px-1.5 py-0.5 font-bold text-brand-800")}>
                {n}
              </span>
            </button>
          );
        })}
      </div>
      <Footer>
        Number line ({min} to {max})
        {activeNum !== null && <span className="ml-1 text-brand-700">· Selected: <strong>{activeNum}</strong></span>}
      </Footer>
    </div>
  );
}

function GridVisual({ rows, cols, emoji = "🟦" }: { rows: number; cols: number; emoji?: string }) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const toggle = (r: number, c: number) => {
    const key = `${r}-${c}`;
    setTapped((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center py-2">
      <div className="inline-grid gap-1 rounded-xl bg-white/80 p-2 shadow-inner" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const key = `${r}-${c}`;
            const on = tapped.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(r, c)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-transform sm:h-9 sm:w-9",
                  on ? "bg-amber-200 ring-2 ring-amber-400 scale-95" : "bg-gray-50 hover:bg-gray-100"
                )}
                aria-label={`Row ${r + 1}, Column ${c + 1}`}
              >
                {emoji}
              </button>
            );
          })
        )}
      </div>
      <Footer>
        {rows} rows of {cols} ({rows * cols} total) · Tap count: <span className="text-brand-700">{tapped.size}</span>
        {tapped.size > 0 && <ResetButton onClick={() => setTapped(new Set())} />}
      </Footer>
    </div>
  );
}

/** An analog clock. It is the question itself ("What time is it?"), so the time is never written in text. */
function ClockVisual({ hour, minute }: { hour: number; minute: number }) {
  const minuteAngle = minute * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const hand = (angle: number, length: number, width: number, color: string) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return (
      <line
        x1="50"
        y1="50"
        x2={(50 + length * Math.cos(rad)).toFixed(2)}
        y2={(50 + length * Math.sin(rad)).toFixed(2)}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    );
  };
  return (
    <div className="flex justify-center py-1">
      <svg viewBox="0 0 100 100" width="150" height="150" role="img" aria-label="A clock face. Look at the hands to tell the time.">
        <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#374151" strokeWidth="3" />
        {Array.from({ length: 12 }).map((_, i) => {
          const n = i + 1;
          const rad = ((n * 30 - 90) * Math.PI) / 180;
          return (
            <text
              key={n}
              x={(50 + 37 * Math.cos(rad)).toFixed(2)}
              y={(50 + 37 * Math.sin(rad)).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10"
              fontWeight="700"
              fill="#1f2937"
            >
              {n}
            </text>
          );
        })}
        {hand(hourAngle, 22, 4.5, "#1f2937")}
        {hand(minuteAngle, 34, 3, "#2563eb")}
        <circle cx="50" cy="50" r="3" fill="#1f2937" />
      </svg>
    </div>
  );
}

export default function VisualHelper({ visual }: { visual: Visual }) {
  return (
    <div className="mt-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-2 py-2" role="group" aria-label="A picture to help you">
      {visual.type === "count" && <Tappable groups={visual.items} />}
      {visual.type === "groups" && (
        <Tappable groups={Array.from({ length: visual.groups }, () => ({ emoji: visual.emoji, count: visual.each }))} />
      )}
      {visual.type === "takeaway" && <Takeaway emoji={visual.emoji} total={visual.total} />}
      {visual.type === "share" && <Share emoji={visual.emoji} total={visual.total} plates={visual.plates} />}
      {visual.type === "pack" && <Pack emoji={visual.emoji} total={visual.total} size={visual.size} />}
      {visual.type === "pizza" && <Pizza slices={visual.slices} />}
      {visual.type === "number_line" && (
        <NumberLineVisual min={visual.min} max={visual.max} step={visual.step} target={visual.target} label={visual.label} />
      )}
      {visual.type === "grid" && <GridVisual rows={visual.rows} cols={visual.cols} emoji={visual.emoji} />}
      {visual.type === "clock" && <ClockVisual hour={visual.hour} minute={visual.minute} />}
      {/* New manipulatives (Phase 7-8) */}
      {visual.type === "ten_frame" && <TenFrame total={visual.total} filled={visual.filled} />}
      {visual.type === "number_bond" && (
        <NumberBond whole={visual.whole} part1={visual.part1} part2={visual.part2} />
      )}
      {visual.type === "part_whole" && <PartWhole whole={visual.whole} parts={visual.parts} />}
      {visual.type === "place_value_blocks" && (
        <PlaceValueBlocks hundreds={visual.hundreds} tens={visual.tens} ones={visual.ones} />
      )}
      {visual.type === "letter_tiles" && (
        <LetterTilesVisual tiles={visual.tiles} targetGraphemes={visual.targetGraphemes} />
      )}
      {visual.type === "phoneme_boxes" && (
        <PhonemeBoxesVisual wordEmoji={visual.wordEmoji} boxCount={visual.boxCount} />
      )}
    </div>
  );
}
