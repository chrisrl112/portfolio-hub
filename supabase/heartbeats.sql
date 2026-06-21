-- Supabase `heartbeats` live layer (ph-5, milestone M2).
-- Run this in the Supabase SQL editor against the portfolio-hub project.
-- Source of truth: build-prep/SUPABASE-HEARTBEATS-SPEC.md §2 (DDL) + §3 (RLS).
--
-- Model: one latest-state row per project (upsert keyed on project_slug).
-- Writes are service_role-only (bypass RLS, live ONLY in each spoke runtime,
-- wired later in ph-23/ph-24). The public site reads with the anon key under
-- read-only RLS at build time. No secret ever reaches the repo or the client.

-- ─────────────────────────────────────────────────────────────────────────
-- §2  Table + updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.heartbeats (
  project_slug   text primary key,                       -- matches manifest "slug" exactly
  last_report    timestamptz not null,                   -- last successful heartbeat POST
  last_activity  timestamptz,                            -- last real sign-of-life (nullable)
  status         text not null
                   check (status in ('live','beta','concept','dormant','retired')),
  metric_values  jsonb not null default '{}'::jsonb,     -- keys MUST match the manifest metric `key`s
  note           text,                                    -- optional honest clarifier (nullable)
  updated_at     timestamptz not null default now()
);

-- Keep updated_at honest on every upsert.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_heartbeats_updated_at on public.heartbeats;
create trigger trg_heartbeats_updated_at
  before insert or update on public.heartbeats
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- §3  RLS — anon may SELECT and nothing else
-- ─────────────────────────────────────────────────────────────────────────
alter table public.heartbeats enable row level security;

-- Public (anon) may READ every row. Nothing else.
create policy "heartbeats_anon_read"
  on public.heartbeats
  for select
  to anon
  using (true);

-- NO anon insert / update / delete policies exist → those operations are denied
-- by default. All writes happen with the service_role key, which bypasses RLS.
-- Do NOT add an anon write policy "for testing" — insert the manual test row via
-- the SQL editor / service_role instead (spec §8.7).
