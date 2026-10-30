import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FunGames from "@/components/fun/FunGames";

export const dynamic = "force-dynamic";

const FACTS = [
  "Octopuses have three hearts! 🐙",
  "A group of flamingos is called a flamboyance. 🦩",
  "Honey never goes bad. Jars found in old tombs are still good! 🍯",
  "Butterflies taste with their feet. 🦋",
  "A day on Venus is longer than a year on Venus. 🪐",
  "Bananas are berries, but strawberries are not! 🍌",
  "Sea otters hold hands when they sleep so they do not drift apart. 🦦",
  "Your tongue print is as special as your fingerprint. 👅",
  "Rainbows are really full circles. We just see half from the ground. 🌈",
  "Elephants can hear sounds through their feet. 🐘",
  "Giraffes have the same number of neck bones as you: seven! 🦒",
  "Clouds can weigh as much as a hundred elephants. ☁️",
];

/** Fun Zone hub. The fact of the day changes daily and is the same for everyone. */
export default async function FunPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const day = Math.floor(Date.now() / 86_400_000);
  const fact = FACTS[day % FACTS.length];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 p-6 text-white shadow-lg">
        <p className="text-5xl" aria-hidden="true">🎈🎉</p>
        <h1 className="mt-1 text-3xl font-bold">Fun Zone</h1>
        <p className="mt-1 max-w-xl text-white/95">Games, music and stickers. Play as long as you like. No timers, no scores against anyone.</p>
      </div>

      <div className="rounded-3xl bg-yellow-100 p-5 ring-2 ring-yellow-300">
        <p className="text-sm font-bold uppercase tracking-wide text-yellow-800">Fun fact of the day</p>
        <p className="mt-1 text-xl font-bold text-gray-900">{fact}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/dashboard/fun/music" className="tile bg-gradient-to-br from-violet-500 to-indigo-500">
          <span className="animate-float text-6xl" aria-hidden="true">🎹</span>
          <h2 className="mt-3 text-xl font-bold">Music Maker</h2>
          <p className="mt-1 text-sm text-white/90">Play a xylophone, learn songs, record your own tune.</p>
        </Link>
        <Link href="/dashboard/fun/stickers" className="tile bg-gradient-to-br from-amber-400 to-orange-500">
          <span className="animate-float text-6xl" aria-hidden="true">⭐</span>
          <h2 className="mt-3 text-xl font-bold">My Sticker Album</h2>
          <p className="mt-1 text-sm text-white/90">See every sticker you have collected.</p>
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold text-gray-900">Games</h2>
        <FunGames />
      </section>
    </div>
  );
}
