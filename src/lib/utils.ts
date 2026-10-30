import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toString();
}

export function getLevelFromXP(xp: number): number {
  // Level up every 100 XP, max level 10
  return Math.min(Math.floor(xp / 100) + 1, 10);
}

export function getXPForNextLevel(currentXP: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  const level = getLevelFromXP(currentXP);
  const currentLevelXP = (level - 1) * 100;
  const nextLevelXP = level * 100;
  const current = currentXP - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current, needed, percentage: Math.round((current / needed) * 100) };
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return "text-green-600";
  if (accuracy >= 60) return "text-yellow-600";
  return "text-red-500";
}

export function getStreakEmoji(days: number): string {
  if (days >= 30) return "🔥🔥🔥";
  if (days >= 14) return "🔥🔥";
  if (days >= 7) return "🔥";
  if (days >= 3) return "✨";
  return "⚡";
}
