"use client";

import { useState } from "react";
import { ArrowLeft, Play, Save, CheckCircle2, Sparkles, BookOpen, Volume2, Smile } from "lucide-react";

interface Character {
  id: string;
  name: string;
  desc: string;
  emojis: Record<string, string>; // mapping emotion to emoji
}

const CHARACTERS: Character[] = [
  {
    id: "pip",
    name: "Pip the Panda",
    desc: "A soft, cuddly panda who loves green bamboo and asking big questions.",
    emojis: { happy: "🐼", excited: "🐼✨", curious: "🧐", surprised: "😮", sleepy: "😴" },
  },
  {
    id: "luna",
    name: "Luna the Unicorn",
    desc: "A smart unicorn with a sparkling silver horn who loves starry skies.",
    emojis: { happy: "🦄", excited: "🦄✨", curious: "🤔", surprised: "😲", sleepy: "🥱" },
  },
  {
    id: "leo",
    name: "Leo the Lion",
    desc: "A small, brave lion cub who is learning how to roar softly.",
    emojis: { happy: "🦁", excited: "🦁✨", curious: "🕵️‍♂️", surprised: "🙀", sleepy: "💤" },
  },
  {
    id: "felix",
    name: "Felix the Fox",
    desc: "A friendly red fox with a bushy tail who loves puzzle-hunting.",
    emojis: { happy: "🦊", excited: "🦊✨", curious: "🕵️", surprised: "👀", sleepy: "😴" },
  },
];

interface Setting {
  id: string;
  name: string;
  emoji: string;
  color: string; // background Tailwind color
}

const SETTINGS: Setting[] = [
  { id: "forest", name: "Magic Forest", emoji: "🌲", color: "bg-emerald-50 border-emerald-200 text-emerald-950" },
  { id: "space", name: "Space Rocket", emoji: "🚀", color: "bg-indigo-50 border-indigo-200 text-indigo-950" },
  { id: "bedroom", name: "Cozy Bedroom", emoji: "🛏️", color: "bg-amber-50 border-amber-200 text-amber-950" },
  { id: "ocean", name: "Deep Ocean", emoji: "🌊", color: "bg-sky-50 border-sky-200 text-sky-950" },
];

const SENTENCE_STARTERS = {
  beginning: [
    "Once upon a time, in the most beautiful place...",
    "Deep inside the magic kingdom, a small explorer...",
    "One bright, sunny morning, someone woke up feeling...",
    "High above the clouds, a friendly adventure..."
  ],
  middle: [
    "Suddenly, they saw a mysterious, sparkling treasure...",
    "While walking along the secret path, they found...",
    "They decided to work together with friends and solve...",
    "With a giant leap of courage, they decided to..."
  ],
  ending: [
    "And from that day on, they learned that being kind...",
    "At last, they snuggled up cozy and warm, thinking about...",
    "With a happy laugh, they knew that anything is possible...",
    "They went to sleep feeling proud of their amazing adventure..."
  ]
};

export default function StoryCreator() {
  const [step, setStep] = useState<"char" | "setting" | "compose" | "finished">("char");
  const [character, setCharacter] = useState<Character>(CHARACTERS[0]);
  const [setting, setSetting] = useState<Setting>(SETTINGS[0]);

  // Composition pages
  const [begText, setBegText] = useState("");
  const [begEmotion, setBegEmotion] = useState("happy");
  const [midText, setMidText] = useState("");
  const [midEmotion, setMidEmotion] = useState("curious");
  const [endText, setEndText] = useState("");
  const [endEmotion, setEndEmotion] = useState("sleepy");

  const [savedBooks, setSavedBooks] = useState<any[]>([]);
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.8;
    utter.lang = "en-GB";
    utter.onend = () => setIsNarrationPlaying(false);
    setIsNarrationPlaying(true);
    window.speechSynthesis.speak(utter);
  };

  const handleSaveBook = () => {
    const newBook = {
      id: Date.now().toString(),
      character: character.name,
      setting: setting.name,
      pages: {
        beginning: { text: begText, emotion: begEmotion, emoji: character.emojis[begEmotion] },
        middle: { text: midText, emotion: midEmotion, emoji: character.emojis[midEmotion] },
        ending: { text: endText, emotion: endEmotion, emoji: character.emojis[endEmotion] },
      },
    };
    setSavedBooks([...savedBooks, newBook]);
    setStep("finished");
    speakText(`Congratulations! You wrote your own storybook called Pip and Luna's Great Adventure!`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-purple-100">Sequencing & Literacy Workshop</p>
            <h1 className="text-3xl font-extrabold mt-1">Story Book Creator 📚</h1>
            <p className="text-sm text-purple-50 mt-1">
              Select characters, pick safe settings, sequence your story, and read it aloud!
            </p>
          </div>
          <span className="text-5xl animate-float block self-start sm:self-center">📝</span>
        </div>
      </div>

      {/* Main interface */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {/* Step Header */}
        <div className="flex items-center justify-between border-b pb-4 text-xs font-bold text-gray-400">
          <span>CREATIVE STORYBOOK STUDIO</span>
          <div className="flex gap-2">
            <span className={step === "char" ? "text-purple-600 font-extrabold" : ""}>1. Character</span>
            <span>→</span>
            <span className={step === "setting" ? "text-purple-600 font-extrabold" : ""}>2. Setting</span>
            <span>→</span>
            <span className={step === "compose" ? "text-purple-600 font-extrabold" : ""}>3. Write Book</span>
          </div>
        </div>

        {/* Step 1: Character selection */}
        {step === "char" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Step 1: Choose Your Story Buddy</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {CHARACTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCharacter(c)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-102 flex gap-4 items-start ${
                    character.id === c.id
                      ? "bg-purple-50/50 border-purple-500 shadow-sm"
                      : "bg-gray-50 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span className="text-5xl block">{c.emojis.happy}</span>
                  <div>
                    <h4 className="font-bold text-gray-950 text-sm">{c.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("setting")}
              className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 shadow-sm text-sm"
            >
              Pick a Safe Setting! →
            </button>
          </div>
        )}

        {/* Step 2: Setting selection */}
        {step === "setting" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <button onClick={() => setStep("char")} className="text-xs text-purple-600 hover:underline">
                Back
              </button>
              <span>· Step 2: Choose Story Setting</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {SETTINGS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSetting(s)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-102 flex gap-4 items-start ${
                    setting.id === s.id
                      ? "bg-purple-50/50 border-purple-500 shadow-sm"
                      : "bg-gray-50 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span className="text-5xl block">{s.emoji}</span>
                  <div>
                    <h4 className="font-bold text-gray-950 text-sm">{s.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Set the theme and background for your pages.</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("compose")}
              className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 shadow-sm text-sm"
            >
              Compose Your Storybook! →
            </button>
          </div>
        )}

        {/* Step 3: Storybook Composition */}
        {step === "compose" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 border-b pb-2">
              <button onClick={() => setStep("setting")} className="text-xs text-purple-600 hover:underline">
                Back
              </button>
              <span>· Step 3: Sequence and Write Your Story</span>
            </h3>

            {/* Page 1: Beginning */}
            <div className={`rounded-3xl border-2 p-5 ${setting.color} space-y-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold bg-white/60 px-2.5 py-1 rounded-md text-gray-900 uppercase">Page 1: The Beginning 🌅</span>
                {/* Character visual */}
                <span className="text-4xl animate-float">{character.emojis[begEmotion]}</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Pick a starter or write custom sentence</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SENTENCE_STARTERS.beginning.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => setBegText(starter)}
                      className="text-[10px] bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 hover:bg-gray-50"
                    >
                      + use starter
                    </button>
                  ))}
                </div>
                <textarea
                  value={begText}
                  onChange={(e) => setBegText(e.target.value)}
                  placeholder="Once upon a time, my buddy..."
                  className="w-full text-xs p-3 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={2}
                />
              </div>

              {/* Emotion Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Panda&apos;s Emotion on this page</label>
                <div className="flex gap-2.5">
                  {["happy", "excited", "curious", "surprised", "sleepy"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setBegEmotion(em)}
                      className={`text-xs px-2.5 py-1 rounded-xl border capitalize ${
                        begEmotion === em ? "bg-purple-600 text-white border-transparent" : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page 2: Middle */}
            <div className={`rounded-3xl border-2 p-5 ${setting.color} space-y-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold bg-white/60 px-2.5 py-1 rounded-md text-gray-900 uppercase">Page 2: The Action 🗺️</span>
                <span className="text-4xl animate-float">{character.emojis[midEmotion]}</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Pick a starter or write custom sentence</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SENTENCE_STARTERS.middle.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => setMidText(starter)}
                      className="text-[10px] bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 hover:bg-gray-50"
                    >
                      + use starter
                    </button>
                  ))}
                </div>
                <textarea
                  value={midText}
                  onChange={(e) => setMidText(e.target.value)}
                  placeholder="Then, suddenly..."
                  className="w-full text-xs p-3 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={2}
                />
              </div>

              {/* Emotion Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Panda&apos;s Emotion on this page</label>
                <div className="flex gap-2.5">
                  {["happy", "excited", "curious", "surprised", "sleepy"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setMidEmotion(em)}
                      className={`text-xs px-2.5 py-1 rounded-xl border capitalize ${
                        midEmotion === em ? "bg-purple-600 text-white border-transparent" : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page 3: Ending */}
            <div className={`rounded-3xl border-2 p-5 ${setting.color} space-y-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold bg-white/60 px-2.5 py-1 rounded-md text-gray-900 uppercase">Page 3: The Ending 🌙</span>
                <span className="text-4xl animate-float">{character.emojis[endEmotion]}</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Pick a starter or write custom sentence</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SENTENCE_STARTERS.ending.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => setEndText(starter)}
                      className="text-[10px] bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 hover:bg-gray-50"
                    >
                      + use starter
                    </button>
                  ))}
                </div>
                <textarea
                  value={endText}
                  onChange={(e) => setEndText(e.target.value)}
                  placeholder="Finally, they..."
                  className="w-full text-xs p-3 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={2}
                />
              </div>

              {/* Emotion Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Panda&apos;s Emotion on this page</label>
                <div className="flex gap-2.5">
                  {["happy", "excited", "curious", "surprised", "sleepy"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEndEmotion(em)}
                      className={`text-xs px-2.5 py-1 rounded-xl border capitalize ${
                        endEmotion === em ? "bg-purple-600 text-white border-transparent" : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => speakText(`${begText}. ${midText}. ${endText}`)}
                disabled={isNarrationPlaying}
                className="rounded-2xl border border-gray-200 font-bold px-4 py-3 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-1.5"
              >
                <Volume2 className="h-4 w-4" /> Listen to Story Narration
              </button>
              <button
                onClick={handleSaveBook}
                className="flex-1 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 shadow-md text-sm transition-all"
              >
                Save Storybook Locally! 💾
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Finished view */}
        {step === "finished" && (
          <div className="text-center py-8 space-y-6 max-w-md mx-auto">
            <span className="text-7xl block animate-bounce">📔</span>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">Your Story is Saved!</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Beautiful sequencing! You wrote, illustrated, and narrated a brand-new adventure in the <strong>{setting.name}</strong> with <strong>{character.name}</strong>!
              </p>
            </div>

            {/* Read back cards */}
            <div className="border border-purple-100 rounded-3xl p-5 bg-purple-50/20 text-left space-y-3">
              <p className="text-xs text-gray-800 italic leading-relaxed font-semibold">&ldquo;{begText}&rdquo;</p>
              <p className="text-xs text-gray-800 italic leading-relaxed font-semibold">&ldquo;{midText}&rdquo;</p>
              <p className="text-xs text-gray-800 italic leading-relaxed font-semibold">&ldquo;{endText}&rdquo;</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("compose")}
                className="flex-1 rounded-2xl border border-gray-200 font-bold py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit Story
              </button>
              <button
                onClick={() => {
                  setStep("char");
                  setBegText("");
                  setMidText("");
                  setEndText("");
                }}
                className="flex-1 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 shadow-md text-sm transition-all"
              >
                Write New Story
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
