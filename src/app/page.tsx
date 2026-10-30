import Link from "next/link";
import { BookOpen, Star, TrendingUp, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-kid">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 text-white text-xl font-bold">
              A
            </div>
            <span className="text-xl font-bold text-gray-900">AdaptiveMinds</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-200 px-4 py-1.5 text-sm font-bold text-yellow-900">
          <Star className="h-4 w-4" />
          K-12 Adaptive Learning Platform
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Math, reading and science, <span className="bg-gradient-to-r from-brand-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">turned into play</span>
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-xl text-gray-600 leading-relaxed">
          Quests that adapt to your child&apos;s level, plus stories read aloud, art and craft projects,
          a music maker and calm games. Learning that feels like play.
        </p>
        <div className="mb-10 flex justify-center gap-3 text-5xl" aria-hidden="true">
          <span>🐻</span><span>🐧</span><span>🤖</span><span>🦜</span><span>🦉</span><span>🐲</span>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="btn-chunky bg-gradient-to-r from-brand-500 to-pink-500 px-8 py-4 text-base text-white hover:scale-105"
          >
            Start Learning for Free 🚀
          </Link>
          <Link
            href="/login"
            className="btn-chunky bg-white px-8 py-4 text-base text-gray-700 hover:bg-gray-50"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: TrendingUp,
              title: "Adaptive Difficulty",
              desc: "Questions automatically adjust as students improve or need extra help.",
              color: "bg-sky-100 text-sky-600",
            },
            {
              icon: Star,
              title: "Stars, Stickers & Badges",
              desc: "Earn stars, collect stickers and unlock badges. No leaderboards, ever.",
              color: "bg-yellow-100 text-yellow-600",
            },
            {
              icon: BookOpen,
              title: "Math, Reading & Science",
              desc: "Lessons, hints and a \"Why?\" explanation for every question.",
              color: "bg-fuchsia-100 text-fuchsia-600",
            },
            {
              icon: Users,
              title: "Teacher & Parent Dashboards",
              desc: "Track every student's progress, streaks, and areas needing support.",
              color: "bg-lime-100 text-lime-700",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fun sections */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">More than worksheets</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["📚", "Story Time", "Stories read aloud with highlighted words and a gentle quiz.", "from-indigo-500 to-fuchsia-500"],
            ["🎨", "Art & Craft", "Draw, colour and follow simple craft projects with a hidden lesson.", "from-orange-400 to-pink-500"],
            ["🎹", "Music Maker", "A xylophone, play-along songs and optional calm background music.", "from-violet-500 to-sky-500"],
            ["🎈", "Fun Zone", "Memory, animal sounds, bubble pop and breathing breaks.", "from-lime-400 to-emerald-500"],
          ].map(([emoji, title, desc, grad]) => (
            <div key={title} className={`rounded-3xl bg-gradient-to-br ${grad} p-5 text-white shadow-md`}>
              <p className="text-5xl" aria-hidden="true">{emoji}</p>
              <h3 className="mt-2 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-white/95">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety promise */}
      <section className="border-t border-border bg-gray-50 px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Safe and calm for kids</h2>
          <div className="grid gap-4 text-left text-sm sm:grid-cols-2">
            {[
              ["🔒", "No chat, no ads", "Children can't message each other and we never show advertising."],
              ["🐼", "Cartoon buddies, not photos", "Kids pick an animal, so no pictures of children are stored."],
              ["👨‍👩‍👧", "Grown-ups stay in charge", "A parent or teacher confirms every child account and can follow progress."],
              ["🧘", "Built-in breaks", "Gentle stretch reminders, a timer that is off by default, and mistakes are celebrated as learning."],
            ].map(([icon, title, desc]) => (
              <div key={title} className="rounded-xl border border-border bg-white px-4 py-4">
                <p className="font-bold text-gray-900">
                  <span className="mr-2 text-xl">{icon}</span>
                  {title}
                </p>
                <p className="mt-1 text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AdaptiveMinds ·{" "}
        <Link href="/privacy" className="font-semibold text-brand-700 hover:underline">
          Privacy Notice
        </Link>
      </footer>
    </div>
  );
}
