# OrderWeb Admin — Phase 0 setup checklist

Locked decisions: `src/lib/admin/decisions.ts`, `AGENTS.md`.  
Full phase map: `docs/ADMIN_ROADMAP.md`.

## Locked decisions

| Decision | Choice |
|---|---|
| Admin URL | `/owadmin` (not in public nav) |
| Login | Email + password |
| Save behaviour | Phase 1–2 shipped as live save; **Phase 3+ = Draft → Preview → Publish** |
| Scope | Words, images, links, prices, SEO, contact email, analytics — not layout/fonts/animations/code |
| Database | **Supabase** (Postgres) — schema in `supabase/schema.sql`; local driver today: `.data/cms-db.json` |
| Images | **Cloudinary** (planned) + local `public/cms-uploads/` working now |
| Email | **Resend** → `mail@orderweb.co.uk` |
| Phase 1 pages | Home, About, Pricing, Contact only |
| Phase 2 pages | Restaurant POS, Website, Software |
| Backup | Daily copy of `.data/cms-db.json` + `public/cms-uploads/` (and Supabase/Cloudinary when live) |

## Working rules

1. One section = one job  
2. No free HTML editing in v1  
3. Always keep fallback content  
4. Training guide: `docs/HOW_TO_UPDATE_ORDERWEB.md`  
5. Keep `/owadmin` private — bookmark, don’t advertise  

## Accounts you create (in this order)

### 1) Supabase
1. Go to [supabase.com](https://supabase.com) → New project (name: `orderweb-website`)
2. Region: closest to UK visitors (e.g. London / EU West)
3. Save the database password somewhere safe
4. Project Settings → API → copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose in browser)
5. When cutting over from local JSON, run `supabase/schema.sql`

### 2) Cloudinary
1. Go to [cloudinary.com](https://cloudinary.com) → free account
2. Dashboard → copy **Cloud name** → `VITE_CLOUDINARY_CLOUD_NAME`
3. Settings → API Keys → copy API Key + API Secret → `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`  
   *(Until wired, Media library uploads go to `public/cms-uploads/`.)*

### 3) Resend
1. Go to [resend.com](https://resend.com) → account
2. Domains → add `orderweb.co.uk` → add the DNS records they show
3. Wait until domain is verified
4. API Keys → create key → `RESEND_API_KEY` (or paste in Admin → Settings)
5. Confirm inbox: `CONTACT_TO_EMAIL=mail@orderweb.co.uk`
6. From address after verify: e.g. `OrderWeb Website <noreply@orderweb.co.uk>`

### 4) Local env file
1. Copy `.env.example` → `.env`
2. Paste all keys
3. Set `VITE_ADMIN_EMAIL` to your real admin login email
4. Set a strong `ADMIN_BOOTSTRAP_PASSWORD` (10+ chars, letter + number; used once to create the first admin)
5. Set `ADMIN_SESSION_SECRET` (32+ random chars)
6. Set `SITE_URL` to your live origin (needed for password-reset emails)
7. Restart `npm run dev`
8. Open [http://localhost:8080/owadmin](http://localhost:8080/owadmin)

## Backup rule

- **Today:** copy `.data/cms-db.json` + `public/cms-uploads/` daily  
- **Later with Supabase/Cloudinary:** export DB + keep media; restore from those if overwritten  

## Confirmed before Phase 1 (locked)

1. Save for early Phase 1 = live → later upgraded to draft/publish in Phase 3  
2. Stack = Supabase + Resend + Cloudinary  
3. Admin email = `VITE_ADMIN_EMAIL` (typically `mail@orderweb.co.uk`)  
4. Phase 1 pages = Home + About + Pricing + Contact only  

Next after Phase 0: **Phase 1** — see `docs/ADMIN_ROADMAP.md` and `docs/ADMIN_PHASE1.md`.
