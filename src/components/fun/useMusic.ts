"use client";

import { useEffect, useState } from "react";

const KEY = "am-music";
const EVT = "am-music-change";

export function readMusic(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
}

export function writeMusic(on: boolean) {
  localStorage.setItem(KEY, on ? "1" : "0");
  window.dispatchEvent(new Event(EVT));
}

/** Music is off until someone turns it on. The choice is remembered on this device. */
export function useMusicEnabled(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(readMusic());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return [on, writeMusic];
}
