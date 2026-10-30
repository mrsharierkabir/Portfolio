-- ============================================================
--  Portfolio schema — run once in Supabase → SQL Editor
--  Safe to re-run (idempotent where possible).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- helpers ----------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ---------- admins ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.admins enable row level security;
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (user_id = auth.uid());

-- ---------- site settings (single row) ----------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text,
  device text not null default 'web',          -- web | mobile
  summary text,
  description text,
  role text,
  year text,
  country text,
  client text,
  stack text[] not null default '{}',
  features text[] not null default '{}',
  live_url text,
  repo_url text,
  cover_url text,
  gallery text[] not null default '{}',
  accent text default '#2F45FF',
  featured boolean not null default true,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- presence (globe) ----------
create table if not exists public.presence (
  id uuid primary key default gen_random_uuid(),
  country text not null,                      -- must match world-atlas name e.g. 'Bangladesh'
  title text not null,
  kind text,                                  -- e.g. 'E-commerce website'
  tech text,
  url text,
  description text,
  project_slug text,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- skills ----------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  level int not null default 70 check (level between 0 and 100),
  used_in text[] not null default '{}',
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- experience ----------
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  org text not null,
  location text,
  start_date text,
  end_date text,
  current boolean not null default false,
  description text,
  bullets text[] not null default '{}',
  url text,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- education ----------
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field text,
  start_date text,
  end_date text,
  current boolean not null default false,
  grade text,
  details text,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- achievements / certifications ----------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  kind text default 'Certification',
  date text,
  url text,
  description text,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- tools ----------
create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  description text,
  stack text[] not null default '{}',
  url text,
  repo_url text,
  status text default 'Live',                 -- Live | Beta | In progress
  cover_url text,
  accent text default '#2F45FF',
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- blog ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content_html text,
  content_json jsonb,
  cover_url text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  reading_minutes int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- messages ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  purpose text,
  company text,
  message text not null check (char_length(message) between 1 and 5000),
  ip text,
  read boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_ip_time on public.messages (ip, created_at desc);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['site_settings','projects','presence','skills','experience','education','achievements','tools','posts']
  loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- RLS ----------
alter table public.site_settings enable row level security;
alter table public.projects      enable row level security;
alter table public.presence      enable row level security;
alter table public.skills        enable row level security;
alter table public.experience    enable row level security;
alter table public.education     enable row level security;
alter table public.achievements  enable row level security;
alter table public.tools         enable row level security;
alter table public.posts         enable row level security;
alter table public.messages      enable row level security;

-- public read
drop policy if exists "public read" on public.site_settings;
create policy "public read" on public.site_settings for select using (true);

do $$
declare t text;
begin
  foreach t in array array['projects','presence','skills','experience','education','achievements','tools']
  loop
    execute format('drop policy if exists "public read published" on public.%I', t);
    execute format('create policy "public read published" on public.%I for select using (published or public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read published" on public.posts;
create policy "public read published" on public.posts for select
  using ((status = 'published' and published_at <= now()) or public.is_admin());

-- admin write on everything
do $$
declare t text;
begin
  foreach t in array array['site_settings','projects','presence','skills','experience','education','achievements','tools','posts','messages']
  loop
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- contact form: anyone may insert a message (never read)
drop policy if exists "anon insert" on public.messages;
create policy "anon insert" on public.messages for insert with check (read = false and archived = false);

-- ---------- storage ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');

drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ============================================================
-- AFTER creating your login user in Authentication → Users, run:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'sharier48@gmail.com';
-- ============================================================
