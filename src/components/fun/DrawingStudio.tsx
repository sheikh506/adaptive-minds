"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PALETTE } from "@/lib/crafts";
import { awardSticker } from "@/lib/stickers";

const SIZES = [4, 10, 20];
const STAMPS = ["⭐", "❤️", "🌸", "🐱", "🦋", "🌈", "🚀", "🐟"];
const W = 800;
const H = 520;

type Tool = "brush" | "eraser" | "stamp";

/** Free drawing on a canvas. Nothing is uploaded: pictures are saved to the child's device as PNG. */
export default function DrawingStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(PALETTE[5]);
  const [size, setSize] = useState(SIZES[1]);
  const [tool, setTool] = useState<Tool>("brush");
  const [stamp, setStamp] = useState(STAMPS[0]);
  const [saved, setSaved] = useState(false);

  const ctx = useCallback(() => canvasRef.current?.getContext("2d") ?? null, []);

  const clear = useCallback(() => {
    const c = ctx();
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
  }, [ctx]);

  useEffect(() => {
    clear();
  }, [clear]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = ctx();
    if (!c) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    if (tool === "stamp") {
      c.font = "56px serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(stamp, p.x, p.y);
      return;
    }
    drawing.current = true;
    last.current = p;
    c.fillStyle = tool === "eraser" ? "#ffffff" : color;
    c.beginPath();
    c.arc(p.x, p.y, (tool === "eraser" ? size * 1.5 : size) / 2, 0, Math.PI * 2);
    c.fill();
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;
    const c = ctx();
    if (!c) return;
    const p = point(e);
    c.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    c.lineWidth = tool === "eraser" ? size * 1.5 : size;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(last.current.x, last.current.y);
    c.lineTo(p.x, p.y);
    c.stroke();
    last.current = p;
  }

  function up() {
    drawing.current = false;
    last.current = null;
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "my-drawing.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
    awardSticker("art:first-drawing");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div className="stat-card flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Colours">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              onClick={() => {
                setColor(c);
                if (tool === "eraser") setTool("brush");
              }}
              className={`h-9 w-9 rounded-full border-2 ${color === c && tool !== "eraser" ? "scale-110 border-gray-900" : "border-gray-300"}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Brush size">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Brush size ${s}`}
              onClick={() => setSize(s)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${size === s ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white"}`}
            >
              <span className="rounded-full bg-gray-800" style={{ width: s + 2, height: s + 2 }} />
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setTool("brush")} className={`btn-chunky px-3 py-2 text-sm ${tool === "brush" ? "bg-brand-500 text-white" : "bg-white text-gray-800"}`}>🖌️ Brush</button>
          <button type="button" onClick={() => setTool("eraser")} className={`btn-chunky px-3 py-2 text-sm ${tool === "eraser" ? "bg-brand-500 text-white" : "bg-white text-gray-800"}`}>🧽 Eraser</button>
          <button type="button" onClick={() => setTool("stamp")} className={`btn-chunky px-3 py-2 text-sm ${tool === "stamp" ? "bg-brand-500 text-white" : "bg-white text-gray-800"}`}>⭐ Stamp</button>
        </div>
      </div>

      {tool === "stamp" && (
        <div className="stat-card flex flex-wrap gap-2" role="group" aria-label="Stamps">
          {STAMPS.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Stamp ${s}`}
              onClick={() => setStamp(s)}
              className={`h-12 w-12 rounded-xl border-2 text-2xl ${stamp === s ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        aria-label="Drawing area"
        className="w-full touch-none rounded-3xl border-4 border-white bg-white shadow-lg"
        style={{ cursor: "crosshair", aspectRatio: `${W} / ${H}` }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={clear} className="btn-chunky bg-white px-5 py-3 text-gray-800">🗑️ Clear</button>
        <button type="button" onClick={save} className="btn-chunky bg-gradient-to-r from-brand-500 to-pink-500 px-5 py-3 text-white">💾 Save my picture</button>
        {saved && <span role="status" className="font-bold text-green-700">Saved to your device! 🎉</span>}
      </div>
    </div>
  );
}
