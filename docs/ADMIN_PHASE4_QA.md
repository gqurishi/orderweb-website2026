# Phase 4 — QA checklist

## Account / password

- [ ] Logged-in user opens `/owadmin/account` and changes password successfully
- [ ] Wrong current password is rejected
- [ ] Weak new password is rejected
- [ ] Can sign in with the new password

## Forgot password

- [ ] Login → Forgot password → message says a link was sent (no email enumeration)
- [ ] Email arrives when the account exists and Resend is configured
- [ ] Link opens `/owadmin/reset-password` and accepts a strong password
- [ ] Old password no longer works; new password does
- [ ] Expired / reused token fails cleanly
- [ ] Reset fails with a clear error if Resend is not configured (when account exists)

## Analytics

- [ ] Admin saves GA4 ID in Settings → Analytics
- [ ] Public homepage loads GA script; `/owadmin` does not inject it
- [ ] Clearing GA ID removes the script after refresh
- [ ] Custom head HTML appears on public pages only
- [ ] Editors cannot open Settings (Admin only)

## Ops

- [ ] `SITE_URL` in production matches the live domain
- [ ] Backup copy of `.data/cms-db.json` + `public/cms-uploads/` is documented for the host
