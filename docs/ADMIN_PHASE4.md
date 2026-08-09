# OrderWeb Admin — Phase 4 (Nice extras)

Phase 4 adds only extras that help weekly content updates. Everything else stays deferred.

## Shipped

### Change password

- `/owadmin/account` — signed-in users change password (current + new)
- Strong password rules still apply (10+ chars, letter + number)

### Forgot password

- Login screen → **Forgot password?**
- Sends a 1-hour reset link via Resend (requires API key + verified domain)
- Reset page: `/owadmin/reset-password?token=…`
- Set `SITE_URL` (or `VITE_SITE_URL`) in production so links point at the live host

### Analytics in admin

- Settings → **Analytics** (Admin only)
- Optional GA4 measurement ID (`G-…`)
- Optional custom head HTML (Plausible, pixels, etc.)
- Injected on **public pages only** (not `/owadmin`)

## Skipped (not needed for weekly updates)

| Extra | Why skipped |
| --- | --- |
| Duplicate a page section | Editors can copy text manually; layout stays code-owned |
| Schedule publish | Draft → Publish on the day is enough |
| Multi-language | Only if you truly need separate locales |
| Blog / news | Only if you want articles as a product |

## Who does what

| You | Builder (dev) |
| --- | --- |
| Choose stack / approve plan | Set up DB, storage, admin UI |
| Create Resend + verify domain | Wire contact form + settings |
| Write final copy / provide images | Build page editors |
| Test as a real user | Connect public pages to content |
| Keep admin password safe | Deploy + backups guidance |

## Deploy + backups (ops)

### Deploy checklist

1. Copy `.env.example` → production secrets (never commit `.env`)
2. Set `ADMIN_SESSION_SECRET` (32+ random chars) and strong bootstrap password if first boot
3. Set `SITE_URL` to the live origin (for reset emails)
4. Set Resend key (Settings and/or `RESEND_API_KEY`) + verified `orderweb.co.uk`
5. Build with `npm run build` and run the production server your host expects
6. Confirm `/owadmin` is reachable, logged-in edits publish, contact form delivers

### Backups (daily recommended)

Content lives on disk until Supabase is the live driver:

- `.data/cms-db.json` — pages, settings, users, media metadata, activity
- `public/cms-uploads/` — uploaded images

Copy both to durable storage (S3, Backblaze, host snapshots). Keep at least 7 daily + 4 weekly copies. After restore, restart the app and smoke-test login + one publish.

### Password safety (you)

- Prefer a password manager
- Rotate via **Account** after any shared access
- Use Forgot password only when Resend is configured; otherwise ask the builder to reset via bootstrap / DB with care

## Phase 4 done when

You can change or reset the admin password without a deploy, and optionally drop a GA/snippet ID in Settings without touching code.
