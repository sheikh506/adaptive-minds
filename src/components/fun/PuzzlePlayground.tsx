"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { recordPuzzleWin, PUZZLE_WINS_NEEDED, type PuzzleId } from "@/lib/stickers";
import {
  blocksMatch,
  isSlideSolved,
  makeBlockRound,
  makeCountRound,
  makeMatchPairs,
  makeNumberBubbleRound,
  makeOddRound,
  makePatternRound,
  makeSlideRound,
  makeSpotRound,
  shuffle,
  slideMove,
  slideShape,
  type BlockRound,
  type CountRound,
  type Level,
  type MatchPair,
  type NumberBubbleRound,
  type OddRound,
  type PatternRound,
  type SpotRound,
} from "@/lib/puzzles";
import { CHEERS, GENTLE_RETRIES, GREETINGS, pick } from "@/lib/voice-style";
import { bubbleHelp, blockHelp, countHelp, matchHelp, oddHelp, patternHelp, slideHelp, spotHelp, type Help } from "@/lib/hints";
import StepByStep from "@/components/exercises/StepByStep";
import { playSfx } from "./sfx";
import { say, stopSpeaking } from "./voice";
import VoiceToggle from "./VoiceToggle";

interface Ctx {
  /** A correct step. `quiet` plays a happy note only; otherwise the helper also cheers. */
  good(quiet?: boolean): void;
  /** A gentle "try again", with an optional hint. */
  oops(hint?: string): void;
  /** The whole puzzle is finished. */
  win(): void;
  /** The game tells the shell what help fits its current state (or null when there is none). */
  setHelp(help: Help | null): void;
}
interface GameProps {
  level: Level;
  ctx: Ctx;
}

const ROUNDS = 5;

const GAMES: { id: PuzzleId; emoji: string; title: string; K: string; P: string }[] = [
  { id: "match", emoji: "🔗", title: "Match-Up", K: "Tap a picture on the left, then tap the word or number that matches it.", P: "Tap a sum on the left, then tap its answer on the right." },
  { id: "spot", emoji: "🔍", title: "Spot the Difference", K: "Look at both pictures. Tap the 3 things that are different.", P: "Look at both pictures. Tap the 5 things that are different." },
  { id: "blocks", emoji: "🧱", title: "Block Builder", K: "Copy the little picture. Pick a colour, then tap a square to paint it.", P: "Copy the picture with four colours. Pick a colour, then tap a square." },
  { id: "slide", emoji: "🧩", title: "Slide Puzzle", K: "Slide the tiles into the empty space to put the numbers in order, 1 to 5.", P: "Slide the tiles into the empty space to put the numbers in order, 1 to 8." },
  { id: "count", emoji: "🔢", title: "Count & Pick", K: "Count the pictures. Then tap the right number.", P: "Count the pictures carefully. Then tap the right number." },
  { id: "bubbles", emoji: "🫧", title: "Number Bubbles", K: "Pop the bubbles in order: 1, 2, 3, 4, 5.", P: "Pop the bubbles in counting order. Watch out for the wrong numbers!" },
  { id: "pattern", emoji: "🎯", title: "What Comes Next?", K: "Look at the pattern. What comes next?", P: "Look at the pattern. What comes next?" },
  { id: "odd", emoji: "🤔", title: "Odd One Out", K: "One of these does not belong. Tap it.", P: "One of these does not belong. Tap it." },
];

// ─── Shell ──────────────────────────────────────────────────────────────────

/** Eight picture puzzles for Kindergarten and Primary. A friendly voice explains, cheers and never scolds. */
export default function PuzzlePlayground({ initial = "match" }: { initial?: PuzzleId }) {
  const [game, setGame] = useState<PuzzleId>(initial);
  const [level, setLevel] = useState<Level>("K");
  const [round, setRound] = useState(0);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState("");
  const wonRef = useRef(false);
  const first = useRef(true);
  const helpRef = useRef<Help | null>(null);
  // 0 = closed, 1 = the hint, 2 = the hint and the steps (a snapshot taken when the child asked)
  const [helpOpen, setHelpOpen] = useState<{ stage: 0 | 1 | 2; help: Help | null }>({ stage: 0, help: null });

  const info = GAMES.find((g) => g.id === game)!;
  const instruction = info[level];

  // Explain the puzzle whenever a new one starts.
  useEffect(() => {
    const text = first.current ? `${pick(GREETINGS)} ${instruction}` : instruction;
    first.current = false;
    setMsg(instruction);
    setHelpOpen({ stage: 0, help: null });
    say(text);
    return stopSpeaking;
  }, [instruction, round]);

  const ctx = useMemo<Ctx>(
    () => ({
      good(quiet) {
        playSfx("correct");
        setHelpOpen({ stage: 0, help: null });
        if (!quiet) {
          const t = pick(CHEERS);
          setMsg(t);
          say(t);
        }
      },
      oops(hint) {
        playSfx("gentle");
        const t = `${pick(GENTLE_RETRIES)}${hint ? ` Here is a hint: ${hint}` : ""}`;
        setMsg(t);
        say(t);
      },
      win() {
        if (wonRef.current) return;
        wonRef.current = true;
        playSfx("win");
        const t = `${pick(CHEERS)} You finished the puzzle. Thank you for playing with me.`;
        setMsg(t);
        say(t);
        setWon(true);
        recordPuzzleWin(game);
      },
      setHelp(help) {
        helpRef.current = help;
      },
    }),
    [game]
  );

  function askHelp() {
    const help = helpRef.current;
    if (!help || won) return;
    playSfx("hint");
    if (helpOpen.stage === 0) {
      setHelpOpen({ stage: 1, help });
      say(help.hint);
    } else {
      setHelpOpen({ stage: 2, help });
      say(help.steps.join(" "));
    }
  }

  const restart = useCallback((nextGame: PuzzleId, nextLevel: Level) => {
    wonRef.current = false;
    setWon(false);
    setGame(nextGame);
    setLevel(nextLevel);
    setRound((r) => r + 1);
  }, []);

  const body = (() => {
    const props: GameProps = { level, ctx };
    switch (game) {
      case "match": return <MatchUp {...props} />;
      case "spot": return <Spot {...props} />;
      case "blocks": return <Blocks {...props} />;
      case "slide": return <Slide {...props} />;
      case "count": return <Count {...props} />;
      case "bubbles": return <NumberBubbles {...props} />;
      case "pattern": return <Pattern {...props} />;
      case "odd": return <Odd {...props} />;
    }
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="group" aria-label="Pick your level">
          {([["K", "🧸 Little (Kindergarten)"], ["P", "🎒 Big (Primary)"]] as const).map(([l, label]) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => restart(game, l)}
              className={`btn-chunky px-4 py-2 text-sm ${level === l ? "bg-brand-600 text-white" : "bg-white text-gray-800"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <VoiceToggle />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Pick a puzzle">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={game === g.id}
            onClick={() => restart(g.id, level)}
            className={`btn-chunky px-3 py-2 text-sm ${game === g.id ? "bg-kid-coral text-white" : "bg-white text-gray-800"}`}
          >
            {g.emoji} {g.title}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-yellow-50 p-4 ring-2 ring-yellow-200">
        <span className="text-3xl" aria-hidden="true">🧑‍🏫</span>
        <p role="status" className="flex-1 text-lg font-semibold text-gray-900">{msg}</p>
        <button type="button" onClick={() => say(instruction)} className="btn-chunky flex-shrink-0 bg-sky-500 px-3 py-2 text-sm text-white">
          🔊 Listen
        </button>
      </div>

      {!won && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={askHelp}
            disabled={helpOpen.stage === 2}
            className="btn-chunky flex items-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900 disabled:opacity-50"
          >
            💡 {helpOpen.stage === 0 ? "Hint" : helpOpen.stage === 1 ? "Show me how" : "Here is how"}
          </button>
          {helpOpen.stage >= 1 && helpOpen.help && (
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-amber-950" role="status">
              <p className="text-base font-semibold">💡 {helpOpen.help.hint}</p>
              {helpOpen.stage === 2 && helpOpen.help.steps.length > 0 && (
                <StepByStep key={`${game}-${round}-steps`} steps={helpOpen.help.steps} tone="amber" className="mt-2" />
              )}
            </div>
          )}
        </div>
      )}

      <div className="stat-card" key={`${game}-${level}-${round}`}>{body}</div>

      {won && (
        <div className="stat-card space-y-3 bg-gradient-to-br from-yellow-100 to-orange-100 text-center">
          <p className="animate-hop text-5xl" aria-hidden="true">🎉</p>
          <p className="text-xl font-bold text-gray-900">Wonderful work, my friend!</p>
          <p className="text-sm text-gray-700">Finish {PUZZLE_WINS_NEEDED} of the same puzzle to earn its sticker.</p>
          <button type="button" onClick={() => restart(game, level)} className="btn-chunky bg-brand-600 px-6 py-3 text-lg text-white">
            Another puzzle
          </button>
        </div>
      )}
    </div>
  );
}

/** Timers that are cleaned up if the child switches puzzles part-way. */
function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);
  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
}

function Progress({ n, total }: { n: number; total: number }) {
  return (
    <p className="text-center text-sm font-bold text-gray-600">
      Question {Math.min(n + 1, total)} of {total}
    </p>
  );
}

// ─── 1. Match-Up ────────────────────────────────────────────────────────────

const MATCH_COLOURS = ["bg-red-100 ring-red-400", "bg-blue-100 ring-blue-400", "bg-green-100 ring-green-400", "bg-yellow-100 ring-yellow-400", "bg-purple-100 ring-purple-400"];

function MatchUp({ level, ctx }: GameProps) {
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [rights, setRights] = useState<MatchPair[]>([]);
  const [left, setLeft] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const later = useLater();

  useEffect(() => {
    const p = makeMatchPairs(level);
    setPairs(p);
    setRights(shuffle(p));
  }, [level]);

  useEffect(() => {
    ctx.setHelp(pairs.length ? matchHelp(pairs, done, level) : null);
  }, [ctx, pairs, done, level]);

  function pickRight(id: string) {
    if (!left || done.includes(id)) return;
    if (id === left) {
      const next = [...done, id];
      setDone(next);
      setLeft(null);
      if (next.length === pairs.length) ctx.win();
      else ctx.good(true);
    } else {
      setWrong(id);
      setLeft(null);
      ctx.oops();
      later(() => setWrong(null), 700);
    }
  }

  const colourOf = (id: string) => MATCH_COLOURS[pairs.findIndex((p) => p.id === id) % MATCH_COLOURS.length];

  return (
    <div className="mx-auto grid max-w-lg grid-cols-2 gap-x-6 gap-y-3">
      <div className="space-y-3">
        {pairs.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={done.includes(p.id)}
            aria-pressed={left === p.id}
            onClick={() => setLeft(p.id)}
            className={`btn-chunky flex min-h-[4.5rem] w-full items-center justify-center px-2 text-3xl ${
              done.includes(p.id) ? `ring-4 ${colourOf(p.id)}` : left === p.id ? "bg-brand-100 ring-4 ring-brand-500" : "bg-white"
            }`}
          >
            {p.left}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {rights.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={done.includes(p.id) || !left}
            onClick={() => pickRight(p.id)}
            className={`btn-chunky flex min-h-[4.5rem] w-full items-center justify-center px-2 text-2xl font-extrabold text-gray-900 ${
              done.includes(p.id) ? `ring-4 ${colourOf(p.id)}` : wrong === p.id ? "animate-wiggle bg-red-50 ring-2 ring-red-300" : "bg-white"
            }`}
          >
            {p.right}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 2. Spot the Difference ─────────────────────────────────────────────────

function Spot({ level, ctx }: GameProps) {
  const [r, setR] = useState<SpotRound | null>(null);
  const [found, setFound] = useState<number[]>([]);

  useEffect(() => setR(makeSpotRound(level)), [level]);
  useEffect(() => {
    ctx.setHelp(r ? spotHelp(r, found) : null);
  }, [ctx, r, found]);
  if (!r) return null;

  function tap(i: number) {
    if (!r || found.includes(i)) return;
    if (r.diffs.includes(i)) {
      const next = [...found, i];
      setFound(next);
      if (next.length === r.diffs.length) ctx.win();
      else ctx.good(true);
    } else {
      ctx.oops();
    }
  }

  const grid = (cells: string[], name: string) => (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${r.cols}, minmax(0, 1fr))` }} role="group" aria-label={name}>
      {cells.map((e, i) => (
        <button
          key={i}
          type="button"
          onClick={() => tap(i)}
          aria-label={found.includes(i) ? "Found a difference" : "Picture"}
          className={`aspect-square rounded-xl border-2 bg-white text-3xl sm:text-4xl ${found.includes(i) ? "border-green-500 ring-4 ring-green-300" : "border-gray-200 hover:border-brand-400"}`}
        >
          {e}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-center font-bold text-gray-700">Found {found.length} of {r.diffs.length}</p>
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4">
        {grid(r.a, "First picture")}
        {grid(r.b, "Second picture")}
      </div>
    </div>
  );
}

// ─── 3. Block Builder ───────────────────────────────────────────────────────

function Blocks({ level, ctx }: GameProps) {
  const [r, setR] = useState<BlockRound | null>(null);
  const [built, setBuilt] = useState<(number | null)[]>([]);
  const [colour, setColour] = useState(0);

  useEffect(() => {
    const round = makeBlockRound(level);
    setR(round);
    setBuilt(round.target.map(() => null));
  }, [level]);

  useEffect(() => {
    if (r && blocksMatch(built, r.target)) ctx.win();
  }, [built, r, ctx]);

  useEffect(() => {
    ctx.setHelp(r ? blockHelp(r, built) : null);
  }, [ctx, r, built]);

  if (!r) return null;

  const grid = (cells: (number | null)[], onTap?: (i: number) => void) => (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${r.size}, minmax(0, 1fr))` }}>
      {cells.map((c, i) => (
        <button
          key={i}
          type="button"
          disabled={!onTap}
          onClick={() => onTap?.(i)}
          aria-label={c === null ? "Empty square" : r.colours[c].name}
          className="aspect-square rounded-lg border-2 border-white shadow disabled:cursor-default"
          style={{ background: c === null ? "#e5e7eb" : r.colours[c].hex }}
        />
      ))}
    </div>
  );

  return (
    <div className="grid items-start gap-6 sm:grid-cols-2">
      <div className="mx-auto w-full max-w-[14rem]">
        <p className="mb-2 text-center font-bold text-gray-700">Copy this</p>
        {grid(r.target)}
      </div>
      <div className="mx-auto w-full max-w-xs space-y-3">
        <p className="text-center font-bold text-gray-700">Your picture</p>
        {grid(built, (i) => {
          playSfx("paint", colour * 2);
          setBuilt((b) => b.map((c, j) => (j === i ? colour : c)));
        })}
        <div className="flex justify-center gap-2" role="group" aria-label="Pick a colour">
          {r.colours.map((c, i) => (
            <button
              key={c.name}
              type="button"
              aria-label={c.name}
              aria-pressed={colour === i}
              onClick={() => setColour(i)}
              className={`h-12 w-12 rounded-full border-4 ${colour === i ? "border-gray-900 scale-110" : "border-white"} shadow`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 4. Slide Puzzle ────────────────────────────────────────────────────────

const TILE_COLOURS = ["bg-red-300", "bg-orange-300", "bg-yellow-300", "bg-lime-300", "bg-emerald-300", "bg-sky-300", "bg-indigo-300", "bg-pink-300"];
const TILE_FACES = ["🐶", "🐱", "🐸", "🦁", "🐼", "🐙", "🦊", "🐯"];

function Slide({ level, ctx }: GameProps) {
  const shape = slideShape(level);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => setTiles(makeSlideRound(level)), [level]);
  useEffect(() => {
    ctx.setHelp(tiles.length ? slideHelp(tiles, slideShape(level)) : null);
  }, [ctx, tiles, level]);
  if (tiles.length === 0) return null;

  function tap(i: number) {
    const next = slideMove(tiles, shape, i);
    if (!next) return ctx.oops("Only tiles next to the empty space can slide.");
    setTiles(next);
    setMoves((m) => m + 1);
    playSfx("flip");
    if (isSlideSolved(next, shape)) ctx.win();
  }

  return (
    <div className="space-y-3">
      <div className="mx-auto grid max-w-xs gap-2" style={{ gridTemplateColumns: `repeat(${shape.cols}, minmax(0, 1fr))` }}>
        {tiles.map((t, i) =>
          t === 0 ? (
            <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50" aria-label="Empty space" />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              aria-label={`Tile ${t}`}
              className={`btn-chunky aspect-square ${TILE_COLOURS[(t - 1) % TILE_COLOURS.length]} text-gray-900`}
            >
              <span className="block text-3xl font-extrabold">{t}</span>
              <span className="block text-2xl" aria-hidden="true">{TILE_FACES[(t - 1) % TILE_FACES.length]}</span>
            </button>
          )
        )}
      </div>
      <p className="text-center text-sm font-semibold text-gray-600">Moves: {moves}</p>
    </div>
  );
}

// ─── 5. Count & Pick ────────────────────────────────────────────────────────

function Count({ level, ctx }: GameProps) {
  const [r, setR] = useState<CountRound | null>(null);
  const [n, setN] = useState(0);
  const [tried, setTried] = useState<number[]>([]);
  const [right, setRight] = useState(false);
  const later = useLater();

  useEffect(() => setR(makeCountRound(level)), [level]);
  useEffect(() => {
    ctx.setHelp(r && !right ? countHelp(r) : null);
  }, [ctx, r, right]);
  if (!r) return null;

  function choose(v: number) {
    if (!r || right || tried.includes(v)) return;
    if (v === r.count) {
      setRight(true);
      if (n + 1 >= ROUNDS) return ctx.win();
      ctx.good();
      later(() => {
        setN(n + 1);
        setTried([]);
        setRight(false);
        setR(makeCountRound(level));
      }, 1500);
    } else {
      setTried((t) => [...t, v]);
      ctx.oops();
    }
  }

  return (
    <div className="space-y-4 text-center">
      <Progress n={n} total={ROUNDS} />
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 rounded-2xl bg-sky-50 p-4 text-4xl" aria-label={`${r.count} pictures`}>
        {Array.from({ length: r.count }, (_, i) => (
          <span key={i} className="animate-pop" style={{ animationDelay: `${i * 60}ms` }}>{r.emoji}</span>
        ))}
      </div>
      <p className="text-lg font-bold text-gray-900">How many do you see?</p>
      <div className="flex justify-center gap-3">
        {r.options.map((o) => (
          <button
            key={o}
            type="button"
            disabled={tried.includes(o) || (right && o !== r.count)}
            onClick={() => choose(o)}
            className={`btn-chunky h-20 w-20 text-4xl ${right && o === r.count ? "bg-green-200 ring-4 ring-green-400" : "bg-white"} text-gray-900 disabled:opacity-40`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 6. Number Bubbles ──────────────────────────────────────────────────────

const BUBBLE_COLOURS = ["#ff6b6b", "#ff9f1c", "#ffd23f", "#9be564", "#2ec4b6", "#3ec6ff", "#8b45f7", "#ff7ac6"];

function NumberBubbles({ level, ctx }: GameProps) {
  const [r, setR] = useState<NumberBubbleRound | null>(null);
  const [next, setNext] = useState(0);
  const [popped, setPopped] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const later = useLater();

  useEffect(() => setR(makeNumberBubbleRound(level)), [level]);
  useEffect(() => {
    ctx.setHelp(r ? bubbleHelp(r, next) : null);
  }, [ctx, r, next]);
  if (!r) return null;

  function pop(v: number) {
    if (!r || popped.includes(v)) return;
    if (v === r.sequence[next]) {
      const list = [...popped, v];
      setPopped(list);
      setNext(next + 1);
      playSfx("pop", next);
      if (next + 1 === r.sequence.length) ctx.win();
    } else {
      setShake(v);
      ctx.oops(`Look for the number ${r.sequence[next]}.`);
      later(() => setShake(null), 600);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-center font-bold text-gray-700">{r.instruction}</p>
      <div className="relative flex min-h-[16rem] flex-wrap items-center justify-center gap-5 rounded-3xl bg-gradient-to-b from-sky-200 to-cyan-100 p-6 shadow-inner">
        {r.bubbles.map((v, i) =>
          popped.includes(v) ? null : (
            <button
              key={v}
              type="button"
              aria-label={`Bubble ${v}`}
              onClick={() => pop(v)}
              className={`flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/80 text-3xl font-extrabold text-gray-900 shadow-lg ${shake === v ? "animate-wiggle" : "animate-float"}`}
              style={{
                background: `radial-gradient(circle at 30% 30%, #fff 0 14%, ${BUBBLE_COLOURS[i % BUBBLE_COLOURS.length]} 70%)`,
                animationDelay: `${i * 200}ms`,
              }}
            >
              {v}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── 7. What Comes Next? ────────────────────────────────────────────────────

function Pattern({ level, ctx }: GameProps) {
  const [r, setR] = useState<PatternRound | null>(null);
  const [n, setN] = useState(0);
  const [tried, setTried] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const later = useLater();

  useEffect(() => setR(makePatternRound(level)), [level]);
  useEffect(() => {
    ctx.setHelp(r && !right ? patternHelp(r) : null);
  }, [ctx, r, right]);
  if (!r) return null;

  function choose(v: string) {
    if (!r || right || tried.includes(v)) return;
    if (v === r.answer) {
      setRight(true);
      if (n + 1 >= ROUNDS) return ctx.win();
      ctx.good();
      later(() => {
        setN(n + 1);
        setTried([]);
        setRight(false);
        setR(makePatternRound(level));
      }, 1500);
    } else {
      setTried((t) => [...t, v]);
      ctx.oops("Say the pattern out loud and listen for what repeats.");
    }
  }

  return (
    <div className="space-y-4 text-center">
      <Progress n={n} total={ROUNDS} />
      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2 rounded-2xl bg-violet-50 p-4 text-4xl">
        {r.shown.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
        <span className={`flex h-14 w-14 items-center justify-center rounded-xl border-4 border-dashed border-violet-400 bg-white ${right ? "" : "animate-float"}`} aria-label="Missing picture">
          {right ? r.answer : "❓"}
        </span>
      </div>
      <div className="flex justify-center gap-3">
        {r.options.map((o) => (
          <button
            key={o}
            type="button"
            disabled={tried.includes(o) || (right && o !== r.answer)}
            onClick={() => choose(o)}
            className={`btn-chunky h-20 w-20 text-4xl ${right && o === r.answer ? "bg-green-200 ring-4 ring-green-400" : "bg-white"} disabled:opacity-40`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 8. Odd One Out ─────────────────────────────────────────────────────────

function Odd({ level, ctx }: GameProps) {
  const [r, setR] = useState<OddRound | null>(null);
  const [n, setN] = useState(0);
  const [tried, setTried] = useState<number[]>([]);
  const [right, setRight] = useState(false);
  const later = useLater();

  useEffect(() => setR(makeOddRound(level)), [level]);
  useEffect(() => {
    ctx.setHelp(r && !right ? oddHelp(r) : null);
  }, [ctx, r, right]);
  if (!r) return null;

  function choose(i: number) {
    if (!r || right || tried.includes(i)) return;
    if (i === r.oddIndex) {
      setRight(true);
      if (n + 1 >= ROUNDS) return ctx.win();
      ctx.good();
      later(() => {
        setN(n + 1);
        setTried([]);
        setRight(false);
        setR(makeOddRound(level));
      }, 1500);
    } else {
      setTried((t) => [...t, i]);
      ctx.oops(r.hint);
    }
  }

  return (
    <div className="space-y-4 text-center">
      <Progress n={n} total={ROUNDS} />
      <div className="flex flex-wrap justify-center gap-3">
        {r.items.map((it, i) => (
          <button
            key={i}
            type="button"
            disabled={tried.includes(i)}
            onClick={() => choose(i)}
            className={`btn-chunky h-24 w-24 text-4xl ${right && i === r.oddIndex ? "bg-green-200 ring-4 ring-green-400" : "bg-white"} text-gray-900 disabled:opacity-40`}
          >
            {it}
          </button>
        ))}
      </div>
      {right && <p className="font-semibold text-gray-700">{r.hint}</p>}
    </div>
  );
}
