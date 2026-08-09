# OrderWeb Admin — Phase 1

Phase 1 is complete when you can run Home / About / Pricing / Contact day-to-day without a developer.

Full roadmap: `docs/ADMIN_ROADMAP.md`. Training guide: `docs/HOW_TO_UPDATE_ORDERWEB.md`.

**Note:** Phase 1 originally used Save = live. After Phase 3, use **Save draft → Preview → Publish**.

## Step 5 — Page editors (section fields)

Open `/owadmin` → Pages. Each page uses section fields (not one big text box).

### Home
- **Hero:** eyebrow/brand, headline, short line, CTA buttons, desktop + mobile hero images
- **Why OrderWeb:** headings, body points, image
- **Services / Reviews / CTA:** section copy + CTA button label

### About
- **Story:** eyebrow, title, paragraphs, illustration image
- **Problem:** titles + card text (hit / title / body)
- **Difference / Studio / Mission:** copy + CTA button labels

### Pricing
- **Hero:** page title / intro / image
- **Plan:** name, price, period, summary, feature bullets, CTAs
- **Side stats / add-ons / notes**

### Contact
- **Hero:** title, body, image
- **Side card:** company blurb, address display text
- **Shown** email / phone / address
- **Form:** submit label, placeholder, success message

## Step 6 — Public site wired to content

- `/`, `/about`, `/pricing`, `/contact` load from the CMS store
- If DB empty or fields missing → hard-coded defaults (site never blank)
- Images: paste Media library URLs (`/cms-uploads/…`); blank → built-in assets

## Step 7 — Contact email (Settings)

- Resend API key stored securely (masked after save; never returned in full)
- **Send form messages to** = `mail@orderweb.co.uk` (editable)
- Optional **From** name/address after domain verified
- **Send test email** button
- Public contact form sends real mail via Resend (not a fake toast)

## Step 8 — QA checklist

See `docs/ADMIN_PHASE1_QA.md`.

## Local login (dev)

From `.env` (gitignored):

- Email: `mail@orderweb.co.uk` (or your `VITE_ADMIN_EMAIL`)
- Password: value of `ADMIN_BOOTSTRAP_PASSWORD`

Open http://localhost:8080/owadmin

## Data

- Local DB file: `.data/cms-db.json`
- Uploads: `public/cms-uploads/`
- Supabase schema (for later): `supabase/schema.sql`

## Email setup

1. Paste Resend API key in **Settings** (or set `RESEND_API_KEY` in `.env`)
2. Verify domain (or use Resend onboarding from-address for tests)
3. Confirm inbox is `mail@orderweb.co.uk`
4. Use **Send test email**, then submit the public contact form
