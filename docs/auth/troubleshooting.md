# Auth Troubleshooting

## Gmail 535 Invalid Login

Symptom:

- API returns email service unavailable for resend/forgot-password.
- Logs show `Invalid login: 535`.

Fix:

1. Confirm `SMTP_USER` is a full Gmail address.
2. Generate a Gmail App Password and set it as `SMTP_PASS`.
3. Ensure 2-step verification is enabled for the Gmail account.

## Google OAuth Redirect Mismatch

Symptom:

- Google sign-in fails before callback completes.

Fix:

1. Verify `NEXTAUTH_URL` matches your current host and protocol.
2. Ensure Google OAuth redirect URI exactly matches:
   - `http://localhost:3000/api/auth/callback/google`
3. Remove stale URIs with wrong port/protocol.

## Google Button Missing or Disabled

Symptom:

- Sign-in page shows Google unavailable state.

Fix:

1. Set both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
2. Restart dev server after env changes.
3. Check logs to confirm Google provider registration.

## Google Sign-In Without Email

Symptom:

- Google popup succeeds but login is denied.

Fix:

1. Ensure Google account has a verified email.
2. Ensure OAuth scopes include email/profile.
3. Recreate OAuth consent/client if provider configuration is incomplete.

## Missing NextAuth Secret

Symptom:

- NextAuth configuration error on startup.

Fix:

- Set `NEXTAUTH_SECRET` in `.env.local` to a long random value.

## Account Linking Security Warning

Symptom:

- Unexpected link between credential account and Google account.

Fix:

1. Keep `GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING=false` unless explicitly required.
2. If auto-linking is required, apply additional verification in your account settings flow.

## Verification Email Not Delivered During Signup

Symptom:

- Signup succeeds but verification email does not arrive.

Expected behavior:

- Account is created in verification-pending state.
- User can retry via resend code on `/verify-email`.

Fix:

1. Restore SMTP credentials.
2. Retry resend code.
3. Check server logs for email transport errors.
