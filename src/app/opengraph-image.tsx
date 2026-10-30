import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/data";

export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const s = await getSettings();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F5F3EF", padding: 72, color: "#111" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#7A766F", letterSpacing: 2 }}>
          <span>PORTFOLIO</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 12, height: 12, borderRadius: 12, background: "#1F9D55" }} /><span>{s.available ? "AVAILABLE FOR WORK" : ""}</span></span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{s.name}</div>
          <div style={{ display: "flex", fontSize: 40, marginTop: 24, color: "#3B3A37" }}>{`${s.role} · ${s.location}`}</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {s.marquee.slice(1, 5).map((m) => (
            <span key={m} style={{ border: "2px solid #E2DED6", borderRadius: 999, padding: "10px 22px", fontSize: 22, color: "#3B3A37" }}>{m}</span>
          ))}
        </div>
        <div style={{ position: "absolute", right: 72, top: 230, width: 28, height: 28, borderRadius: 28, background: "#2F45FF" }} />
      </div>
    ),
    size,
  );
}
