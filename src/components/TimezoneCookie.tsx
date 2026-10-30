"use client";

import { useEffect } from "react";

/** Remembers the browser's UTC offset so the server can work out "today" in the child's own timezone. */
export default function TimezoneCookie() {
  useEffect(() => {
    document.cookie = `am-tz=${new Date().getTimezoneOffset()}; path=/; max-age=31536000; samesite=lax`;
  }, []);
  return null;
}
