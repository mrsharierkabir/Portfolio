import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">Error 404</p>
        <h1 className="display mt-6 text-[clamp(3rem,10vw,8rem)]">Lost the <span className="serif-accent">thread.</span></h1>
        <p className="mx-auto mt-6 max-w-md text-ink-2">This page doesn&apos;t exist or has moved. The work is still where you left it.</p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">Back home</Link>
          <Link href="/projects" className="btn btn-secondary">See projects</Link>
        </div>
      </div>
    </main>
  );
}
