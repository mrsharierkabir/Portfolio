# PRD — M R Sharier Kabir · Portfolio

## 1. Goal

Get Sharier hired. The site is read by recruiters, hiring managers and freelance clients who give a portfolio 30–90 seconds. In that window they must learn **who he is, what he builds, proof that it's real, and how to contact him** — and remember the site afterwards.

Success measures:
- A recruiter can answer "what does he do / what has he shipped / how do I reach him" within the first two scrolls.
- Every project has a live link or repo and a clear statement of his role.
- Lighthouse ≥ 90 Performance (desktop), ≥ 95 Accessibility, Best Practices, SEO.
- Owner can change **every** piece of content from the admin panel without touching code.

## 2. Audience

| Audience | What they need | Where they find it |
|---|---|---|
| Recruiter (non-technical) | Name, role, availability, CV, contact | Hero, About, Contact, CV button |
| Engineering manager | Real projects, stack, depth, code | Projects + case studies, Skills, GitHub |
| Freelance client | Shipped client work, countries, contact | Reach & Presence, Projects, Contact |
| Sharier (owner) | Edit content, write posts, read messages | `/mrskadmin` |

## 3. Pages & sections

### Home (`/`)
1. **Preloader** — 1s name/percent intro, shown once per session.
2. **Hero — interactive desk.** 2D landscape illustration of Sharier's real setup (black-top desk with walnut side shelf, mesh chair with headrest, black riser with oak front, monitor, PC tower, MacBook, keyboard, mouse, lamp, books, water bottle, coffee). Light background.
   - Cursor: scene parallax by depth layer; lamp head tracks cursor; steam drifts away from cursor.
   - Lamp click → bulb glows, warm-white light cone + light pool on desk.
   - Monitor click → boots and types an intro "code" card with his name and role.
   - MacBook click → lid opens from lying closed; shows a terminal. Click again closes.
   - Keyboard / mouse / PC tower → minimal RGB, brighter when the monitor is on.
   - Live clock on the shelf shows Dhaka time.
   - Copy: availability badge, name, role, one-line pitch, "View work", "Download CV".
3. **Spacer / marquee** — slow marquee of roles and stack.
4. **Selected Work (3D).** Pinned section. Devices (browser frames, phone for Dak) on a curved 3D track. Scroll, the ↓ button or arrow keys advance one project. Left panel animates in: index, name, category, summary, role, stack, highlights, live/repo/case-study links. Each project links to `/projects/[slug]`.
5. **Reach & Presence (globe).** Pinned scroll-scrubbed entrance: point → globe scales up, fast spin decelerating, borders draw, populated countries fill, arcs fly from Dhaka, stat counters count. Then hands over to interactive mode:
   - Idle: slow continuous spin.
   - Populated countries light gray; blank countries near-white.
   - Hover: deep gray + count label + smooth zoom; spin slows, doesn't stop.
   - Click: opens a panel of that country's projects; stops spin.
   - Drag: stops spin.
   - Mobile: 1st tap = hover state, 2nd tap = open.
6. **Skills.** Grouped categories, each revealing with a staggered transition; proficiency meters; "used in" project links.
7. **About.** Photo/monogram, bio, quick facts, education timeline, experience timeline, achievements/certifications, hobbies, likes, dislikes, languages, CV.
8. **Tools.** Apps he built (Accio, CoinCount, Retype) with status, stack and links.
9. **Writing.** Latest 3 published posts (hidden if none).
10. **Contact.** Form (name, email, purpose, company optional, message) + direct channels (email, phone, GitHub, LinkedIn, location).
11. **Footer.** Links, socials, local time, back-to-top.

### Other public pages
- `/projects` — all published projects grid.
- `/projects/[slug]` — case study: hero cover, overview, role, year, country, stack, features, gallery, links, next project.
- `/blog`, `/blog/[slug]` — post list with tags; post page with cover, reading time, TOC, highlighted code, share, prev/next.
- `404`.

### Admin (`/mrskadmin`)
No public link anywhere; `noindex`; disallowed in robots.txt.
- **Login** with its own illustration (the desk at night, lamp off; turns on as you sign in).
- **Dashboard** — counts, unread messages, quick actions.
- **Profile & site** — name, role, tagline, pitch, availability, bio, location, email, phone (+ show/hide), socials, avatar, CV upload, hobbies/likes/dislikes/languages, SEO description.
- **Projects** — full CRUD, cover + gallery upload, stack, features, links, country, accent colour, device type, featured/published, ordering.
- **Reach & Presence** — entries per country (country picker from the globe's country list), title, type, tech, link, description.
- **Skills, Experience, Education, Achievements, Tools** — CRUD + ordering + publish toggles.
- **Blog** — rich editor (headings, bold/italic/underline/strike, lists, quotes, code blocks with language, links, images upload, YouTube embed, alignment, horizontal rule), cover, excerpt, tags, slug, SEO title/description, draft/published/scheduled, featured.
- **Messages** — inbox from contact form: read/unread, archive, delete, reply via email.

Every save revalidates the public site immediately.

## 4. Key user flows
- **Recruiter:** lands → reads hero → scrolls projects → opens a case study → clicks "Download CV" or contact.
- **Client:** lands → globe → clicks Australia → sees delivered projects → contact form (purpose: Freelance).
- **Owner adds a project:** `/mrskadmin` → Projects → New → fill → upload cover → Publish → appears in 3D showcase and on the globe if a country is set.
- **Owner writes a post:** Blog → New → write → Save draft → Publish (or schedule).

## 5. Non-functional
- Works without Supabase configured (falls back to bundled seed content) so it can be previewed instantly.
- `prefers-reduced-motion`: no pinning/scrubbing, instant reveals, static globe spin off.
- Mobile 375px+: hero simplifies, 3D canvas DPR capped, globe tap model.
- Keyboard accessible; visible focus; semantic landmarks; alt text from admin.
- Contact form: server validation, honeypot, minimum fill time, rate-limit by IP.
- SEO: metadata per page, OG image, sitemap, JSON-LD Person.

## 6. Out of scope (v1)
Comments on blog, newsletter, multi-language UI, analytics dashboard (add Vercel Analytics later).
