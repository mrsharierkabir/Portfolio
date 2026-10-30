# Architecture

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript | `cacheComponents` off; classic ISR (`revalidate`) + `revalidatePath` on admin save |
| Styling | Tailwind CSS v4 (`@theme` tokens in `globals.css`) | No component library; all bespoke |
| Smooth scroll | Lenis | Synced to GSAP ticker |
| Scroll animation | GSAP 3 + ScrollTrigger + SplitText | Pinning, scrubbing, reveals |
| UI motion | Framer Motion | Panels, menus, admin |
| 3D | three + @react-three/fiber + drei | Projects showcase |
| Globe | react-globe.gl (three) + world-atlas + topojson-client + d3-geo | Country polygons + centroids |
| Backend | Supabase (Postgres, Auth, Storage, RLS) | `@supabase/ssr` for cookie sessions |
| Editor | TipTap 3 | Blog |
| Validation | zod | Contact API |
| Email | Resend REST API (optional) | Contact notifications |
| Fonts | Geist Sans/Mono (npm `geist`), Instrument Serif (`@fontsource`) | No network at build |
| Hosting | Vercel | Free tier |

## Folder structure

```
src/
  app/
    layout.tsx                 root: fonts, metadata, JSON-LD
    (site)/                    public site (nav, smooth scroll, cursor, footer)
      layout.tsx
      page.tsx                 home
      projects/page.tsx
      projects/[slug]/page.tsx
      blog/page.tsx
      blog/[slug]/page.tsx
    mrskadmin/
      page.tsx                 login (illustrated)
      (panel)/layout.tsx       auth + admin guard, sidebar shell
      (panel)/dashboard/…      overview
      (panel)/profile/…        site settings
      (panel)/[resource]/…     generic CRUD (projects, presence, skills, experience, education, achievements, tools)
      (panel)/blog/…           post list + editor
      (panel)/messages/…       inbox
    api/contact/route.ts       contact form endpoint
    sitemap.ts robots.ts opengraph-image.tsx not-found.tsx icon.svg
  components/
    site/   Nav, Footer, SmoothScroll, Cursor, Preloader, Reveal, SectionHeading, Marquee
    hero/   Hero, Desk (SVG + interactions)
    projects/ ProjectsShowcase, ProjectsScene (R3F), cover art
    globe/  ReachPresence, GlobeView
    sections/ Skills, About, Tools, BlogPreview, Contact
    admin/  AdminShell, ResourceManager, FieldRenderer, ImageField, RichEditor, LoginScene, SettingsForm
  lib/
    supabase/ client.ts server.ts proxy.ts
    data.ts         all public reads (Supabase → fallback to seed)
    seed.ts         bundled content (mirrors supabase/seed.sql)
    resources.ts    admin field schemas per table
    types.ts utils.ts countries.ts actions.ts
  proxy.ts          session refresh + /mrskadmin/* guard
supabase/
  schema.sql        tables, RLS, storage bucket
  seed.sql          initial content
scripts/
  seed-sql.mjs      regenerates seed.sql from src/lib/seed.ts output (JSON)
```

## Data model (Postgres)

| Table | Purpose | Key columns |
|---|---|---|
| `admins` | who can write | `user_id` → auth.users |
| `site_settings` | single row (id=1) | `data jsonb` (profile, socials, about lists, SEO) |
| `projects` | showcase + case studies | slug, title, category, device, summary, description, role, year, country, stack[], features[], live_url, repo_url, cover_url, gallery[], accent, featured, published, sort |
| `presence` | globe entries | country, title, kind, tech, url, description, project_slug, sort |
| `skills` | skills | category, name, level (0–100), used_in[], sort, published |
| `experience` | work/freelance | role, org, location, start, end, current, description, bullets[] |
| `education` | academic | institution, degree, field, start, end, current, grade, details |
| `achievements` | certs/awards | title, issuer, date, url, kind |
| `tools` | Tools section | name, tagline, description, stack[], url, repo_url, status, cover_url, accent |
| `posts` | blog | slug, title, excerpt, content_html, content_json, cover_url, tags[], status, published_at, featured, seo_title, seo_description, reading_minutes |
| `messages` | contact inbox | name, email, purpose, company, message, ip, read, archived |

All content tables have `id uuid`, `created_at`, `updated_at`, `sort int`, and (where relevant) `published bool`.

### Security (RLS)
- `is_admin()` SQL function: `exists(select 1 from admins where user_id = auth.uid())`.
- Public (anon): `select` published rows only; posts only when `status='published' and published_at <= now()`.
- `messages`: anon may `insert` only; admin selects/updates/deletes.
- Admin: full access via `is_admin()`.
- Storage bucket `media`: public read; insert/update/delete only for admins.
- Sign-ups are disabled in Supabase Auth; the single admin user is created in the dashboard.

## Data flow
- **Public pages**: Server Components call `lib/data.ts` → Supabase anon client. If env vars are missing or a query fails, return `seed.ts` data. Pages export `revalidate = 300`.
- **Admin**: Client Components use the browser Supabase client (session cookie). RLS enforces permissions. After every write the client calls the `revalidateSite()` server action (which re-checks admin) → `revalidatePath('/', 'layout')`.
- **Contact**: `POST /api/contact` → zod validate → honeypot + min time + IP rate-limit (5/hour via `messages` count) → insert → optional Resend email.

## Environment variables

| Name | Where | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client+server | for live data |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client+server | for live data |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | contact rate-limit & insert (optional; falls back to anon insert) |
| `RESEND_API_KEY` | server only | optional email notifications |
| `CONTACT_TO_EMAIL` | server only | where notifications go |
| `NEXT_PUBLIC_SITE_URL` | both | canonical URLs, sitemap |

## Boundaries
- No secrets in client code; service role key only in route handlers.
- Heavy client libs (three, globe, tiptap) are dynamically imported (`ssr:false`) to keep the first load small.
- The desk is pure SVG + CSS/GSAP (no canvas) so it's crisp, accessible and cheap.
