"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { awardSticker } from "@/lib/stickers";
import { playNote } from "./audio";
import { say } from "./voice";

type GameId = "memory" | "animals" | "bubbles" | "breathe";

const GAMES: { id: GameId; emoji: string; title: string; blurb: string }[] = [
  { id: "memory", emoji: "🧩", title: "Memory Match", blurb: "Find the matching pairs." },
  { id: "animals", emoji: "🐾", title: "Animal Sounds", blurb: "Who makes this sound?" },
  { id: "bubbles", emoji: "🫧", title: "Bubble Pop", blurb: "Pop 20 bubbles. No timer!" },
  { id: "breathe", emoji: "🧘", title: "Calm Cloud", blurb: "Breathe slowly with the cloud." },
];

export default function FunGames({ initial = "memory" }: { initial?: GameId }) {
  const [game, setGame] = useState<GameId>(initial);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pick a game">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGame(g.id)}
            aria-pressed={game === g.id}
            className={`btn-chunky px-4 py-2 text-sm ${game === g.id ? "bg-brand-500 text-white" : "bg-white text-gray-800"}`}
          >
            {g.emoji} {g.title}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600">{GAMES.find((g) => g.id === game)?.blurb}</p>
      {game === "memory" && <Memory />}
      {game === "animals" && <Animals />}
      {game === "bubbles" && <Bubbles />}
      {game === "breathe" && <Breathe />}
    </div>
  );
}

// ─── Memory Match ───────────────────────────────────────────────────────────

const FACES = ["🐶", "🐱", "🐸", "🦁", "🐼", "🐙"];

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Memory() {
  const [deck, setDeck] = useState<string[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [tries, setTries] = useState(0);

  const reset = useCallback(() => {
    setDeck(shuffled([...FACES, ...FACES]));
    setOpen([]);
    setMatched([]);
    setTries(0);
  }, []);

  // shuffle after mount so server and client markup match
  useEffect(() => reset(), [reset]);

  const won = deck.length > 0 && matched.length === deck.length;
  useEffect(() => {
    if (won) awardSticker("game:memory");
  }, [won]);

  function flip(i: number) {
    if (open.length >= 2 || open.includes(i) || matched.includes(i)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setTries((t) => t + 1);
      const [a, b] = next;
      if (deck[a] === deck[b]) {
        playNote(76, { dur: 0.4 });
        setMatched((m) => [...m, a, b]);
        setOpen([]);
      } else {
        setTimeout(() => setOpen([]), 900);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid max-w-md grid-cols-4 gap-3">
        {deck.map((face, i) => {
          const shown = open.includes(i) || matched.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => flip(i)}
              aria-label={shown ? face : "Hidden card"}
              className={`btn-chunky aspect-square text-4xl ${shown ? "bg-white" : "bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white"}`}
            >
              {shown ? face : "?"}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-700">Tries: {tries}</span>
        <button type="button" onClick={reset} className="btn-chunky bg-white px-4 py-2 text-gray-800">New game</button>
        {won && <span role="status" className="font-bold text-green-700">You found them all! 🎉</span>}
      </div>
    </div>
  );
}

// ─── Animal Sounds ──────────────────────────────────────────────────────────

const ANIMALS = [
  { emoji: "🐄", name: "Cow", sound: "Moo" },
  { emoji: "🐑", name: "Sheep", sound: "Baa" },
  { emoji: "🐶", name: "Dog", sound: "Woof" },
  { emoji: "🐱", name: "Cat", sound: "Meow" },
  { emoji: "🦆", name: "Duck", sound: "Quack" },
  { emoji: "🐸", name: "Frog", sound: "Ribbit" },
  { emoji: "🐴", name: "Horse", sound: "Neigh" },
  { emoji: "🐷", name: "Pig", sound: "Oink" },
];
const ROUNDS = 6;

function speak(text: string) {
  say(text, { rate: 0.85, pitch: 1.15 });
}

function Animals() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [order, setOrder] = useState<typeof ANIMALS>([]);
  const [options, setOptions] = useState<typeof ANIMALS>([]);

  const target = order[round];

  const setup = useCallback((r: number, ord: typeof ANIMALS) => {
    const t = ord[r];
    if (!t) return;
    setOptions(shuffled([t, ...shuffled(ANIMALS.filter((a) => a.name !== t.name)).slice(0, 2)]));
    setPicked(null);
  }, []);

  const restart = useCallback(() => {
    const ord = shuffled(ANIMALS).slice(0, ROUNDS);
    setOrder(ord);
    setRound(0);
    setScore(0);
    setup(0, ord);
  }, [setup]);

  useEffect(() => restart(), [restart]);

  const finished = order.length > 0 && round >= ROUNDS;
  useEffect(() => {
    if (finished) awardSticker("game:animal-sounds");
  }, [finished]);

  function choose(name: string) {
    if (picked || !target) return;
    setPicked(name);
    if (name === target.name) setScore((s) => s + 1);
    speak(`${target.sound}! That is a ${target.name}.`);
    setTimeout(() => {
      setRound((r) => r + 1);
      setup(round + 1, order);
    }, 1800);
  }

  if (finished) {
    return (
      <div className="stat-card max-w-md text-center">
        <p className="text-5xl" aria-hidden="true">🎉</p>
        <p className="mt-2 text-xl font-bold">You got {score} out of {ROUNDS}!</p>
        <button type="button" onClick={restart} className="btn-chunky mt-4 bg-brand-500 px-5 py-3 text-white">Play again</button>
      </div>
    );
  }

  if (!target) return null;

  return (
    <div className="stat-card max-w-md space-y-4 text-center">
      <p className="text-sm font-semibold text-gray-600">Round {round + 1} of {ROUNDS}</p>
      <p className="text-3xl font-extrabold text-brand-700">“{target.sound}!”</p>
      <button type="button" onClick={() => speak(`${target.sound}!`)} className="btn-chunky bg-sky-500 px-4 py-2 text-white">🔊 Hear it</button>
      <p className="font-bold text-gray-900">Who says that?</p>
      <div className="grid grid-cols-3 gap-3">
        {options.map((o) => {
          const state = picked ? (o.name === target.name ? "bg-green-100 ring-4 ring-green-400" : o.name === picked ? "bg-red-50 ring-2 ring-red-300" : "bg-white") : "bg-white";
          return (
            <button key={o.name} type="button" onClick={() => choose(o.name)} className={`btn-chunky py-4 ${state}`}>
              <span className="block text-5xl" aria-hidden="true">{o.emoji}</span>
              <span className="mt-1 block text-sm text-gray-800">{o.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Bubble Pop ─────────────────────────────────────────────────────────────

interface Bubble {
  id: number;
  x: number;
  size: number;
  color: string;
  dur: number;
}
const BUBBLE_COLORS = ["#ff6b6b", "#ff9f1c", "#ffd23f", "#9be564", "#2ec4b6", "#3ec6ff", "#8b45f7", "#ff7ac6"];
const GOAL = 20;

function Bubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState(0);
  const nextId = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      setBubbles((b) => {
        if (b.length >= 8) return b;
        const id = nextId.current++;
        return [
          ...b,
          {
            id,
            x: 5 + Math.random() * 80,
            size: 52 + Math.random() * 36,
            color: BUBBLE_COLORS[id % BUBBLE_COLORS.length],
            dur: 6 + Math.random() * 4,
          },
        ];
      });
    }, 900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (popped >= GOAL) awardSticker("game:bubbles");
  }, [popped]);

  function pop(b: Bubble) {
    playNote(72 + (b.id % 5) * 2, { dur: 0.25, gain: 0.7 });
    setBubbles((list) => list.filter((x) => x.id !== b.id));
    setPopped((p) => p + 1);
  }

  return (
    <div className="space-y-3">
      <p className="font-semibold text-gray-700">
        Popped: {popped} {popped >= GOAL && <span className="text-green-700">· Amazing! 🎉 Keep popping if you like.</span>}
      </p>
      <div className="relative h-[420px] overflow-hidden rounded-3xl bg-gradient-to-b from-sky-200 to-cyan-100 shadow-inner">
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-label="Pop the bubble"
            onClick={() => pop(b)}
            onAnimationEnd={() => setBubbles((list) => list.filter((x) => x.id !== b.id))}
            className="absolute bottom-[-100px] rounded-full border-2 border-white/70"
            style={{
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 30% 30%, #fff 0 12%, ${b.color} 60%)`,
              animation: `bubble-rise ${b.dur}s linear forwards`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Calm Cloud ─────────────────────────────────────────────────────────────

const PHASES = [
  { label: "Breathe in…", scale: 1.4 },
  { label: "Hold…", scale: 1.4 },
  { label: "Breathe out…", scale: 0.8 },
];

function Breathe() {
  const [step, setStep] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      const next = (step + 1) % PHASES.length;
      setStep(next);
      if (next === 0) setCycles((c) => c + 1);
    }, 4000);
    return () => clearTimeout(t);
  }, [running, step]);

  useEffect(() => {
    if (cycles >= 3) {
      awardSticker("game:breathe");
      setRunning(false);
    }
  }, [cycles]);

  const phase = PHASES[step];

  return (
    <div className="stat-card flex max-w-md flex-col items-center gap-5 py-8 text-center">
      <div
        className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-indigo-300 text-6xl shadow-lg"
        style={{ transform: `scale(${running ? phase.scale : 1})`, transition: "transform 4s ease-in-out" }}
        aria-hidden="true"
      >
        ☁️
      </div>
      <p role="status" className="text-2xl font-bold text-indigo-800">
        {cycles >= 3 ? "Lovely and calm. 💙" : running ? phase.label : "Ready when you are."}
      </p>
      <p className="text-sm text-gray-600">Three slow breaths. Breathe in, hold, and out.</p>
      <button
        type="button"
        onClick={() => {
          if (cycles >= 3) setCycles(0);
          setStep(0);
          setRunning((r) => !r);
        }}
        className="btn-chunky bg-indigo-500 px-6 py-3 text-white"
      >
        {running ? "Pause" : cycles >= 3 ? "Again" : "Start"}
      </button>
    </div>
  );
}
