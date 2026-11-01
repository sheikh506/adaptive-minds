"use client";

import { useState } from "react";
import { CheckCircle2, ArrowLeft, ArrowRight, ShieldAlert, ClipboardList, HelpCircle, Trophy } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  emoji: string;
  topic: string;
  stage: "Age 4-5" | "Age 6-7";
  objective: string;
  materials: string[];
  safety: string;
  predictionQuestion: string;
  predictionOptions: string[];
  guidedSteps: string[];
  observationQuestion: string;
  observationOptions: string[];
  reflectionQuestion: string;
  reflectionExplanation: string;
  rewardXP: number;
}

const MISSIONS: Mission[] = [
  {
    id: "m-shadow-seekers",
    title: "Shadow Seekers",
    emoji: "👤",
    topic: "Light and Shadows",
    stage: "Age 4-5",
    objective: "Observe how shadows are made by blocking light with different objects.",
    materials: ["Flashlight or sunny window", "Plastic cup (clear)", "Cardboard or book (solid)", "Your hands!"],
    safety: "Do not shine the flashlight directly into anyone's eyes.",
    predictionQuestion: "Which object do you think will block the light and make a dark shadow?",
    predictionOptions: [
      "The cardboard (solid)",
      "The clear plastic cup",
      "Both will make the exact same shadow",
      "Neither will make a shadow",
    ],
    guidedSteps: [
      "Find a blank wall in a dim room, or use a sunny floor spot.",
      "Turn on your flashlight and shine it at the wall.",
      "Hold your hand in front of the flashlight — can you make a shadow-bunny?",
      "Now hold the clear cup. Does the light pass through it, or does it make a dark shadow?",
      "Next, hold the cardboard. What kind of shadow does it make?"
    ],
    observationQuestion: "What did you see on the wall when light hit the solid cardboard?",
    observationOptions: [
      "A dark, sharp shadow matching its shape!",
      "The light went right through it with no shadow.",
      "It glowed like a lightbulb.",
      "It turned into a rainbow."
    ],
    reflectionQuestion: "Why did the cardboard make a dark shadow but the clear cup did not?",
    reflectionExplanation: "A shadow is made when light is blocked. The solid cardboard blocks all the light (it is opaque), while the clear cup lets the light slide through (it is transparent).",
    rewardXP: 30,
  },
  {
    id: "m-shape-hunters",
    title: "Everyday Shape Hunt",
    emoji: "🔍",
    topic: "Geometry",
    stage: "Age 4-5",
    objective: "Identify circle, square, triangle, and rectangle shapes in everyday rooms.",
    materials: ["Crayon", "Paper", "A room to explore"],
    safety: "Explore carefully! Do not climb high shelves or touch delicate glassware.",
    predictionQuestion: "Which shape do you think you will find the most of in your kitchen or living room?",
    predictionOptions: [
      "Rectangles (doors, screens)",
      "Circles (clocks, plates)",
      "Triangles (corners, hangers)",
      "Squares (pillows, frames)"
    ],
    guidedSteps: [
      "Stand in the middle of the room with your grown-up helper.",
      "Look at the clock or a plate — what shape is that? (Hint: it is a circle!)",
      "Look at the door or the television — what shape has 4 sides and is long? (Rectangle!)",
      "Find 5 different items and classify their shapes. Draw them on your sheet of paper."
    ],
    observationQuestion: "What circles did you discover during your search?",
    observationOptions: [
      "Clocks, plate surfaces, or bottle caps!",
      "Doors, windows, and tables.",
      "Hangers, roof corners, and sandwich slices.",
      "Books, boxes, and screens."
    ],
    reflectionQuestion: "What makes a rectangle different from a square?",
    reflectionExplanation: "Both have 4 sides and 4 corners, but a square has 4 sides that are all the same length. A rectangle has 2 long sides and 2 short sides!",
    rewardXP: 25,
  },
  {
    id: "m-plant-breathers",
    title: "Plant Part Inspector",
    emoji: "🌿",
    topic: "Nature and Plants",
    stage: "Age 6-7",
    objective: "Observe live plants and discover the role of leaves, stems, and roots.",
    materials: ["A live houseplant or garden plant", "Paper", "Crayons"],
    safety: "Do not pick or eat wild leaves or berries without a grown-up's confirmation.",
    predictionQuestion: "What is the job of the roots hidden underground?",
    predictionOptions: [
      "To suck up water and hold the plant steady",
      "To make the plant look beautiful",
      "To catch sunlight",
      "To make seeds fall down"
    ],
    guidedSteps: [
      "Find a leafy plant in your house or garden.",
      "Look closely at the leaves — they are the solar panels of the plant catching light!",
      "Touch the thick stem. It holds the plant tall and carries water like a straw.",
      "Carefully look near the dirt. Imagine the tiny root fingers anchoring the plant down."
    ],
    observationQuestion: "What color were most leaves, and why do they need light?",
    observationOptions: [
      "Green, because they capture sunlight to make food!",
      "Blue, because they drink rain.",
      "Clear, because light passes through.",
      "Yellow, because they are warm."
    ],
    reflectionQuestion: "How do leaves help the rest of the plant grow?",
    reflectionExplanation: "Leaves have green chlorophyll that acts like a tiny kitchen. They use sunlight, air, and water to make sugar (food) that feeds the stem, roots, and flowers!",
    rewardXP: 35,
  }
];

export default function DiscoveryMissions() {
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [missionStep, setMissionStep] = useState<"intro" | "prediction" | "guided" | "observation" | "reflection" | "complete">("intro");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [observation, setObservation] = useState<string | null>(null);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());

  const startMission = (m: Mission) => {
    setActiveMission(m);
    setMissionStep("intro");
    setPrediction(null);
    setObservation(null);
  };

  const handlePredict = (opt: string) => {
    setPrediction(opt);
    setMissionStep("guided");
  };

  const handleObserve = (opt: string) => {
    setObservation(opt);
    setMissionStep("reflection");
  };

  const finishMission = () => {
    if (activeMission) {
      setCompletedMissions(new Set([...completedMissions, activeMission.id]));
    }
    setMissionStep("complete");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-100">Hands-On Science & Math</p>
            <h1 className="text-3xl font-extrabold mt-1">Real-World Discovery Missions 🧭</h1>
            <p className="text-sm text-orange-50 mt-1">
              Connect screen learning with safe, fun, and easy explorations right at home!
            </p>
          </div>
          <span className="text-5xl animate-float block self-start sm:self-center">🌍</span>
        </div>
      </div>

      {!activeMission ? (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Available Missions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MISSIONS.map((m) => {
              const isDone = completedMissions.has(m.id);
              return (
                <div
                  key={m.id}
                  className={`rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-orange-400 ${
                    isDone ? "bg-green-50/10 border-green-200" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold px-2.5 py-0.5">
                      {m.topic}
                    </span>
                    <span className="rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5">
                      {m.stage}
                    </span>
                  </div>
                  <span className="text-4xl block mt-4">{m.emoji}</span>
                  <h3 className="text-base font-bold text-gray-950 mt-2">{m.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{m.objective}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-orange-600">+{m.rewardXP} XP</span>
                    <button
                      onClick={() => startMission(m)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all ${
                        isDone
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-orange-600 hover:bg-orange-700 text-white"
                      }`}
                    >
                      {isDone ? "Play Again ✓" : "Start Mission"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          {/* Back to library */}
          <button
            onClick={() => setActiveMission(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Missions
          </button>

          {/* Mission Progress Indicator */}
          <div className="flex justify-between items-center text-xs text-gray-400 border-b pb-4">
            <span className="font-extrabold text-gray-900 text-sm">Mission: {activeMission.title}</span>
            <div className="flex gap-1">
              {["intro", "prediction", "guided", "observation", "reflection", "complete"].map((st) => (
                <span
                  key={st}
                  className={`h-2 w-8 rounded-full ${
                    missionStep === st
                      ? "bg-orange-500"
                      : ["intro", "prediction", "guided", "observation", "reflection", "complete"].indexOf(missionStep) >
                        ["intro", "prediction", "guided", "observation", "reflection", "complete"].indexOf(st)
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Intro */}
          {missionStep === "intro" && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <span className="text-7xl block animate-bounce mb-3">{activeMission.emoji}</span>
                <h3 className="text-xl font-extrabold text-gray-900">Your Objective</h3>
                <p className="text-sm text-gray-600 max-w-lg mx-auto mt-2 leading-relaxed">
                  {activeMission.objective}
                </p>
              </div>

              {/* Safety banner */}
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex gap-3 text-red-950">
                <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-red-800">⚠️ Grown-Up Safety Check</h4>
                  <p className="text-xs mt-1 leading-relaxed">{activeMission.safety}</p>
                </div>
              </div>

              {/* Materials */}
              <div className="rounded-2xl bg-orange-50/50 border border-orange-100 p-4">
                <h4 className="font-bold text-xs uppercase tracking-wide text-orange-800 flex items-center gap-1.5 mb-2">
                  <ClipboardList className="h-4 w-4" /> Gather Household Materials
                </h4>
                <ul className="list-disc pl-5 text-xs text-orange-950 space-y-1">
                  {activeMission.materials.map((mat, i) => (
                    <li key={i}>{mat}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setMissionStep("prediction")}
                className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 shadow-md transition-colors text-sm"
              >
                Let&apos;s Make a Prediction! 🔮
              </button>
            </div>
          )}

          {/* Step 2: Prediction */}
          {missionStep === "prediction" && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <span className="text-5xl block mb-2">🔮</span>
                <h3 className="text-lg font-extrabold text-gray-950">Make your prediction!</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  What do you think will happen? Scientists always make predictions before they start experimenting!
                </p>
              </div>

              <h4 className="font-extrabold text-gray-900 text-sm mb-3 text-center">{activeMission.predictionQuestion}</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeMission.predictionOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handlePredict(opt)}
                    className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-orange-500 hover:bg-orange-50/10 transition-all text-xs font-bold text-gray-700 text-left"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Guided Activity */}
          {missionStep === "guided" && (
            <div className="space-y-6">
              <div className="text-center py-2">
                <span className="text-4xl block mb-2">🛠️</span>
                <h3 className="text-lg font-extrabold text-gray-950">Let&apos;s Investigate!</h3>
                <p className="text-xs text-gray-500">Put the screen down for a few minutes and try these steps together:</p>
              </div>

              <div className="space-y-3.5 max-w-xl mx-auto">
                {activeMission.guidedSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 items-start">
                    <span className="flex-shrink-0 flex items-center justify-center bg-orange-500 text-white font-extrabold rounded-full h-7 w-7 text-xs">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-gray-800 leading-relaxed font-semibold mt-0.5">{step}</p>
                  </div>
                ))}
              </div>

              {prediction && (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-900 text-center">
                  Your prediction was: <strong className="text-amber-950">&ldquo;{prediction}&rdquo;</strong>
                </div>
              )}

              <button
                onClick={() => setMissionStep("observation")}
                className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 shadow-md transition-colors text-sm"
              >
                I Finished the Activity! Record Observations 📝
              </button>
            </div>
          )}

          {/* Step 4: Observation */}
          {missionStep === "observation" && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <span className="text-5xl block mb-2">📝</span>
                <h3 className="text-lg font-extrabold text-gray-950">What did you observe?</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  What did you actually see, hear, or feel? Recording observations is the core of science.
                </p>
              </div>

              <h4 className="font-extrabold text-gray-900 text-sm mb-3 text-center">{activeMission.observationQuestion}</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeMission.observationOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleObserve(opt)}
                    className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-orange-500 hover:bg-orange-50/10 transition-all text-xs font-bold text-gray-700 text-left"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Reflection & Explanation */}
          {missionStep === "reflection" && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center py-2">
                <span className="text-5xl block mb-2">💡</span>
                <h3 className="text-lg font-extrabold text-gray-950">Scientific Reflection</h3>
                <p className="text-xs text-gray-500">Let&apos;s think about why this happened!</p>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <h4 className="font-extrabold text-orange-900 text-xs uppercase tracking-wide">The Mystery</h4>
                  <p className="text-sm font-bold text-gray-950 mt-1">{activeMission.reflectionQuestion}</p>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 leading-relaxed">
                  <h4 className="font-extrabold text-green-800 text-xs uppercase tracking-wide flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" /> Scientific Explanation
                  </h4>
                  <p className="text-xs text-green-950 font-medium mt-1 leading-relaxed">
                    {activeMission.reflectionExplanation}
                  </p>
                </div>
              </div>

              <button
                onClick={finishMission}
                className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 shadow-md transition-colors text-sm"
              >
                Complete Mission & Earn Rewards! 🏆
              </button>
            </div>
          )}

          {/* Step 6: Complete */}
          {missionStep === "complete" && (
            <div className="text-center py-8 space-y-6 max-w-md mx-auto">
              <div className="flex justify-center">
                <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center text-5xl animate-bounce shadow">
                  🏆
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-950">Mission Accomplished!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  You successfully completed the <strong>{activeMission.title}</strong> mission! You earned a Star and valuable XP.
                </p>
              </div>

              <div className="flex justify-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl font-extrabold text-sm text-gray-800">
                <span className="text-yellow-600 flex items-center gap-1">⭐ +1 Star</span>
                <span className="text-brand-600 flex items-center gap-1">⚡ +{activeMission.rewardXP} XP</span>
              </div>

              <button
                onClick={() => setActiveMission(null)}
                className="w-full rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-3 shadow-md transition-colors text-sm"
              >
                Back to Mission Hub
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
