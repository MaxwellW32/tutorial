"use client";

import { useEffect, useState } from "react";

/**
 * `useEffect` runs code AFTER render, for things React does not manage itself:
 * timers, subscriptions, browser APIs. The function you return is the cleanup.
 */
export function Clock() {
  // null on the first render so the server HTML and the browser's first render match (lesson 5).
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Every second, the timer calls setNow and React re-renders with the new time.
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer); // runs when the component is removed from the page
  }, []); // [] = run once, when the component first appears

  return (
    <p className="font-mono text-2xl tabular-nums">
      {now ? now.toLocaleTimeString() : "starting…"}
      <span className="ml-3 text-xs text-zinc-500">ticking in your browser</span>
    </p>
  );
}
