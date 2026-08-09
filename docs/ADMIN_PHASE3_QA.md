# Phase 3 QA checklist

- [ ] Save draft does **not** change the public page until Publish
- [ ] Preview draft (`?cmsPreview=1`) shows draft while logged in
- [ ] Publish makes draft live
- [ ] Revert restores last published
- [ ] Publish blocked if hero headline or SEO title/description empty
- [ ] Media: alt text saves; usage list shows; replace updates image without breaking layout
- [ ] Create Editor user → cannot open Settings / Users
- [ ] Activity log shows publish / login events
- [ ] Wrong password rate-limits after repeated failures
- [ ] `/owadmin` not in robots Allow; page has noindex
- [ ] Desktop + mobile still look good after edits

## Quick verify

1. Edit Home hero → Save draft → open `/` (should be old) → Preview draft (new)
2. Publish → `/` shows new copy
3. Change again → Revert → draft matches published
4. Media → set alt → Replace file → page still loads image
5. Users → add editor → login as editor → Settings hidden
