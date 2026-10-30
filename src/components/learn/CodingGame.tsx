"use client";

/**
 * Early Coding Module — Block-based robot sequencing.
 *
 * Educational goal: understand sequences, loops and conditionals as instructions.
 * Suitable for ages 5–7. No reading required beyond short labels.
 * No time pressure. Large touch targets. Calm feedback.
 *
 * P2 Developmental Learning — Executive function & early coding.
 */

import { useState, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Block = { id: string; type: Direction | "REPEAT" | "CLEAR"; label: string; emoji: string };
type Cell = "empty" | "path" | "obstacle" | "gem" | "robot" | "goal";

interface Level {
  id: number;
  title: string;
  description: string;
  gridSize: number;
  grid: Cell[][];
  robotStart: [number, number]; // [row, col]
  goalPos: [number, number];
  gems: [number, number][];
  maxBlocks: number;
  hint: string;
}

// ─── Levels ─────────────────────────────────────────────────────────────────

const LEVELS: Level[] = [
  {
    id: 1,
    title: "Take one step",
    description: "Move the robot RIGHT to reach the star!",
    gridSize: 4,
    grid: [
      ["empty","empty","empty","empty"],
      ["empty","robot","empty","goal" ],
      ["empty","empty","empty","empty"],
      ["empty","empty","empty","empty"],
    ],
    robotStart: [1, 1],
    goalPos: [1, 3],
    gems: [],
    maxBlocks: 3,
    hint: "Add two RIGHT blocks.",
  },
  {
    id: 2,
    title: "Turn the corner",
    description: "Move RIGHT then DOWN to reach the star.",
    gridSize: 4,
    grid: [
      ["empty","empty","empty","empty"],
      ["empty","robot","empty","empty"],
      ["empty","empty","empty","empty"],
      ["empty","empty","empty","goal" ],
    ],
    robotStart: [1, 1],
    goalPos: [3, 3],
    gems: [],
    maxBlocks: 6,
    hint: "Add RIGHT, RIGHT, DOWN, DOWN.",
  },
  {
    id: 3,
    title: "Collect a gem",
    description: "Move the robot to collect the gem, then reach the star.",
    gridSize: 5,
    grid: [
      ["empty","empty","empty","empty","empty"],
      ["empty","robot","empty","gem"  ,"empty"],
      ["empty","empty","empty","empty","empty"],
      ["empty","empty","empty","empty","goal" ],
      ["empty","empty","empty","empty","empty"],
    ],
    robotStart: [1, 1],
    goalPos: [3, 4],
    gems: [[1, 3]],
    maxBlocks: 8,
    hint: "Go RIGHT to collect the gem, then DOWN twice and RIGHT to reach the star.",
  },
  {
    id: 4,
    title: "Avoid the rocks",
    description: "Steer around the rocks to reach the star!",
    gridSize: 5,
    grid: [
      ["empty"   ,"empty"   ,"empty","empty","empty"],
      ["empty"   ,"robot"   ,"empty","empty","empty"],
      ["empty"   ,"obstacle","obstacle","empty","empty"],
      ["empty"   ,"empty"   ,"empty","empty","empty"],
      ["empty"   ,"empty"   ,"empty","goal" ,"empty"],
    ],
    robotStart: [1, 1],
    goalPos: [4, 3],
    gems: [],
    maxBlocks: 10,
    hint: "Go RIGHT first to get around the rocks, then DOWN and LEFT.",
  },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const AVAILABLE_BLOCKS: Block[] = [
  { id: "UP",    type: "UP",    label: "Up",    emoji: "⬆️" },
  { id: "DOWN",  type: "DOWN",  label: "Down",  emoji: "⬇️" },
  { id: "LEFT",  type: "LEFT",  label: "Left",  emoji: "⬅️" },
  { id: "RIGHT", type: "RIGHT", label: "Right", emoji: "➡️" },
];

const CELL_RENDER: Record<Cell, { bg: string; content: string }> = {
  empty:    { bg: "#f8fafc", content: "" },
  path:     { bg: "#dbeafe", content: "" },
  obstacle: { bg: "#374151", content: "🪨" },
  gem:      { bg: "#fef9c3", content: "💎" },
  robot:    { bg: "#dcfce7", content: "🤖" },
  goal:     { bg: "#fef3c7", content: "⭐" },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function CodingGame() {
  const [levelIdx, setLevelIdx] = useState(0);
  const level = LEVELS[levelIdx];

  const [program, setProgram] = useState<Block[]>([]);
  const [running, setRunning] = useState(false);
  const [robotPos, setRobotPos] = useState<[number, number]>(level.robotStart);
  const [collected, setCollected] = useState<[number, number][]>([]);
  const [status, setStatus] = useState<"idle" | "win" | "crash" | "outofbounds">("idle");
  const [stepIdx, setStepIdx] = useState(-1);

  const resetLevel = useCallback((idx: number) => {
    const l = LEVELS[idx];
    setProgram([]);
    setRobotPos(l.robotStart);
    setCollected([]);
    setStatus("idle");
    setRunning(false);
    setStepIdx(-1);
  }, []);

  function addBlock(block: Block) {
    if (running || program.length >= level.maxBlocks) return;
    setProgram((p) => [...p, { ...block, id: `${block.type}-${Date.now()}` }]);
  }

  function removeBlock(idx: number) {
    if (running) return;
    setProgram((p) => p.filter((_, i) => i !== idx));
  }

  async function runProgram() {
    if (program.length === 0 || running) return;
    setRunning(true);
    setStatus("idle");

    let [r, c] = level.robotStart;
    const gems = new Set(level.gems.map(([gr, gc]) => `${gr},${gc}`));
    const collectedList: [number, number][] = [];

    for (let i = 0; i < program.length; i++) {
      setStepIdx(i);
      await new Promise((res) => setTimeout(res, 500));

      const move = program[i].type as Direction;
      if (move === "UP")    r--;
      if (move === "DOWN")  r++;
      if (move === "LEFT")  c--;
      if (move === "RIGHT") c++;

      // bounds check
      if (r < 0 || r >= level.gridSize || c < 0 || c >= level.gridSize) {
        setRobotPos([Math.max(0, Math.min(level.gridSize - 1, r)), Math.max(0, Math.min(level.gridSize - 1, c))]);
        setStatus("outofbounds");
        setRunning(false);
        setStepIdx(-1);
        return;
      }

      // obstacle check
      const cell = level.grid[r][c];
      if (cell === "obstacle") {
        setRobotPos([r, c]);
        setStatus("crash");
        setRunning(false);
        setStepIdx(-1);
        return;
      }

      // gem collection
      const key = `${r},${c}`;
      if (gems.has(key)) {
        gems.delete(key);
        collectedList.push([r, c]);
        setCollected([...collectedList]);
      }

      setRobotPos([r, c]);
    }

    setStepIdx(-1);
    setRunning(false);

    // Check win
    const [gr, gc] = level.goalPos;
    const allGems = level.gems.every(([gemR, gemC]) => collectedList.some(([cr, cc]) => cr === gemR && cc === gemC));
    if (r === gr && c === gc && allGems) {
      setStatus("win");
    }
  }

  // Build display grid
  function buildDisplayGrid(): Cell[][] {
    const g = level.grid.map((row) => [...row] as Cell[]);
    // clear robot from original start
    const [sr, sc] = level.robotStart;
    if (g[sr][sc] === "robot") g[sr][sc] = "empty";
    // clear collected gems
    collected.forEach(([r, c]) => { if (g[r][c] === "gem") g[r][c] = "empty"; });
    // place robot at current pos
    const [rr, rc] = robotPos;
    if (g[rr][rc] !== "goal" && g[rr][rc] !== "obstacle") g[rr][rc] = "robot";
    return g;
  }

  const grid = buildDisplayGrid();
  const cellSize = level.gridSize <= 4 ? 72 : 60;

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 720, margin: "0 auto" }}>
      {/* Level selector */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1rem" }}>
        {LEVELS.map((l, i) => (
          <button
            key={l.id}
            onClick={() => { setLevelIdx(i); resetLevel(i); }}
            style={{
              padding: "6px 14px", borderRadius: "20px", fontWeight: "bold", fontSize: "13px",
              background: levelIdx === i ? "#4f46e5" : "#e5e7eb",
              color: levelIdx === i ? "#fff" : "#374151",
              border: "none", cursor: "pointer",
            }}
          >
            Level {l.id}: {l.title}
          </button>
        ))}
      </div>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: "16px", padding: "14px 18px", color: "#fff", marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>🤖 {level.title}</h2>
        <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>{level.description}</p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {/* Grid */}
        <div>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px", fontWeight: "bold" }}>ROBOT WORLD</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${level.gridSize}, ${cellSize}px)`,
            gap: "4px",
            padding: "8px",
            background: "#f1f5f9",
            borderRadius: "12px",
            border: "2px solid #e2e8f0",
          }}>
            {grid.flat().map((cell, idx) => {
              const { bg, content } = CELL_RENDER[cell];
              return (
                <div key={idx} style={{
                  width: cellSize, height: cellSize, background: bg,
                  borderRadius: "8px", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: cellSize * 0.45,
                  border: "1px solid #e2e8f0",
                }}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {/* Block palette */}
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#6b7280", marginBottom: "6px" }}>ADD BLOCKS TO YOUR PROGRAM</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "1rem" }}>
            {AVAILABLE_BLOCKS.map((b) => (
              <button
                key={b.id}
                onClick={() => addBlock(b)}
                disabled={running || program.length >= level.maxBlocks}
                style={{
                  width: 72, height: 72, borderRadius: "12px", fontSize: "28px",
                  background: "#ede9fe", border: "2px solid #8b5cf6",
                  cursor: running ? "not-allowed" : "pointer", display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "2px", fontWeight: "bold",
                }}
                aria-label={`Add ${b.label} block`}
              >
                {b.emoji}
                <span style={{ fontSize: "11px", color: "#6d28d9" }}>{b.label}</span>
              </button>
            ))}
          </div>

          {/* Program */}
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#6b7280", marginBottom: "6px" }}>
            YOUR PROGRAM ({program.length}/{level.maxBlocks} blocks)
          </p>
          <div style={{
            minHeight: 60, padding: "8px", background: "#f8fafc",
            borderRadius: "10px", border: "2px dashed #cbd5e1",
            display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "0.75rem",
          }}>
            {program.length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "auto" }}>Tap the arrow blocks above to add steps</p>
            )}
            {program.map((block, i) => (
              <button
                key={block.id}
                onClick={() => removeBlock(i)}
                style={{
                  width: 48, height: 48, borderRadius: "8px", fontSize: "22px",
                  background: stepIdx === i ? "#fef9c3" : "#ddd6fe",
                  border: stepIdx === i ? "3px solid #d97706" : "2px solid #8b5cf6",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                title="Tap to remove"
                aria-label={`Remove ${block.label} block`}
              >
                {block.emoji}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "0.75rem" }}>
            <button
              onClick={runProgram}
              disabled={running || program.length === 0}
              style={{
                flex: 1, padding: "10px 0", borderRadius: "10px", fontWeight: "bold",
                fontSize: "15px", background: running ? "#94a3b8" : "#22c55e",
                color: "#fff", border: "none", cursor: running ? "not-allowed" : "pointer",
              }}
            >
              ▶ Run
            </button>
            <button
              onClick={() => resetLevel(levelIdx)}
              disabled={running}
              style={{
                padding: "10px 18px", borderRadius: "10px", fontWeight: "bold",
                fontSize: "15px", background: "#f1f5f9", color: "#374151",
                border: "2px solid #e2e8f0", cursor: running ? "not-allowed" : "pointer",
              }}
            >
              ↺ Reset
            </button>
          </div>

          {/* Status */}
          {status === "win" && (
            <div style={{ background: "#dcfce7", border: "2px solid #22c55e", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "24px", margin: 0 }}>🎉</p>
              <p style={{ fontWeight: "bold", color: "#166534", margin: "4px 0" }}>Amazing! You did it!</p>
              {levelIdx < LEVELS.length - 1 && (
                <button
                  onClick={() => { setLevelIdx(levelIdx + 1); resetLevel(levelIdx + 1); }}
                  style={{ marginTop: "8px", padding: "8px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Next Level →
                </button>
              )}
            </div>
          )}
          {status === "crash" && (
            <div style={{ background: "#fee2e2", border: "2px solid #ef4444", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "20px", margin: 0 }}>🪨 Oops! The robot hit a rock!</p>
              <p style={{ fontSize: "13px", color: "#991b1b", margin: "4px 0" }}>Try a different path.</p>
            </div>
          )}
          {status === "outofbounds" && (
            <div style={{ background: "#fef3c7", border: "2px solid #d97706", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "20px", margin: 0 }}>🚧 The robot fell off the edge!</p>
              <p style={{ fontSize: "13px", color: "#92400e", margin: "4px 0" }}>Stay inside the grid.</p>
            </div>
          )}

          {/* Hint */}
          {status === "idle" && (
            <details style={{ marginTop: "0.5rem" }}>
              <summary style={{ fontSize: "13px", color: "#6d28d9", cursor: "pointer", fontWeight: "bold" }}>💡 Need a hint?</summary>
              <p style={{ fontSize: "13px", color: "#374151", marginTop: "6px", padding: "8px", background: "#ede9fe", borderRadius: "8px" }}>{level.hint}</p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
