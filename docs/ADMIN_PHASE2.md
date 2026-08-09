# OrderWeb Admin — Phase 2 (Solutions)

Phase 2 adds the same section-field editing power to the solutions pages (same CMS as Phase 1; save flow is Draft → Publish after Phase 3).

## Pages

| Admin title | Public path | CMS key |
|-------------|-------------|---------|
| Restaurant POS | `/restaurant-pos` | `restaurant-pos` |
| Website | `/website` | `website` |
| Software | `/software` | `software` |

No separate Solutions hub page — Solutions is a nav dropdown only. Home service cards stay under Home (Phase 1).

## Step 1 — Section maps

### Restaurant POS
- Hero copy + image
- Product tour headings
- Payments section (copy, points, CTA)
- Feature map groups + module labels
- Bottom CTA

### Website
- Hero + audience chips + image
- Promise strip
- Demo showcase (section copy, bullets, CTAs, per-demo text/images)
- Roadmap steps
- Final CTA

### Software
- Hero + chips + image
- Web / mobile product blocks
- Process timeline
- Final CTA

## Step 2 — Editors

Same pattern as Phase 1: `/owadmin` → page → section fields → **Save draft → Preview → Publish**.

Editors live in `src/components/admin/SolutionsEditors.tsx`.

## Step 3 — Public wiring

Routes load `getPublicPageFn`. Empty / missing fields fall back to defaults and built-in images.

## Step 4 — Solutions index

None. Skip unless a `/solutions` hub is added later.

## Step 5 — QA

See `docs/ADMIN_PHASE2_QA.md`.

## Data

- Local: `.data/cms-db.json` (new keys merge in automatically)
- Supabase seed keys updated in `supabase/schema.sql`
