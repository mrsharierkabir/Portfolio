"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { getBrowserSupabase } from "@/lib/supabase/client";
import LoginScene, { type LoginPhase } from "@/components/admin/LoginScene";

export default function LoginForm({ name, configured }: { name: string; configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<LoginPhase>("idle");
  const [error, setError] = useState("");
  const shake = useAnimationControls();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Enter your email and password."); shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } }); return; }
    const sb = getBrowserSupabase();
    if (!sb) return;
    setError("");
    setPhase("auth");
    const { error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setPhase("error");
      setError(err.message === "Invalid login credentials" ? "That email and password don't match." : /fetch|network/i.test(err.message) ? "Couldn't reach Supabase — check the project URL and your connection." : err.message);
      shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      return;
    }
    setPhase("ok");
    setTimeout(() => { router.replace("/mrskadmin/dashboard"); router.refresh(); }, 1400);
  };

  return (
    <main className="grid min-h-dvh bg-paper lg:grid-cols-[1.35fr_1fr]">
      <div className="relative flex items-center justify-center overflow-hidden bg-[#1E2029] p-4 lg:p-10">
        <div className="w-full max-w-[1000px]"><LoginScene phase={phase} name={name} message={error} /></div>
        <p className="absolute bottom-5 left-6 font-mono text-[11px] uppercase tracking-[0.08em] text-white/40">Studio · after hours</p>
      </div>

      <div className="flex items-center justify-center px-6 py-14">
        <motion.div animate={shake} className="w-full max-w-[380px]">
          <p className="font-serif text-2xl italic">mrsk</p>
          <h1 className="mt-10 text-4xl font-semibold tracking-[-0.04em]">Welcome back.</h1>
          <p className="mt-3 text-ink-2">Sign in to manage your portfolio.</p>

          {!configured ? (
            <div className="mt-10 rounded-2xl border border-line bg-card p-6 text-sm leading-relaxed text-ink-2">
              <p className="font-medium text-ink">Connect Supabase to enable the admin.</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>Create a project at supabase.com.</li>
                <li>Run <code className="font-mono text-xs">supabase/schema.sql</code> then <code className="font-mono text-xs">seed.sql</code>.</li>
                <li>Add the env vars from <code className="font-mono text-xs">.env.example</code>.</li>
                <li>Create your user and add it to <code className="font-mono text-xs">admins</code>.</li>
              </ol>
              <p className="mt-3">Full steps are in README.md.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-10 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="field-label">Email</label>
                <input id="email" type="email" autoComplete="username" className="field" value={email}
                  onFocus={() => phase === "idle" && setPhase("typing")}
                  onChange={(e) => { setEmail(e.target.value); if (phase === "error") setPhase("typing"); }} />
              </div>
              <div>
                <label htmlFor="password" className="field-label">Password</label>
                <div className="relative">
                  <input id="password" type={show ? "text" : "password"} autoComplete="current-password" className="field pr-16" value={password}
                    onFocus={() => phase === "idle" && setPhase("typing")}
                    onChange={(e) => { setPassword(e.target.value); if (phase === "error") setPhase("typing"); }} />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 font-mono text-xs text-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
                </div>
              </div>
              {error && <p className="text-sm text-danger" role="alert">{error}</p>}
              <button type="submit" disabled={phase === "auth" || phase === "ok"} className="btn btn-primary w-full">
                {phase === "auth" ? "Signing in…" : phase === "ok" ? "Opening your studio…" : "Sign in"}
              </button>
            </form>
          )}
          <Link href="/" className="mt-10 inline-block font-mono text-xs uppercase tracking-[0.08em] text-muted hover:text-ink">← Back to site</Link>
        </motion.div>
      </div>
    </main>
  );
}
