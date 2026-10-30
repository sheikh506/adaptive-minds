"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { Bell, LogOut } from "lucide-react";
import type { User } from "next-auth";
import { markNotificationsRead } from "@/app/actions/manage";
import MusicToggle from "@/components/fun/MusicToggle";
import SfxToggle from "@/components/fun/SfxToggle";

interface Notice {
  id: string;
  title: string;
  message: string;
  read: boolean;
}

export default function DashboardHeader({
  user,
  notifications,
}: {
  user: User & { role?: string };
  notifications: Notice[];
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const unread = notifications.filter((n) => !n.read).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) startTransition(() => markNotificationsRead());
  }

  return (
    <header className="flex h-16 items-center justify-between border-b-2 border-brand-100 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="text-sm text-gray-500">
        Hi,{" "}
        <span className="font-display text-lg font-bold text-brand-700">{user.name?.split(" ")[0]}</span>! 👋
      </div>

      <div className="flex items-center gap-3">
        {user.role === "STUDENT" && (
          <div className="flex items-center gap-2 lg:hidden">
            <MusicToggle compact className="bg-brand-100 text-brand-700 hover:bg-brand-200" />
            <SfxToggle compact className="bg-brand-100 text-brand-700 hover:bg-brand-200" />
          </div>
        )}
        <div className="relative">
          <button
            onClick={toggle}
            aria-label="Notifications"
            className="relative rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-white p-2 shadow-lg">
              {notifications.length === 0 ? (
                <p className="p-3 text-sm text-gray-400">You&apos;re all caught up!</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="rounded-xl p-3 hover:bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-kid-sun text-2xl font-bold text-brand-800 ring-2 ring-white"
          >
            {user.role === "STUDENT" && user.image && !user.image.startsWith("http")
              ? user.image
              : user.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="ml-2 flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
