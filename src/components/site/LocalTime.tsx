"use client";
import { useClock } from "@/hooks/useClock";
export default function LocalTime({ tz }: { tz: string }) {
  const c = useClock(tz);
  return <span className="tabular-nums">{c ? `${c.h}:${c.m}:${c.s}` : "--:--:--"}</span>;
}
