-- OrderWeb Admin CMS — Supabase schema + strict RLS
-- Run in Supabase SQL editor before cutover from .data/cms-db.json
--
-- Security model:
-- - RLS enabled on EVERY table (no anon write policies)
-- - anon / authenticated: NO grants on base tables
-- - anon may read ONLY safe public views (no drafts, no password hashes, no SMTP secrets)
-- - server uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) — never under VITE_
-- - browser may use VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY only

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  salt text not null,
  role text not null default 'admin' check (role in ('admin')),
  created_by text,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  totp_enabled boolean not null default false,
  totp_secret text,
  totp_pending_secret text,
  totp_recovery_hashes text[] not null default '{}',
  phone_e164 text,
  sms_backup_enabled boolean not null default false
);

create table if not exists pages (
  key text primary key check (
    key in (
      'home',
      'about',
      'pricing',
      'contact',
      'restaurant-pos',
      'website',
      'software',
      'privacy',
      'terms',
      'faq',
      'dpa'
    )
  ),
  draft jsonb not null default '{}'::jsonb,
  published jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  draft_updated_at timestamptz,
  published_at timestamptz,
  published_by text,
  updated_at timestamptz
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  size integer not null default 0,
  mime text not null default 'image/jpeg',
  alt text not null default '',
  folder text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- smtp_password must never appear in any anon-facing view.
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  contact_to_email text not null default 'mail@orderweb.co.uk',
  contact_from_email text not null default 'OrderWeb Website <noreply@orderweb.co.uk>',
  smtp_host text not null default '',
  smtp_port integer not null default 587,
  smtp_secure boolean not null default false,
  smtp_user text not null default '',
  smtp_password text not null default '',
  analytics_ga_measurement_id text not null default '',
  analytics_gtm_id text not null default '',
  analytics_meta_pixel_id text not null default '',
  analytics_clarity_id text not null default '',
  seo_google_site_verification text not null default '',
  seo_bing_site_verification text not null default '',
  analytics_custom_head_html text not null default '',
  social_facebook text not null default '',
  social_instagram text not null default '',
  social_youtube text not null default '',
  social_x text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  actor_email text not null,
  action text not null,
  target text,
  summary text not null,
  meta jsonb not null default '{}'::jsonb
);

create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Seed rows
-- ---------------------------------------------------------------------------

insert into pages (key, draft, published, seo) values
  ('home', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('about', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('pricing', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('contact', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('restaurant-pos', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('website', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('software', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('privacy', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('terms', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('faq', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  ('dpa', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb')
on conflict (key) do nothing;

insert into site_settings (id) values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Public-safe views (owned by privileged role; no security_invoker)
-- Column-limited: no drafts, password hashes, TOTP secrets, or SMTP password.
-- ---------------------------------------------------------------------------

create or replace view public_published_pages as
select
  key,
  published,
  seo,
  published_at,
  published_by
from pages
where published_at is not null;

create or replace view public_media as
select
  id,
  name,
  url,
  size,
  mime,
  alt,
  folder,
  tags,
  created_at
from media;

create or replace view public_analytics_settings as
select
  analytics_ga_measurement_id,
  analytics_gtm_id,
  analytics_meta_pixel_id,
  analytics_clarity_id,
  seo_google_site_verification,
  seo_bing_site_verification,
  social_facebook,
  social_instagram,
  social_youtube,
  social_x
from site_settings
where id = 1;

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

revoke all on table admins from anon, authenticated;
revoke all on table pages from anon, authenticated;
revoke all on table media from anon, authenticated;
revoke all on table site_settings from anon, authenticated;
revoke all on table activity_log from anon, authenticated;
revoke all on table password_resets from anon, authenticated;

grant select on public_published_pages to anon, authenticated;
grant select on public_media to anon, authenticated;
grant select on public_analytics_settings to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS on every table — default deny for roles subject to RLS
-- Service role bypasses RLS (server-only CMS writes/reads).
-- ---------------------------------------------------------------------------

alter table admins enable row level security;
alter table pages enable row level security;
alter table media enable row level security;
alter table site_settings enable row level security;
alter table activity_log enable row level security;
alter table password_resets enable row level security;

-- Remove legacy open policies from older schema.sql runs
drop policy if exists "Public can read pages" on pages;
drop policy if exists "Public can read media" on media;
drop policy if exists "anon_select_published_pages_for_view" on pages;
drop policy if exists "anon_select_media_for_view" on media;
drop policy if exists "anon_select_analytics_settings_for_view" on site_settings;

-- Intentionally NO policies for anon/authenticated on base tables.
-- That blocks direct PostgREST reads of drafts, password_hash, smtp_password, etc.
-- Public data is exposed only through the views above.
