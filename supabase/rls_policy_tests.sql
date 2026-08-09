-- Phase 5 — RLS / privilege re-tests (run in Supabase SQL editor as postgres)
-- Expect: every "must_fail" block raises an error; "must_pass" returns rows or empty OK.

-- 1) Anon cannot read admins / password hashes
set local role anon;
select password_hash from admins; -- must_fail

-- 2) Anon cannot read site_settings secrets
select smtp_password, contact_to_email from site_settings; -- must_fail

-- 3) Anon cannot read drafts from pages table
select draft from pages; -- must_fail

-- 4) Anon cannot write anywhere
insert into media (name, url) values ('x', '/x'); -- must_fail
update pages set draft = '{}'::jsonb where key = 'home'; -- must_fail
delete from activity_log; -- must_fail

-- 5) Anon CAN read public views only
select key, published from public_published_pages limit 1; -- must_pass
select id, url, mime from public_media limit 1; -- must_pass
select analytics_ga_measurement_id from public_analytics_settings; -- must_pass

-- 6) Public analytics view must not expose SMTP password column
-- (this should fail to parse / column does not exist)
select smtp_password from public_analytics_settings; -- must_fail

reset role;
