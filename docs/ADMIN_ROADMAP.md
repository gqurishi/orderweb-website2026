# OrderWeb Admin — Full roadmap (Phase by phase)

This is the single map for building and running the admin panel. Detail docs live next to each phase; this file is the order of work.

**Status today:** Phases 0–4 are implemented in this repo. Content still runs from local `.data/cms-db.json` (+ `public/cms-uploads/`). Supabase SQL is ready in `supabase/schema.sql` for when you cut over.

---

## Suggested timeline (realistic)

| Phase | What | Effort feel |
| --- | --- | --- |
| **Phase 0** | Accounts, env, locked decisions | Short setup |
| **Phase 1** | Biggest chunk — foundation + 4 pages + email | Longest |
| **Phase 2** | Solutions pages (POS / Website / Software) | Medium–long (Website demos take longer) |
| **Phase 3** | Draft → publish + safety polish | Medium |
| **Phase 4** | Only what you still miss | Small |

Exact days depend on how custom each page’s sections are (Home / Website demos take longer than Pricing).

---

## Working rules (so it stays easy)

1. **One section = one job** — heading, text, image, CTA (not a kitchen-sink editor).
2. **No free HTML editing in v1** — fields only; layout / fonts / animations stay in code.
3. **Always keep fallback content** — defaults in code so the site never goes blank.
4. **Train with a 1-page guide** — see `docs/HOW_TO_UPDATE_ORDERWEB.md`.
5. **Production admin URL stays private** — `/owadmin`; bookmark it, don’t put it in public nav/footer.

---

## Locked answers (the old “before any build” checklist)

| # | Question | Locked answer |
| --- | --- | --- |
| 1 | Save = live for Phase 1? | **Yes for Phase 1–2 build.** Phase 3 upgraded to **Draft → Preview → Publish** (safer). |
| 2 | Stack? | **Supabase** (schema ready) + **Resend** + **Cloudinary** (images; local `/cms-uploads` works today). Not R2 unless you change later. |
| 3 | Admin email? | Set in `.env` as `VITE_ADMIN_EMAIL` (default target inbox / bootstrap: `mail@orderweb.co.uk`). |
| 4 | Phase 1 pages only? | **Yes** — Home + About + Pricing + Contact. Solutions = Phase 2. |

---

## Who does what

| You | Builder (dev) |
| --- | --- |
| Choose stack / approve plan | Set up DB, storage, admin UI |
| Create Resend + verify domain | Wire contact form + settings |
| Write final copy / provide images | Build page editors |
| Test as a real user | Connect public pages to content |
| Keep admin password safe | Deploy + backups guidance |

---

# Phase 0 — Foundation (accounts + decisions)

**Goal:** Accounts and env ready; nothing public-facing yet.

**Detail:** `docs/ADMIN_PHASE0_SETUP.md`

### Build order

1. Lock decisions (`src/lib/admin/decisions.ts`) — admin URL, stack, pages, scope.
2. You create: Supabase project, Cloudinary account, Resend + verify `orderweb.co.uk`.
3. Copy `.env.example` → `.env` (admin email, bootstrap password, session secret, keys).
4. Scaffold `/owadmin` shell + readiness checklist (no public nav link).
5. Local content store (or Supabase later) + upload folder.

### Done when

You can open `/owadmin`, see setup status, and log in with bootstrap email/password.

---

# Phase 1 — Biggest chunk (foundation UI + 4 pages + email)

**Goal:** Non-developers can update Home / About / Pricing / Contact and receive contact form email — without a developer each week.

**Detail:** `docs/ADMIN_PHASE1.md` · QA: `docs/ADMIN_PHASE1_QA.md` · Guide: `docs/HOW_TO_UPDATE_ORDERWEB.md`

Build **section by section**, not a giant rewrite.

### Step 1.1 — Auth + store

- Email + password login at `/owadmin`
- Session cookie (`ADMIN_SESSION_SECRET`)
- First login creates admin from `VITE_ADMIN_EMAIL` + `ADMIN_BOOTSTRAP_PASSWORD`
- CMS DB shape: pages, media, settings, admins

### Step 1.2 — Media library

- Upload images → `public/cms-uploads/` (Cloudinary later)
- Paste URL into page image fields
- Blank image field → built-in site asset (fallback)

### Step 1.3 — Page editors (one page at a time)

Open `/owadmin` → Pages. **Fields per section**, not one HTML box.

| Page | Sections to edit |
| --- | --- |
| **Home** | Hero (brand, headline, line, CTAs, desktop/mobile images) · Why OrderWeb · Services / Reviews / CTA |
| **About** | Story · Problem cards · Difference / Studio / Mission + CTAs |
| **Pricing** | Hero · Plan (name, price, period, features, CTAs) · Side stats / add-ons / notes |
| **Contact** | Hero · Side card · Shown email/phone/address · Form labels / success message |

### Step 1.4 — Wire public routes

- `/`, `/about`, `/pricing`, `/contact` read CMS
- Merge with **defaults** so missing fields never blank the site

### Step 1.5 — Contact email (Settings)

- Resend API key (masked after save)
- To: `mail@orderweb.co.uk` · From after domain verify
- **Send test email** + real public form delivery

### Step 1.6 — QA + training

- Run `docs/ADMIN_PHASE1_QA.md`
- Hand off `docs/HOW_TO_UPDATE_ORDERWEB.md`

### Phase 1 save behaviour (historical)

Originally **Save = live**. That was fine to ship Phase 1 fast. Phase 3 replaced it with draft/publish for safety — editors still use the same section fields.

### Done when

You can change those four pages and get contact emails without code deploys.

---

# Phase 2 — Solutions pages

**Goal:** Same section-field editing for product pages.

**Detail:** `docs/ADMIN_PHASE2.md` · QA: `docs/ADMIN_PHASE2_QA.md`

| Admin title | URL | Notes |
| --- | --- | --- |
| Restaurant POS | `/restaurant-pos` | Hero, tour, payments, feature map, CTA |
| Website | `/website` | Hero, promise, **demo showcase** (longest), roadmap, CTA |
| Software | `/software` | Hero, web/mobile blocks, process, CTA |

- No separate `/solutions` hub — nav dropdown only.
- Home service cards stay under **Home** (Phase 1).
- Same pattern: editor → save → public page with defaults fallback.
- Editors: `src/components/admin/SolutionsEditors.tsx`

### Done when

All three solutions pages update from admin like Phase 1 pages.

---

# Phase 3 — Draft / publish + safety polish

**Goal:** Safer weekly edits; no accidental blank live site.

**Detail:** `docs/ADMIN_PHASE3.md` · QA: `docs/ADMIN_PHASE3_QA.md`

| Step | What |
| --- | --- |
| 1 | **Save draft** · **Preview** (`?cmsPreview=1`) · **Publish** · **Revert** |
| 2 | Media: alt, folders/tags, replace in place, usage, delete from disk |
| 3 | Users & roles: **Admin** (full) vs **Editor** (content only) |
| 4 | Activity log + dashboard strip |
| 5 | Content helpers + publish validation (hero + SEO required) |
| 6 | Per-page SEO (title, description, share image) |
| 7 | Hardening: login rate limit, strong passwords, `robots.txt` Disallow `/owadmin`, prod session secret |

### Done when

A non-technical teammate can draft → preview → publish without risking a broken live page.

---

# Phase 4 — Only what you still miss

**Goal:** Small extras that help weekly ops. Skip the rest.

**Detail:** `docs/ADMIN_PHASE4.md` · QA: `docs/ADMIN_PHASE4_QA.md`

### Shipped

- Change password — `/owadmin/account`
- Forgot password — email reset (Resend + `SITE_URL`)
- Analytics snippets — Settings (GA4 + custom head HTML, public pages only)

### Skipped (not needed for weekly updates)

- Duplicate page section  
- Schedule publish (“go live Monday 9am”)  
- Multi-language  
- Blog / news  

### Done when

Password change/reset works without a deploy; optional analytics ID can be pasted in Settings.

---

## Admin URLs (bookmark — don’t advertise)

| Path | Who |
| --- | --- |
| `/owadmin` | Login / dashboard |
| `/owadmin/pages/$pageKey` | Page editors |
| `/owadmin/media` | Images |
| `/owadmin/users` | Admin only |
| `/owadmin/activity` | Activity log |
| `/owadmin/settings` | Email + analytics (Admin) |
| `/owadmin/account` | Change password |
| `/owadmin/reset-password` | Email reset landing |

---

## Data & backups

| What | Where |
| --- | --- |
| Content DB (today) | `.data/cms-db.json` |
| Uploads | `public/cms-uploads/` |
| Supabase (later) | `supabase/schema.sql` |

**Daily backup:** copy both the JSON DB and uploads folder. See Phase 4 deploy notes in `docs/ADMIN_PHASE4.md`.

---

## How to build (dev order — if starting fresh)

Do not giant-rewrite. For each page:

1. List sections (one job each) in types/defaults  
2. Add admin fields for that section only  
3. Wire the public component to CMS + defaults  
4. Smoke-test desktop + mobile  
5. Next section / next page  

Phase order: **0 → 1 (Home → About → Pricing → Contact + email) → 2 (POS → Website → Software) → 3 → 4**.
