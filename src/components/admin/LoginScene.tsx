"use client";
import Desk from "../hero/Desk";

type Tok = [string, string];
const C = { kw: "#C792EA", st: "#C3E88D", pu: "#89DDFF", cm: "#5C6370", ok: "#5EEAD4", err: "#FF7A90", pr: "#E6E6E6" };

export type LoginPhase = "idle" | "typing" | "auth" | "ok" | "error";

export default function LoginScene({ phase, name, message }: { phase: LoginPhase; name: string; message?: string }) {
  const first = name.split(" ").pop() ?? "there";
  const base: Tok[][] = [
    [["// admin.ts", C.cm]],
    [["const ", C.kw], ["session", C.pr], [" = ", C.pu], ["await ", C.kw], ["auth", C.pr], [".", C.pu], ["signIn", C.pr], ["()", C.pu]],
  ];
  const tail: Record<LoginPhase, Tok[][]> = {
    idle: [[["// waiting for credentials…", C.cm]]],
    typing: [[["// waiting for credentials…", C.cm]]],
    auth: [[["→ verifying", C.pu]], [["…", C.cm]]],
    ok: [[["✓ authenticated", C.ok]], [[`"Welcome back, ${first}."`, C.st]]],
    error: [[["✕ ", C.err], [message || "sign-in failed", C.err]], [["// check the email and password", C.cm]]],
  };
  return (
    <Desk
      variant="login"
      name={name} role="" location="Dhaka" stack={[]} timezone="Asia/Dhaka"
      forced={{ lamp: phase !== "idle", monitor: phase === "auth" || phase === "ok" || phase === "error", laptop: phase === "ok" }}
      codeOverride={[...base, ...tail[phase]]}
    />
  );
}
