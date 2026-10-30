# M R Sharier Kabir — Portfolio

A premium, fully content-managed developer portfolio built to get hired.

- **Interactive desk hero** — a 2D illustration of my real setup. Switch on the lamp, wake the monitor, open the laptop; the scene follows your cursor.
- **3D Selected Work** — a pinned, scroll-driven Three.js wheel of devices with case-study pages.
- **Reach & Presence** — a scroll-scrubbed globe entrance that settles into an interactive, spinning globe of countries I've worked with.
- **Skills, About, Tools, Blog, Contact** — all editable.
- **Hidden admin** at `/mrskadmin` — edit everything, write blog posts, read messages. No public link to it anywhere.

> Docs for contributors and AI agents: [`PRD.md`](PRD.md) · [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) · [`AGENTS.md`](AGENTS.md) · [`TASKS.md`](TASKS.md)

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Framer Motion · Three.js / React Three Fiber · react-globe.gl · Supabase (Postgres, Auth, Storage, RLS) · TipTap · Vercel.

---

## 1. Run it locally (2 minutes)

Requires **Node.js 20+**.

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables the site runs on the bundled content in `src/lib/seed.ts`, so you can see everything immediately. The admin needs Supabase (step 2).

## 2. Connect Supabase (10 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste all of [`supabase/schema.sql`](supabase/schema.sql) → **Run**. This creates the tables, security rules (RLS) and the `media` storage bucket.
3. New query → paste [`supabase/seed.sql`](supabase/seed.sql) → **Run**. This loads your current content.
4. **Authentication → Sign In / Providers → Email**: turn **off** “Allow new users to sign up”.
5. **Authentication → Users → Add user → Create new user**: your email + a strong password, tick *Auto confirm*.
6. SQL Editor → run once:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'sharier48@gmail.com';
   ```
7. **Project Settings → API**: copy the URL, `anon` key and `service_role` key.
8. `cp .env.example .env.local` and paste them in. Restart `npm run dev`.

Now open **http://localhost:3000/mrskadmin** and sign in.

## 3. Deploy to Vercel (5 minutes)

1. Push this folder to a GitHub repo.
2. [vercel.com/new](https://vercel.com/new) → import the repo (framework auto-detected).
3. Add the environment variables from `.env.local` (set `NEXT_PUBLIC_SITE_URL` to your Vercel URL).
4. Deploy. Later, add a custom domain under **Project → Domains** and update `NEXT_PUBLIC_SITE_URL`.

Optional: contact-form emails — create a key at [resend.com](https://resend.com) and set `RESEND_API_KEY` + `CONTACT_TO_EMAIL`.

## 4. Using the admin (`/mrskadmin`)

| Section | What it controls |
|---|---|
| Profile & site | Name, headline, pitch, availability, contact details, socials, photo, **CV upload**, bio, facts, hobbies/likes/dislikes, SEO |
| Projects | Case studies; *Featured* ones appear in the 3D showcase. Upload a cover screenshot to replace the generated mock-up |
| Reach & Presence | One entry = one project in a country on the globe. Pick countries from the list so they light up |
| Skills / Experience / Education / Achievements / Tools | Each has add, edit, reorder (▲▼), hide/show and delete |
| Blog | Rich editor (headings, lists, quotes, code with highlighting, links, images by upload/paste/drop, YouTube, alignment), cover, tags, drafts, scheduling, SEO preview |
| Messages | Contact-form inbox: read/unread, archive, delete, reply by email |

Every save updates the live site within seconds.

## 5. Before you share the link — check these

Some details were written from what I knew and should be confirmed in the admin:

- **Projects:** stack, features and year for M R Mart, AAKAAR and Dak (repos are empty/private, so these are best guesses). Upload real screenshots.
- **Retype** (Tools): add its real description and link.
- **Reach & Presence:** the Australia entries and *Chaka* came from earlier notes — confirm or remove.
- **Experience dates** (2023 — Present) and skill levels.
- **Photo:** upload a portrait (4:5) under Profile → Media.
- **CV:** a one-page starter résumé is in `public/resume/`. Replace it from Profile → Media whenever you like.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run db:seed-sql` | Regenerate `supabase/seed.sql` from `src/lib/seed.ts` |
