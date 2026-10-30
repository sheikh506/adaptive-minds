"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Trophy,
  TrendingUp,
  Users,
  Settings,
  GraduationCap,
  Sparkles,
  BookHeart,
  Palette,
  Gamepad2,
  Heart,
  Pencil,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MusicToggle from "@/components/fun/MusicToggle";
import SfxToggle from "@/components/fun/SfxToggle";

const STUDENT_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/play", icon: Map, label: "Learn" },
  { href: "/dashboard/stories", icon: BookHeart, label: "Stories" },
  { href: "/dashboard/art", icon: Palette, label: "Art & Craft" },
  { href: "/dashboard/fun", icon: Gamepad2, label: "Fun Zone" },
  { href: "/dashboard/learn/feelings", icon: Heart, label: "Feelings" },
  { href: "/dashboard/learn/letters", icon: Pencil, label: "Handwriting" },
  { href: "/dashboard/placement", icon: Sparkles, label: "Placement" },
  { href: "/dashboard/progress", icon: TrendingUp, label: "My Progress" },
  { href: "/dashboard/rewards", icon: Trophy, label: "Rewards" },
];

const TEACHER_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/classroom", icon: GraduationCap, label: "Classroom" },
  { href: "/dashboard/students", icon: Users, label: "Students" },
];

const PARENT_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/children", icon: Users, label: "My Children" },
  { href: "/dashboard/learn/printables", icon: Printer, label: "Printables" },
];

const NAV_MAP: Record<string, typeof STUDENT_NAV> = {
  STUDENT: STUDENT_NAV,
  TEACHER: TEACHER_NAV,
  PARENT: PARENT_NAV,
};

export default function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const nav = NAV_MAP[role] ?? STUDENT_NAV;

  return (
    <>
    {/* Mobile bottom navigation */}
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-around overflow-x-auto border-t-2 border-brand-100 bg-white py-2 lg:hidden"
    >
      {(role === "STUDENT"
        ? nav.filter((n) => ["/dashboard", "/dashboard/play", "/dashboard/stories", "/dashboard/art", "/dashboard/fun"].includes(n.href))
        : [...nav, { href: "/dashboard/settings", icon: Settings, label: "Settings" }]
      ).map((item) => {
        const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href) || (item.href === "/dashboard/play" && pathname.startsWith("/dashboard/learn"));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 text-[11px] font-bold",
              active ? "text-brand-600" : "text-gray-500"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
    <aside className="hidden w-64 flex-shrink-0 border-r-2 border-brand-100 bg-white lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b-2 border-brand-100 bg-gradient-to-r from-brand-500 to-kid-pink px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xl font-extrabold text-brand-600 shadow">
          A
        </div>
        <span className="font-display text-xl font-bold text-white">AdaptiveMinds</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {nav.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href) || (item.href === "/dashboard/play" && pathname.startsWith("/dashboard/learn"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors",
                active
                  ? "bg-brand-100 text-brand-700"
                  : "text-gray-600 hover:bg-brand-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", active ? "text-brand-600" : "text-gray-400")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Music + settings at bottom */}
      <div className="space-y-1 border-t-2 border-brand-100 px-4 py-4">
        {role === "STUDENT" && <MusicToggle />}
        {role === "STUDENT" && <SfxToggle />}
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-400" />
          Settings
        </Link>
      </div>
    </aside>
    </>
  );
}
