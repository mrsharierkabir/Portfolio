"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Roll from "./Roll";

const links = [
  { href: "#work", label: "Work" },
  { href: "#reach", label: "Reach" },
  { href: "#skills", label: "Skills" },
  { href: "#about", label: "About" },
  { href: "#tools", label: "Tools" },
  { href: "#writing", label: "Writing" },
];

export default function Nav({ initials, available }: { initials: string; available: boolean }) {
  const path = usePathname();
  const home = path === "/";
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const dark = document.querySelectorAll("[data-theme='dark']");
      let d = false;
      dark.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= 40 && r.bottom >= 40) d = true;
      });
      setOnDark(d);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!home) return;
    const ids = [...links.map((l) => l.href.slice(1)), "contact"];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [home]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const href = (h: string) => (home ? h : `/${h}`);
  const tone = onDark ? "border-white/10 bg-night/70 text-white" : "border-line bg-paper/75 text-ink";

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="container-x flex items-center justify-between pt-4 md:pt-5">
          <Link
            href="/"
            className={`pointer-events-auto grid h-11 place-items-center rounded-full border px-4 font-serif text-xl italic backdrop-blur-xl transition-colors duration-500 ${tone}`}
            aria-label="Home"
          >
            {initials.toLowerCase()}
          </Link>

          <nav
            aria-label="Primary"
            className={`pointer-events-auto hidden items-center gap-1 rounded-full border p-1.5 backdrop-blur-xl transition-all duration-500 md:flex ${tone} ${scrolled ? "shadow-[var(--shadow-float)]" : ""}`}
          >
            {links.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <a key={l.href} href={href(l.href)} className="relative rounded-full px-4 py-2 text-sm">
                  {isActive && (
                    <motion.span layoutId="nav-pill" className={`absolute inset-0 rounded-full ${onDark ? "bg-white/10" : "bg-ink/[0.06]"}`} transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                  )}
                  <span className="relative"><Roll>{l.label}</Roll></span>
                </a>
              );
            })}
            <Link href="/blog" className="relative rounded-full px-4 py-2 text-sm"><Roll>Blog</Roll></Link>
          </nav>

          <div className="pointer-events-auto flex items-center gap-2">
            <a href={href("#contact")} className={`btn btn-md hidden sm:inline-flex ${onDark ? "bg-white text-ink" : "btn-primary"}`}>
              {available && <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-success" /></span>}
              <Roll>Let&apos;s talk</Roll>
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`grid h-11 w-11 place-items-center rounded-full border backdrop-blur-xl md:hidden ${tone}`}
            >
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0.5"}`} />
                <span className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-5 pb-10 pt-28 text-paper md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {[...links, { href: "#contact", label: "Contact" }].map((l, i) => (
                <motion.a
                  key={l.href}
                  href={href(l.href)}
                  onClick={() => setOpen(false)}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline gap-4 border-b border-white/10 py-4 text-4xl font-semibold tracking-tight"
                >
                  <span className="font-mono text-xs text-white/40">0{i + 1}</span>
                  {l.label}
                </motion.a>
              ))}
              <Link href="/blog" onClick={() => setOpen(false)} className="py-4 text-4xl font-semibold tracking-tight">Blog</Link>
            </nav>
            <p className="font-mono text-xs text-white/50">{available ? "Available for work" : ""}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
