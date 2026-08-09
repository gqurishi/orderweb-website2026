# Phase 1 QA checklist (Step 8)

- [x] Login / logout works (`/owadmin`)
- [x] Edit text → refresh public page → see change (Home / About / Pricing / Contact)
- [x] Upload image → paste URL into page field → see change
- [x] Contact form sends via Resend when key is set (Settings or `.env`) — not a fake-only toast
- [x] Settings: masked API key, never returned in full; Test email button
- [x] Wrong password rejected
- [x] `/owadmin` not in public SiteNav / footer
- [x] Defaults show when CMS DB is empty / new fields added
- [ ] Contact form delivers to inbox — requires your Resend key + verified domain
- [ ] Mobile visual check after your copy/image edits

## Phase 1 done when

You can run the marketing site day-to-day without a developer for **Home / About / Pricing / Contact**.

## How to verify quickly

1. Login: `mail@orderweb.co.uk` + bootstrap password from `.env`
2. Edit Contact headline → Save → open `/contact`
3. Media → upload → copy URL → paste into About hero image → Save → `/about`
4. Settings → paste Resend key → Save → Send test email
5. Submit the public contact form → check `mail@orderweb.co.uk`
6. Logout → try wrong password → should fail
7. Public nav has no Admin link
