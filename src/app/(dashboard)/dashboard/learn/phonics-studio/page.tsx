"use client";

import { useState } from "react";
import { Volume2, Play, CheckCircle2, RotateCcw, HelpCircle, ArrowRight, Mic, Sparkles } from "lucide-react";

interface Phoneme {
  letter: string;
  sound: string;
  example: string;
  emoji: string;
  usAudio: string;
  ukAudio: string;
}

const PHONEMES: Phoneme[] = [
  { letter: "a", sound: "/æ/", example: "apple", emoji: "🍎", usAudio: "short a sound", ukAudio: "short a sound" },
  { letter: "e", sound: "/e/", example: "egg", emoji: "🥚", usAudio: "short e sound", ukAudio: "short e sound" },
  { letter: "i", sound: "/ɪ/", example: "ink", emoji: "🐙", usAudio: "short i sound", ukAudio: "short i sound" },
  { letter: "o", sound: "/ɒ/", example: "octopus", emoji: "🐙", usAudio: "ah sound", ukAudio: "oh sound" },
  { letter: "u", sound: "/ʌ/", example: "umbrella", emoji: "☔", usAudio: "uh sound", ukAudio: "uh sound" },
  { letter: "b", sound: "/b/", example: "bat", emoji: "🦇", usAudio: "buh sound", ukAudio: "b sound" },
  { letter: "c", sound: "/k/", example: "cat", emoji: "🐱", usAudio: "kuh sound", ukAudio: "k sound" },
  { letter: "d", sound: "/d/", example: "dog", emoji: "🐶", usAudio: "duh sound", ukAudio: "d sound" },
  { letter: "f", sound: "/f/", example: "frog", emoji: "🐸", usAudio: "f sound", ukAudio: "f sound" },
  { letter: "g", sound: "/g/", example: "goat", emoji: "🐐", usAudio: "guh sound", ukAudio: "g sound" },
  { letter: "h", sound: "/h/", example: "hat", emoji: "🎩", usAudio: "h sound", ukAudio: "h sound" },
  { letter: "j", sound: "/dʒ/", example: "jam", emoji: "🍓", usAudio: "juh sound", ukAudio: "j sound" },
  { letter: "m", sound: "/m/", example: "monkey", emoji: "🐵", usAudio: "m sound", ukAudio: "m sound" },
  { letter: "p", sound: "/p/", example: "pig", emoji: "🐷", usAudio: "puh sound", ukAudio: "p sound" },
  { letter: "s", sound: "/s/", example: "sun", emoji: "☀️", usAudio: "s sound", ukAudio: "s sound" },
  { letter: "t", sound: "/t/", example: "tent", emoji: "⛺", usAudio: "tuh sound", ukAudio: "t sound" },
];

const BLENDING_WORDS = [
  { word: "cat", parts: ["c", "a", "t"], sounds: ["/k/", "/æ/", "/t/"], emoji: "🐱" },
  { word: "dog", parts: ["d", "o", "g"], sounds: ["/d/", "/ɒ/", "/g/"], emoji: "🐶" },
  { word: "bed", parts: ["b", "e", "d"], sounds: ["/b/", "/e/", "/d/"], emoji: "🛏️" },
  { word: "pig", parts: ["p", "i", "g"], sounds: ["/p/", "/ɪ/", "/g/"], emoji: "🐷" },
  { word: "sun", parts: ["s", "u", "n"], sounds: ["/s/", "/ʌ/", "/n/"], emoji: "☀️" },
];

export default function PhonicsStudio() {
  const [accent, setAccent] = useState<"US" | "UK">("UK");
  const [selectedPhoneme, setSelectedPhoneme] = useState<Phoneme | null>(null);

  // Blending states
  const [activeBlend, setActiveBlend] = useState(BLENDING_WORDS[0]);
  const [blendProgress, setBlendProgress] = useState<number>(-1);
  const [blendComplete, setBlendProgressComplete] = useState(false);

  // Tile Builder states
  const [tileWord, setTileWord] = useState({ target: "sun", tiles: ["n", "u", "s", "p", "a"], emoji: "☀️" });
  const [builtWord, setBuiltWord] = useState<string[]>([]);
  const [tileSuccess, setTileSuccess] = useState(false);

  // Mic states
  const [micActive, setMicActive] = useState(false);
  const [micText, setMicText] = useState("Tap the mic and say the word!");
  const [micSuccess, setMicSuccess] = useState(false);

  // Text-To-Speech phonetic reader using native speech synthesis
  const playSound = (text: string, rate: number = 0.8) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.lang = accent === "US" ? "en-US" : "en-GB";
    window.speechSynthesis.speak(utter);
  };

  const handlePhonemeClick = (p: Phoneme) => {
    setSelectedPhoneme(p);
    // Play sound description
    const cue = accent === "US" ? p.usAudio : p.ukAudio;
    playSound(`The letter ${p.letter} makes the sound ${cue}, as in ${p.example}`);
  };

  const startBlending = async () => {
    setBlendProgressComplete(false);
    for (let i = 0; i < activeBlend.parts.length; i++) {
      setBlendProgress(i);
      playSound(activeBlend.parts[i], 0.6);
      await new Promise((r) => setTimeout(r, 900));
    }
    setBlendProgress(-1);
    setBlendProgressComplete(true);
    playSound(activeBlend.word, 0.8);
  };

  const selectTile = (letter: string) => {
    if (builtWord.length < tileWord.target.length) {
      const updated = [...builtWord, letter];
      setBuiltWord(updated);
      playSound(letter, 0.9);

      if (updated.join("") === tileWord.target) {
        setTileSuccess(true);
        playSound(`Excellent! You spelled ${tileWord.target}!`);
      } else if (updated.length === tileWord.target.length) {
        playSound("Let's try again! Press restart.");
      }
    }
  };

  const startMicSimulation = () => {
    setMicActive(true);
    setMicSuccess(false);
    setMicText("Listening... 🗣️");
    setTimeout(() => {
      setMicText(`Heard: "${tileWord.target}"! Awesome job!`);
      setMicSuccess(true);
      setMicActive(false);
      playSound(`Wonderful speaking!`);
    }, 2000);
  };

  const resetTileBuilder = () => {
    setBuiltWord([]);
    setTileSuccess(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-100">Listen, Speak & Read Studio</p>
            <h1 className="text-3xl font-extrabold mt-1">Phonics Laboratory 🧪</h1>
            <p className="text-sm text-teal-50 mt-1">
              Explore pure sounds, build words with letter tiles, and practice your speaking!
            </p>
          </div>
          {/* Accent Selector */}
          <div className="flex bg-black/15 rounded-2xl p-1 self-start sm:self-center border border-white/10">
            <button
              onClick={() => { setAccent("UK"); playSound("British English"); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${accent === "UK" ? "bg-white text-teal-800 shadow" : "text-white"}`}
            >
              UK Pronunciation 🇬🇧
            </button>
            <button
              onClick={() => { setAccent("US"); playSound("American English"); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${accent === "US" ? "bg-white text-teal-800 shadow" : "text-white"}`}
            >
              US Pronunciation 🇺🇸
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Module 1: Interactive Sound Board */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔊</span>
            <div>
              <h2 className="font-extrabold text-gray-900">Sound Board</h2>
              <p className="text-xs text-gray-500">Tap a companion letter to hear its pure phonetic sound.</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {PHONEMES.map((p) => (
              <button
                key={p.letter}
                onClick={() => handlePhonemeClick(p)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${
                  selectedPhoneme?.letter === p.letter
                    ? "bg-teal-50 border-teal-500 text-teal-800"
                    : "bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-800"
                }`}
              >
                <span className="text-2xl font-extrabold uppercase">{p.letter}</span>
                <span className="text-xs font-bold text-gray-400 mt-0.5">{p.sound}</span>
              </button>
            ))}
          </div>

          {selectedPhoneme && (
            <div className="rounded-2xl bg-teal-50/50 border border-teal-100 p-4 flex items-center gap-3">
              <span className="text-4xl">{selectedPhoneme.emoji}</span>
              <div>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Letter Sound</p>
                <h3 className="font-bold text-gray-950 text-sm">
                  Letter &quot;{selectedPhoneme.letter.toUpperCase()}&quot; makes the sound <strong className="text-teal-700">{selectedPhoneme.sound}</strong>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">As in the word: <span className="font-semibold text-gray-800 capitalize">{selectedPhoneme.example}</span></p>
              </div>
              <button
                onClick={() => handlePhonemeClick(selectedPhoneme)}
                className="ml-auto rounded-full bg-teal-500 hover:bg-teal-600 text-white p-2.5 shadow-sm active:scale-95 transition-all"
                aria-label="Replay sound"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        {/* Module 2: Blending & Segmenting Lab */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧩</span>
            <div>
              <h2 className="font-extrabold text-gray-900">Blending Laboratory</h2>
              <p className="text-xs text-gray-500">Tap letters to break them down, then blend them together!</p>
            </div>
          </div>

          {/* Word selectors */}
          <div className="flex flex-wrap gap-2">
            {BLENDING_WORDS.map((w) => (
              <button
                key={w.word}
                onClick={() => { setActiveBlend(w); setBlendProgress(-1); setBlendProgressComplete(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeBlend.word === w.word
                    ? "bg-emerald-600 text-white border-transparent"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {w.emoji} {w.word}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center flex flex-col items-center justify-center space-y-6">
            <span className="text-5xl block animate-bounce">{activeBlend.emoji}</span>

            {/* Split sounds */}
            <div className="flex justify-center gap-4">
              {activeBlend.parts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => playSound(p, 0.6)}
                  className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center border-3 transition-all ${
                    blendProgress === i
                      ? "bg-amber-100 border-amber-500 text-amber-800 scale-110"
                      : "bg-white border-gray-200 hover:border-gray-300 text-gray-900"
                  }`}
                >
                  <span className="text-2xl font-extrabold uppercase">{p}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{activeBlend.sounds[i]}</span>
                </button>
              ))}
            </div>

            {/* Blending controls */}
            <div className="w-full flex gap-3">
              <button
                onClick={startBlending}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 text-sm shadow-sm transition-all"
              >
                <Play className="h-4 w-4" /> Say sounds one by one
              </button>
              <button
                onClick={() => playSound(activeBlend.word, 0.8)}
                className="rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-5 py-3 text-sm shadow-sm transition-all"
              >
                Blend Word 🗣️
              </button>
            </div>

            {blendComplete && (
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> &quot;{activeBlend.word.toUpperCase()}&quot; blended successfully!
              </p>
            )}
          </div>
        </section>

        {/* Module 3: Multisensory Letter Tile Construction */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧱</span>
              <div>
                <h2 className="font-extrabold text-gray-900">Multisensory Tile Builder</h2>
                <p className="text-xs text-gray-500">Tap the letter tiles in the correct order to spell the word.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetTileBuilder}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restart
              </button>
              {/* Word toggle */}
              <button
                onClick={() => {
                  const nextWord = tileWord.target === "sun"
                    ? { target: "cat", tiles: ["c", "p", "a", "t", "r"], emoji: "🐱" }
                    : { target: "sun", tiles: ["n", "u", "s", "p", "a"], emoji: "☀️" };
                  setTileWord(nextWord);
                  setBuiltWord([]);
                  setTileSuccess(false);
                }}
                className="rounded-xl bg-teal-50 text-teal-700 px-3 py-1.5 text-xs font-bold hover:bg-teal-100"
              >
                Next Word <ArrowRight className="inline-block h-3.5 w-3.5 ml-1" />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 justify-around">
            <div className="text-center md:text-left space-y-2">
              <span className="text-6xl block">{tileWord.emoji}</span>
              <p className="text-sm font-bold text-gray-600">Spell the word: <span className="font-extrabold text-gray-900 uppercase text-lg">{tileWord.target}</span></p>
            </div>

            {/* Built letters slots */}
            <div className="flex gap-3">
              {Array.from({ length: tileWord.target.length }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-16 w-16 rounded-2xl border-4 flex items-center justify-center text-3xl font-extrabold uppercase shadow-inner ${
                    builtWord[idx]
                      ? "bg-white border-teal-500 text-teal-800 scale-105"
                      : "bg-gray-100 border-dashed border-gray-300 text-transparent"
                  }`}
                >
                  {builtWord[idx] || ""}
                </div>
              ))}
            </div>

            {/* Available letter tiles */}
            <div className="flex flex-wrap gap-2.5 max-w-xs justify-center">
              {tileWord.tiles.map((letter, idx) => {
                const usedCount = builtWord.filter(l => l === letter).length;
                const totalInWord = tileWord.tiles.filter(l => l === letter).length;
                const isUsed = usedCount >= totalInWord;
                return (
                  <button
                    key={idx}
                    disabled={isUsed || tileSuccess}
                    onClick={() => selectTile(letter)}
                    className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold uppercase shadow-sm border-2 active:scale-95 transition-all ${
                      isUsed
                        ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                        : "bg-white border-gray-300 hover:border-teal-400 hover:bg-teal-50 text-gray-800"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {tileSuccess && (
            <div className="rounded-3xl bg-green-50 border border-green-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎉</span>
                <div>
                  <h3 className="font-extrabold text-green-900 text-sm">Spelled Correctly!</h3>
                  <p className="text-xs text-green-700 mt-0.5">Let&apos;s practice pronouncing it out loud!</p>
                </div>
              </div>

              {/* Simulated Mic Practice */}
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-2xl border border-gray-100 px-3 py-1.5 text-xs text-gray-600 font-bold max-w-xs">
                  {micText}
                </div>
                <button
                  onClick={startMicSimulation}
                  disabled={micActive}
                  className={`rounded-full p-4 flex items-center justify-center text-white shadow transition-all active:scale-95 ${
                    micSuccess
                      ? "bg-green-600"
                      : micActive
                      ? "bg-red-500 animate-pulse"
                      : "bg-teal-500 hover:bg-teal-600"
                  }`}
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
