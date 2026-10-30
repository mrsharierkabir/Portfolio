# Implementation plan

Work top to bottom, one task at a time. Tick when `lint` + `build` pass and the feature is checked at 375px and 1440px.

## Phase 0 — Foundation
- [x] Scaffold Next.js 16 + TS + Tailwind v4; install deps
- [x] Docs: README, PRD, ARCHITECTURE, DESIGN-SYSTEM, AGENTS, TASKS
- [x] Design tokens + fonts in `globals.css` / root layout
- [x] Supabase schema with RLS + storage bucket (`supabase/schema.sql`)
- [x] Seed content (`src/lib/seed.ts`, `supabase/seed.sql`)
- [x] Data layer with seed fallback (`src/lib/data.ts`)
- [x] Supabase clients + `proxy.ts` session refresh and admin guard

## Phase 1 — Site shell
- [x] Lenis + GSAP sync (`SmoothScroll`)
- [x] Nav (floating pill, active section, mobile sheet)
- [x] Custom cursor with labels
- [x] Preloader (once per session)
- [x] Reveal + SectionHeading primitives
- [x] Footer with Dhaka time + back to top

## Phase 2 — Hero desk
- [x] SVG desk, chair, riser, monitor, PC, MacBook, keyboard, mouse, lamp, books, bottle, mug, clock
- [x] Interactions: lamp light, monitor boot/typing, MacBook open/close, RGB, steam
- [x] Cursor parallax + lamp tracking
- [x] Keyboard access + reduced motion

## Phase 3 — Selected Work
- [x] R3F scene: curved track, browser/phone frames, cover textures
- [x] Pinned scroll stepping + ↓ button + arrow keys
- [x] Detail panel transitions
- [x] `/projects` and `/projects/[slug]` case-study pages

## Phase 4 — Reach & Presence
- [x] Scroll-scrubbed entrance (scale, spin, borders, arcs, counters)
- [x] Interactive mode (hover/click/drag/mobile two-tap)
- [x] Country panel

## Phase 5 — Content sections
- [x] Skills
- [x] About (bio, facts, education, experience, achievements, hobbies/likes/dislikes)
- [x] Tools
- [x] Blog preview + `/blog` + `/blog/[slug]`
- [x] Contact + `/api/contact`

## Phase 6 — Admin
- [x] Illustrated login at `/mrskadmin`
- [x] Panel shell + dashboard
- [x] Generic resource manager (projects, presence, skills, experience, education, achievements, tools)
- [x] Profile & site settings (incl. CV + avatar upload)
- [x] Blog editor (TipTap) with drafts/schedule/SEO
- [x] Messages inbox
- [x] Revalidate on save

## Phase 7 — Ship
- [x] SEO: metadata, OG image, sitemap, robots, JSON-LD
- [x] Starter résumé PDF in `/public/resume`
- [ ] Create Supabase project, run `schema.sql` + `seed.sql`, create admin user (owner)
- [ ] Deploy to Vercel, add env vars (owner)
- [ ] Replace placeholder copy/screenshots from admin (owner)

## Backlog
- [ ] Real project screenshots for every case study
- [ ] Vercel Analytics
- [ ] Custom domain (e.g. `sharierkabir.dev`)
- [ ] Testimonials section once a client provides a quote
- [ ] GitHub activity strip
