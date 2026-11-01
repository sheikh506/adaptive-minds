"use client";

import { useState } from "react";
import { Volume2, Play, CheckCircle2, RotateCcw, ArrowRight, Sparkles, BookOpen, Star } from "lucide-react";

interface VocabItem {
  word: string;
  emoji: string;
  category: "School" | "Home" | "Food" | "Play";
}

const VOCAB_ITEMS: VocabItem[] = [
  { word: "school", emoji: "🏫", category: "School" },
  { word: "pencil", emoji: "✏️", category: "School" },
  { word: "book", emoji: "📖", category: "School" },
  { word: "chair", emoji: "🪑", category: "School" },
  { word: "bed", emoji: "🛏️", category: "Home" },
  { word: "water", emoji: "💧", category: "Home" },
  { word: "apple", emoji: "🍎", category: "Food" },
  { word: "milk", emoji: "🥛", category: "Food" },
  { word: "ball", emoji: "⚽", category: "Play" },
  { word: "swing", emoji: "🛝", category: "Play" },
];

const DIRECTIONS = [
  { phrase: "Raise your hand", emoji: "🙋", detail: "Raise your hand to ask a question!" },
  { phrase: "Listen closely", emoji: "👂", detail: "Put your listening ears on!" },
  { phrase: "Open your book", emoji: "📖", detail: "Open your book to start reading!" },
  { phrase: "Sit down nicely", emoji: "🪑", detail: "Sit down cozy on your chair." },
];

export default function EALPathway() {
  const [activeTab, setActiveTab] = useState<"vocab" | "directions" | "game" | "sentence">("vocab");
  const [accent, setAccent] = useState<"UK" | "US">("UK");

  // Game states
  const [gameIdx, setGameIdx] = useState(0);
  const [gameSelected, setGameSelected] = useState<string | null>(null);
  const [gameFeedback, setGameFeedback] = useState("");
  const [gameSuccess, setGameSuccess] = useState(false);

  // Sentence Builder states
  const [sentenceBuilt, setSentenceBuilt] = useState<string[]>([]);
  const [sentenceTarget] = useState(["I", "see", "a", "pencil"]);
  const [sentenceBlocks, setSentenceBlocks] = useState(["pencil", "I", "a", "see"]);
  const [sentenceSuccess, setSentenceSuccess] = useState(false);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.8;
    utter.lang = accent === "US" ? "en-US" : "en-GB";
    window.speechSynthesis.speak(utter);
  };

  const checkGameAnswer = (word: string, target: string) => {
    setGameSelected(word);
    if (word === target) {
      setGameSuccess(true);
      setGameFeedback("Correct! Amazing job! 🎉");
      speakText(`Yes! That is a ${target}`);
    } else {
      setGameSuccess(false);
      setGameFeedback("Let's try again! ⭐️");
      speakText(`Try again!`);
    }
  };

  const selectWordBlock = (word: string) => {
    if (sentenceBuilt.includes(word)) {
      setSentenceBuilt(sentenceBuilt.filter((w) => w !== word));
    } else {
      const updated = [...sentenceBuilt, word];
      setSentenceBuilt(updated);
      speakText(word);

      if (updated.join(" ") === sentenceTarget.join(" ")) {
        setSentenceSuccess(true);
        speakText("I see a pencil! Wonderful sentence construction!");
      }
    }
  };

  const resetSentenceBuilder = () => {
    setSentenceBuilt([]);
    setSentenceSuccess(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-600 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-100">English as an Additional Language (EAL)</p>
            <h1 className="text-3xl font-extrabold mt-1">EAL English Lab 🏫</h1>
            <p className="text-sm text-sky-50 mt-1">
              Friendly visual pathways, oral vocabulary practice, and classroom guides for young language learners.
            </p>
          </div>
          {/* Accent toggle */}
          <div className="flex bg-black/15 rounded-2xl p-1 self-start sm:self-center border border-white/10 text-xs font-bold">
            <button
              onClick={() => setAccent("UK")}
              className={`px-3 py-1.5 rounded-xl transition-all ${accent === "UK" ? "bg-white text-indigo-950 shadow" : "text-white"}`}
            >
              UK Sound 🇬🇧
            </button>
            <button
              onClick={() => setAccent("US")}
              className={`px-3 py-1.5 rounded-xl transition-all ${accent === "US" ? "bg-white text-indigo-950 shadow" : "text-white"}`}
            >
              US Sound 🇺🇸
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 max-w-md">
        {[
          { id: "vocab", label: "Vocabulary" },
          { id: "directions", label: "Classroom" },
          { id: "game", label: "Listen & Match" },
          { id: "sentence", label: "Sentence Builder" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === t.id ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Everyday spoken vocabulary */}
      {activeTab === "vocab" && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍎</span>
            <div>
              <h2 className="font-extrabold text-gray-900">Everyday Spoken Vocabulary</h2>
              <p className="text-xs text-gray-500">Tap a picture to hear the English word and practice saying it out loud.</p>
            </div>
          </div>

          <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
            {VOCAB_ITEMS.map((item) => (
              <button
                key={item.word}
                onClick={() => speakText(item.word)}
                className="p-4 bg-gray-50 border border-gray-100 hover:border-sky-400 hover:bg-sky-50/10 rounded-2xl text-center transition-all group relative"
              >
                <span className="text-5xl block group-hover:scale-110 transition-transform">{item.emoji}</span>
                <span className="block font-bold text-sm text-gray-950 mt-2 capitalize">{item.word}</span>
                <span className="absolute top-2 right-2 bg-gray-200/50 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  {item.category}
                </span>
              </button>
            ))}
          </div>

          {/* Parent explanation */}
          <div className="rounded-2xl bg-sky-50/50 border border-sky-100 p-4 text-xs text-sky-900 leading-relaxed mt-6">
            <p className="font-bold text-sky-950">💡 Parent and Teacher Guide:</p>
            <p className="mt-1">
              For children learning English as an additional language, mapping visual emoji cues to high-quality spoken audio is the fastest way to build confidence. Encourage your child to repeat each word aloud after the native voice.
            </p>
          </div>
        </section>
      )}

      {/* Tab 2: Classroom Directions Guide */}
      {activeTab === "directions" && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🙋</span>
            <div>
              <h2 className="font-extrabold text-gray-900">Classroom Directions Guide</h2>
              <p className="text-xs text-gray-500">Understand standard classroom instructions and practice listening to them.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {DIRECTIONS.map((dir) => (
              <button
                key={dir.phrase}
                onClick={() => speakText(dir.phrase)}
                className="p-5 bg-gray-50 hover:bg-sky-50/10 border border-gray-100 hover:border-sky-400 rounded-3xl flex gap-4 text-left transition-all"
              >
                <span className="text-5xl block self-center">{dir.emoji}</span>
                <div>
                  <h4 className="font-bold text-gray-950 text-sm">{dir.phrase}</h4>
                  <p className="text-xs text-gray-500 mt-1">{dir.detail}</p>
                  <span className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 bg-sky-100/50 rounded-md px-2 py-0.5">
                    <Volume2 className="h-3 w-3" /> Listen
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Tab 3: Listen & Match Game */}
      {activeTab === "game" && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <div>
                <h2 className="font-extrabold text-gray-900">Listen & Match</h2>
                <p className="text-xs text-gray-500">Click the play button to hear a word, then select the matching written name.</p>
              </div>
            </div>
            {/* Reset */}
            <button
              onClick={() => { setGameIdx((gameIdx + 1) % VOCAB_ITEMS.length); setGameSelected(null); setGameFeedback(""); setGameSuccess(false); }}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold hover:bg-gray-50"
            >
              Next Word ➔
            </button>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
            <span className="text-7xl block animate-bounce">{VOCAB_ITEMS[gameIdx].emoji}</span>

            <button
              onClick={() => speakText(VOCAB_ITEMS[gameIdx].word)}
              className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 text-xs shadow flex items-center gap-2"
            >
              <Volume2 className="h-4 w-4" /> Listen to Spoken Word
            </button>

            <div className="grid grid-cols-2 gap-3.5 w-full pt-4 border-t border-gray-200">
              {VOCAB_ITEMS.slice(0, 4).map((item) => (
                <button
                  key={item.word}
                  onClick={() => checkGameAnswer(item.word, VOCAB_ITEMS[gameIdx].word)}
                  className={`p-3.5 rounded-2xl border-2 text-xs font-bold capitalize transition-all ${
                    gameSelected === item.word
                      ? gameSuccess && item.word === VOCAB_ITEMS[gameIdx].word
                        ? "bg-green-500 border-transparent text-white shadow"
                        : "bg-red-500 border-transparent text-white shadow"
                      : "bg-white border-gray-100 hover:border-indigo-400 text-gray-700"
                  }`}
                >
                  {item.word}
                </button>
              ))}
            </div>

            {gameFeedback && (
              <p className={`text-xs font-bold mt-2 ${gameSuccess ? "text-green-700 animate-pulse" : "text-red-700"}`}>
                {gameFeedback}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Tab 4: Sentence Builder */}
      {activeTab === "sentence" && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧱</span>
              <div>
                <h2 className="font-extrabold text-gray-900">Sentence Builder</h2>
                <p className="text-xs text-gray-500">Tap the word blocks in the correct order to say: &quot;I see a pencil&quot;.</p>
              </div>
            </div>
            <button
              onClick={resetSentenceBuilder}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold hover:bg-gray-50"
            >
              Restart
            </button>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 space-y-6 flex flex-col items-center justify-center">
            {/* Visual clue */}
            <span className="text-5xl block animate-bounce">✏️</span>

            {/* Built Slots */}
            <div className="flex gap-2 min-h-12 flex-wrap justify-center border-b pb-4 w-full">
              {sentenceTarget.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-11 px-4 rounded-xl border flex items-center justify-center text-xs font-bold shadow-sm ${
                    sentenceBuilt[idx]
                      ? "bg-white border-sky-400 text-indigo-950 scale-105"
                      : "bg-gray-100 border-dashed border-gray-300 text-transparent w-20"
                  }`}
                >
                  {sentenceBuilt[idx] || ""}
                </div>
              ))}
            </div>

            {/* Blocks bank */}
            <div className="flex flex-wrap gap-2 justify-center">
              {sentenceBlocks.map((block) => {
                const used = sentenceBuilt.includes(block);
                return (
                  <button
                    key={block}
                    disabled={used || sentenceSuccess}
                    onClick={() => selectWordBlock(block)}
                    className={`h-11 px-4 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm border ${
                      used
                        ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                        : "bg-white border-gray-300 hover:border-sky-500 hover:bg-sky-50/10 text-gray-800"
                    }`}
                  >
                    {block}
                  </button>
                );
              })}
            </div>

            {sentenceSuccess && (
              <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-center text-xs text-green-950 font-bold max-w-sm flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Excellent! You successfully built: &ldquo;I see a pencil.&rdquo;</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
