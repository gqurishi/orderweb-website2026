# OrderWeb Admin — Phase 3 (Safer workflow)

Phase 3 makes day-to-day editing safer for non-technical teammates.

## Step 1 — Draft → Publish

- **Save draft** — writes draft only (site stays on last publish)
- **Preview draft** — opens the public URL with `?cmsPreview=1` (admin session required)
- **Publish** — copies draft → live (requires hero headline + SEO title/description)
- **Revert** — restores draft from last published

## Step 2 — Media library

- Alt text (SEO / accessibility)
- Folder / tag filter
- **Replace** overwrites the file in place and remaps page URLs if needed
- Shows which pages use each image
- Delete removes DB row + file on disk

## Step 3 — Users & access

- `/owadmin/users` (Admin only)
- Roles: **Admin** (full) vs **Editor** (pages + media; no Settings / Users / email keys)
- Strong password rules for new users (10+ chars, letter + number)

## Step 4 — Activity log

- `/owadmin/activity` + dashboard strip
- Login, draft save, publish, revert, media, settings, user changes

## Step 5 — Content helpers

- Character guidance on SEO fields
- Per-page hero/image hints
- Publish blocked if required fields empty

## Step 6 — SEO (light)

Per page: meta title, meta description, share image → used in public `<head>`

## Step 7 — Hardening

- Login rate limit (8 failures / 15 minutes per email)
- Strong password rules for bootstrap + new users
- `/owadmin` `noindex` + `robots.txt` Disallow
- HTTPS cookie `secure` in production
- `ADMIN_SESSION_SECRET` required in production
- Backup: copy `.data/cms-db.json` + `public/cms-uploads/` daily (document for ops)

## Phase 3 done when

A non-technical teammate can update pages safely with draft → preview → publish, without risking a blank live site.
