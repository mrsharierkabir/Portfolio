# Agent rules — read before every change

You are working on **M R Sharier Kabir's portfolio**. Read `PRD.md` (what), `ARCHITECTURE.md` (how), `DESIGN-SYSTEM.md` (look & motion) and the next unchecked item in `TASKS.md` before writing code. Work on **one task at a time** and tick it off when done.

## Non-negotiables
1. **Everything visible is editable from admin.** Never hard-code content in components. Read it through `src/lib/data.ts`; if you add a field, add it to `supabase/schema.sql`, `src/lib/types.ts`, `src/lib/seed.ts` and the admin schema in `src/lib/resources.ts` (or the settings form).
2. **No admin entry point on the public site.** The panel lives only at `/mrskadmin`, is `noindex`, and is disallowed in `robots.ts`.
3. **Security via RLS**, not UI. Every new table gets RLS policies using `public.is_admin()`. The service role key is only used in server route handlers.
4. **Design system only.** Use the CSS tokens/Tailwind theme in `globals.css`. No new colours, fonts or easing curves without updating `DESIGN-SYSTEM.md`.
5. **Motion must be premium, not loud.** Animate only transform/opacity/filter/clip-path. Respect `prefers-reduced-motion` (use `usePrefersReducedMotion` / `gsap.matchMedia`). Kill every ScrollTrigger and GSAP context on unmount.
6. **Performance.** three, react-globe.gl and TipTap must be dynamically imported with `ssr:false`. Cap R3F DPR at 1.75. No layout shift.
7. **Accessibility.** Semantic landmarks, visible labels on inputs, keyboard access to all interactive desk items (they are `<button>`-like `role="button"` groups with `aria-pressed`), alt text everywhere.
8. **Works offline from Supabase.** If env vars are missing, data falls back to `seed.ts` and the admin shows a setup screen. Don't break this.

## Next.js 16 notes (this repo)
- `cacheComponents` is **off**. Public pages use `export const revalidate = 300`; admin writes call `revalidateSite()` from `src/lib/actions.ts`.
- Route `params` / `searchParams` are **Promises** — `await` them.
- Auth/session refresh lives in `src/proxy.ts` (the old `middleware` convention is renamed `proxy`).
- Check `node_modules/next/dist/docs/` before using an API you're unsure about.

## Code style
- TypeScript strict; no `any` unless crossing an untyped library boundary (comment why).
- Server Components by default; `"use client"` only where interaction/animation requires it.
- Components: PascalCase files, one main export each. Hooks start with `use`.
- Tailwind classes ordered layout → box → type → colour → state. Extract repeats into components, not `@apply`.
- Copy: verb-first buttons, no "Submit/OK", errors never blame the user.

## Done means
`npm run lint` and `npm run build` pass, the page works at 375px and 1440px, and reduced-motion mode is checked.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
