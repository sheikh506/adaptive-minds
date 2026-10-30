"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { STICKER_EVENT } from "@/lib/stickers";
import { msSinceSfx } from "./audio";
import { playSfx } from "./sfx";

/**
 * Sounds for things that happen anywhere in the app. It renders nothing.
 *  - a soft "tap" when a button or link is pressed (unless that button already made its own sound)
 *  - a little "whoosh" when moving to another page
 *  - a sparkle when a new sticker is earned
 * The Music Maker keeps the speakers to itself.
 */
export default function GlobalSounds() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!pathname.startsWith("/dashboard/fun/music")) playSfx("whoosh");
  }, [pathname]);

  useEffect(() => {
    // Runs after React's own click handlers, so a button's own sound is already counted.
    const onClick = (e: MouseEvent) => {
      if (window.location.pathname.startsWith("/dashboard/fun/music")) return;
      const el = (e.target as Element | null)?.closest?.("button, a[href], [role='button'], summary");
      if (!el || (el as HTMLButtonElement).disabled) return;
      if (msSinceSfx() < 120) return;
      playSfx("tap");
    };
    let t: ReturnType<typeof setTimeout> | undefined;
    const onSticker = () => {
      clearTimeout(t);
      t = setTimeout(() => playSfx("sticker"), 500);
    };
    document.addEventListener("click", onClick);
    window.addEventListener(STICKER_EVENT, onSticker);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(STICKER_EVENT, onSticker);
      clearTimeout(t);
    };
  }, []);

  return null;
}
