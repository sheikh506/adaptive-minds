"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SONGS, XYLOPHONE, parseSong } from "@/lib/music";
import { audio, playNote } from "./audio";
import { awardSticker } from "@/lib/stickers";

interface Recorded {
  midi: number;
  at: number;
}

/** Xylophone with play-along songs and a tiny recorder. Sounds are made on the device. */
export default function MusicMaker() {
  const [songId, setSongId] = useState<string | null>(null);
  const [pos, setPos] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState<Recorded[]>([]);
  const [message, setMessage] = useState("");
  const startedAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const song = SONGS.find((s) => s.id === songId) ?? null;
  const notes = useMemo(() => (song ? parseSong(song.notes) : []), [song]);
  const target = song && pos < notes.length ? notes[pos].midi : null;

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function flash(midi: number) {
    setLit(midi);
    timers.current.push(setTimeout(() => setLit((cur) => (cur === midi ? null : cur)), 220));
  }

  function hit(midi: number) {
    playNote(midi, { dur: 0.9, gain: 0.9, wave: "triangle" });
    flash(midi);
    awardSticker("music:first-notes");
    if (recording) setRecorded((r) => [...r, { midi, at: performance.now() - startedAt.current }]);
    if (song && target !== null) {
      if (midi === target) {
        const next = pos + 1;
        setPos(next);
        if (next >= notes.length) {
          awardSticker("music:song");
          setMessage(`You played ${song.title}! 🎉`);
        }
      }
    }
  }

  function pickSong(id: string | null) {
    setSongId(id);
    setPos(0);
    setMessage("");
  }

  function listen() {
    if (!song) return;
    const a = audio();
    if (!a) return;
    const beat = 60 / song.tempo;
    let t = a.ctx.currentTime + 0.1;
    for (const n of notes) {
      playNote(n.midi, { when: t, dur: n.beats * beat * 0.95, gain: 0.8 });
      const delay = (t - a.ctx.currentTime) * 1000;
      timers.current.push(setTimeout(() => flash(n.midi), delay));
      t += n.beats * beat;
    }
  }

  function toggleRecord() {
    if (recording) {
      setRecording(false);
      if (recorded.length >= 4) setMessage("Tap Play back to hear your tune!");
    } else {
      setRecorded([]);
      setMessage("");
      startedAt.current = performance.now();
      setRecording(true);
    }
  }

  function playBack() {
    if (recorded.length === 0) return;
    recorded.forEach((n) => {
      timers.current.push(
        setTimeout(() => {
          playNote(n.midi, { dur: 0.9, gain: 0.9 });
          flash(n.midi);
        }, n.at)
      );
    });
    if (recorded.length >= 4) awardSticker("music:composer");
  }

  return (
    <div className="space-y-5">
      <section className="stat-card">
        <h2 className="text-lg font-bold text-gray-900">🎼 Play along</h2>
        <p className="text-sm text-gray-600">Pick a song. The bar you should tap next glows. Or just play freely!</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => pickSong(null)}
            aria-pressed={!song}
            className={`btn-chunky px-4 py-2 text-sm ${!song ? "bg-brand-500 text-white" : "bg-white text-gray-800"}`}
          >
            🎹 Free play
          </button>
          {SONGS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => pickSong(s.id)}
              aria-pressed={songId === s.id}
              className={`btn-chunky px-4 py-2 text-sm ${songId === s.id ? "bg-brand-500 text-white" : "bg-white text-gray-800"}`}
            >
              {s.emoji} {s.title}
            </button>
          ))}
        </div>
        {song && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={listen} className="btn-chunky bg-sky-500 px-4 py-2 text-white">🔊 Listen first</button>
            <button type="button" onClick={() => pickSong(song.id)} className="btn-chunky bg-white px-4 py-2 text-gray-800">↺ Start over</button>
            <span className="text-sm font-semibold text-gray-700">Note {Math.min(pos + 1, notes.length)} of {notes.length}</span>
          </div>
        )}
      </section>

      <div className="rounded-3xl bg-gradient-to-b from-amber-100 to-orange-100 p-4 shadow-inner" role="group" aria-label="Xylophone">
        <div className="flex items-end justify-center gap-2 sm:gap-3">
          {XYLOPHONE.map((bar, i) => {
            const isTarget = target === bar.midi;
            return (
              <button
                key={bar.midi}
                type="button"
                onClick={() => hit(bar.midi)}
                aria-label={`Note ${bar.letter}${bar.midi === 72 ? " high" : ""}`}
                className={`flex w-full max-w-[72px] flex-col items-center justify-end rounded-2xl pb-3 text-lg font-extrabold text-white shadow-[0_5px_0_0_rgba(0,0,0,0.2)] transition-transform active:translate-y-1 ${
                  lit === bar.midi ? "scale-95 brightness-125" : ""
                } ${isTarget ? "ring-4 ring-white ring-offset-2 ring-offset-brand-500" : ""}`}
                style={{ background: bar.color, height: 220 - i * 12 }}
              >
                {bar.letter}
              </button>
            );
          })}
        </div>
      </div>

      <section className="stat-card">
        <h2 className="text-lg font-bold text-gray-900">🎙️ Make your own tune</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleRecord}
            className={`btn-chunky px-5 py-3 text-white ${recording ? "bg-red-500" : "bg-pink-500"}`}
          >
            {recording ? "⏹ Stop" : "⏺ Record"}
          </button>
          <button
            type="button"
            onClick={playBack}
            disabled={recording || recorded.length === 0}
            className="btn-chunky bg-green-500 px-5 py-3 text-white disabled:opacity-50"
          >
            ▶ Play back
          </button>
          {recording && <span className="font-bold text-red-600">Recording… tap the bars!</span>}
        </div>
        {message && <p role="status" className="mt-3 font-bold text-green-700">{message}</p>}
      </section>
    </div>
  );
}
