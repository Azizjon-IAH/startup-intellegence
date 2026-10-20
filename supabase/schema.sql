-- Run in Supabase SQL Editor. This schema is a starter; review RLS before production.
create extension if not exists pgcrypto;

create table if not exists public.startups (
  id text primary key,
  name text not null,
  handle text,
  category text not null default 'Other',
  description text,
  followers bigint not null default 0 check (followers >= 0),
  growth text,
  founded text,
  stage text,
  location text,
  website text,
  founder text,
  "founderHandle" text,
  signal text,
  verified boolean not null default false,
  "lastChecked" text,
  sources text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists startups_category_idx on public.startups(category);
create index if not exists startups_followers_idx on public.startups(followers desc);
create index if not exists startups_name_idx on public.startups using gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')));

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company text,
  use_case text,
  created_at timestamptz not null default now()
);

-- Public read-only directory access. Only enable if all columns are intended to be public.
alter table public.startups enable row level security;
drop policy if exists "Public can read startups" on public.startups;
create policy "Public can read startups" on public.startups for select to anon, authenticated using (true);

-- Do not expose lead records to public clients.
alter table public.leads enable row level security;
-- Inserts are performed by the server route using the configured key.
-- For production, use a server-only SUPABASE_SERVICE_ROLE_KEY in a server route,
-- never expose it with a NEXT_PUBLIC_ prefix, and add rate limiting / abuse protection.
