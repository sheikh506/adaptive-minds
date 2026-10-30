import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Printable offline activity sheets — P2 Offline Learning.
 *
 * Each activity is a structured HTML page the parent can print.
 * Activities are aligned to the skill curriculum and labelled clearly.
 * No personal data is included on the printable pages.
 */

const PRINTABLE_ACTIVITIES = [
  // ── Phonics ───────────────────────────────────────────────────────────────
  {
    id: "print-cvc-word-building",
    title: "CVC Word Building",
    skillArea: "Phonics",
    ageRange: "Ages 5–6",
    emoji: "🔤",
    colour: "from-sky-400 to-blue-500",
    description: "Cut out letter tiles and build CVC words together. Includes 30 tiles and 12 picture cards.",
    activities: [
      "Cut out the letter tiles.",
      "Look at a picture card (e.g. cat).",
      "Find the three letters that spell the word.",
      "Arrange them in order.",
      "Say each sound, then blend them together.",
    ],
    printPath: "/print/cvc-word-building",
  },
  {
    id: "print-phoneme-boxes",
    title: "Phoneme Counting Boxes",
    skillArea: "Phonics",
    ageRange: "Ages 5–7",
    emoji: "📦",
    colour: "from-amber-400 to-orange-500",
    description: "Say a word and move one counter into a box for each sound. Practises phoneme segmentation.",
    activities: [
      "Print the boxes page.",
      "Use small objects (buttons, coins, raisins) as counters.",
      "Say a word slowly.",
      "Move one counter into a box for each sound you hear.",
      "Count the boxes used — that is how many phonemes!",
    ],
    printPath: "/print/phoneme-boxes",
  },

  // ── Mathematics ───────────────────────────────────────────────────────────
  {
    id: "print-ten-frame",
    title: "Ten Frame Activity",
    skillArea: "Mathematics",
    ageRange: "Ages 4–6",
    emoji: "🔲",
    colour: "from-green-400 to-emerald-500",
    description: "A printable ten frame with counters. Use small objects to show numbers and addition to 10.",
    activities: [
      "Print the ten frame sheet.",
      "Use pennies, buttons or stickers as counters.",
      "Show a number by placing counters in the frame from left to right.",
      "Show addition: place 3 counters, then add 4 more. Count the total.",
      "Ask: how many more to make 10?",
    ],
    printPath: "/print/ten-frame",
  },
  {
    id: "print-number-bonds",
    title: "Number Bonds to 10",
    skillArea: "Mathematics",
    ageRange: "Ages 5–7",
    emoji: "🔗",
    colour: "from-purple-400 to-violet-500",
    description: "Blank number bond diagrams. Fill in the parts and wholes to practise number bonds.",
    activities: [
      "Print the number bond sheet.",
      "Write a number in the whole circle (e.g. 7).",
      "Think: what two numbers make 7?",
      "Write them in the part circles.",
      "Try all the bonds for numbers 5 through 10.",
    ],
    printPath: "/print/number-bonds",
  },
  {
    id: "print-place-value",
    title: "Place Value Mats",
    skillArea: "Mathematics",
    ageRange: "Ages 6–7",
    emoji: "📊",
    colour: "from-teal-400 to-cyan-500",
    description: "Tens and ones mats with bundle sticks you can draw. Builds understanding of two-digit numbers.",
    activities: [
      "Print the place value mat.",
      "Draw bundles of 10 sticks in the Tens column.",
      "Draw single sticks in the Ones column.",
      "Write the number underneath.",
      "Try the numbers: 13, 25, 34, 47, 50.",
    ],
    printPath: "/print/place-value-mats",
  },

  // ── Reading ───────────────────────────────────────────────────────────────
  {
    id: "print-story-retell",
    title: "Story Retelling Mat",
    skillArea: "Reading",
    ageRange: "Ages 5–7",
    emoji: "📖",
    colour: "from-pink-400 to-fuchsia-500",
    description: "A simple 3-part mat (beginning, middle, end) to help children retell stories in their own words.",
    activities: [
      "After reading a story together, give your child the mat.",
      "Draw or write what happened at the beginning.",
      "Draw or write what happened in the middle.",
      "Draw or write how the story ended.",
      "Use the mat to retell the story to a family member.",
    ],
    printPath: "/print/story-retell-mat",
  },
  {
    id: "print-word-sort",
    title: "Word Sort: Short Vowels",
    skillArea: "Reading",
    ageRange: "Ages 5–6",
    emoji: "🃏",
    colour: "from-rose-400 to-pink-500",
    description: "Word cards to sort by short vowel sound (a, e, i, o, u). Cut out and sort into groups.",
    activities: [
      "Print and cut out the word cards.",
      "Say each word aloud.",
      "Listen for the vowel in the middle.",
      "Sort the cards into five piles: /a/, /e/, /i/, /o/, /u/.",
      "Check: do all the cards in each pile sound the same in the middle?",
    ],
    printPath: "/print/word-sort-vowels",
  },

  // ── Science ───────────────────────────────────────────────────────────────
  {
    id: "print-observation-journal",
    title: "Science Observation Journal",
    skillArea: "Science",
    ageRange: "Ages 4–7",
    emoji: "🔬",
    colour: "from-lime-400 to-green-500",
    description: "A simple observation sheet: what I see, what I wonder, what I notice changed.",
    activities: [
      "Print a few copies of the observation page.",
      "Choose something to observe (a plant, a puddle, an insect).",
      "Draw or write what you see.",
      "Write one question you wonder about.",
      "Observe the same thing again tomorrow — what changed?",
    ],
    printPath: "/print/observation-journal",
  },
];

export default async function PrintablesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const groups = ["Phonics", "Mathematics", "Reading", "Science"] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🖨️ Printable Activities</h1>
          <p className="text-sm text-gray-500">Offline learning sheets aligned to the skill curriculum. Print and use at home.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
        <p className="font-bold">📋 For parents and carers</p>
        <p className="mt-1">These activities are designed to support learning at home without a screen. Each one is aligned to a skill your child is working on in AdaptiveMinds. Print the sheet, set aside 10–15 minutes, and work through it together.</p>
      </div>

      {groups.map((group) => {
        const items = PRINTABLE_ACTIVITIES.filter((a) => a.skillArea === group);
        return (
          <section key={group} aria-labelledby={`print-group-${group}`}>
            <h2 id={`print-group-${group}`} className="mb-4 text-lg font-extrabold text-gray-900">
              {group === "Phonics" ? "📚" : group === "Mathematics" ? "🔢" : group === "Reading" ? "📖" : "🔬"} {group}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((activity) => (
                <div key={activity.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl flex-shrink-0" aria-hidden="true">{activity.emoji}</span>
                    <div>
                      <h3 className="font-extrabold text-gray-900">{activity.title}</h3>
                      <p className="text-xs text-gray-500">{activity.ageRange}</p>
                      <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                    </div>
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-bold text-brand-700 hover:underline">How to use it</summary>
                    <ol className="mt-2 space-y-1 pl-4">
                      {activity.activities.map((step, i) => (
                        <li key={i} className="text-gray-700 list-decimal">{step}</li>
                      ))}
                    </ol>
                  </details>
                  <Link
                    href={activity.printPath}
                    target="_blank"
                    className={`flex items-center gap-2 justify-center rounded-2xl bg-gradient-to-r ${activity.colour} px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity`}
                  >
                    <Printer className="h-4 w-4" /> Open printable
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
