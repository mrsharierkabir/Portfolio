"use client";
import { useEffect, useState } from "react";

/** Returns {h, m, s, label} for a timezone, ticking every second (null on server). */
export function useClock(timeZone = "Asia/Dhaka") {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const h = get("hour"), m = get("minute"), s = get("second");
  return { h, m, s, label: `${h}:${m}` };
}
