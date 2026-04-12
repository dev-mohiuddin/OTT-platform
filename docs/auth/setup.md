# Auth Setup

## Required Environment Variables

Use these values in `.env.local`:

- `MONGODB_URI`
- `MONGODB_DB_NAME` (optional)
- `REDIS_URL`
- `REDIS_ENABLED`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### SMTP Notes

- `SMTP_SECURE` must be the string `"true"` or `"false"`.
- For Gmail SMTP, use App Password instead of your Gmail account password.
- Typical Gmail values:
  - `SMTP_HOST="smtp.gmail.com"`
  - `SMTP_PORT="465"`
  - `SMTP_SECURE="true"`

## Google OAuth Setup

In Google Cloud Console, configure an OAuth client with the exact redirect URI:

- `http://localhost:3000/api/auth/callback/google`

For production, add your production domain callback URI exactly as used by `NEXTAUTH_URL`.

### NEXTAUTH_URL Rules

- Use origin-only format, for example: `http://localhost:3000`.
- Do not include path, query, or hash.
- In production, use `https://`.

### Callback URL Checklist

For each environment, callback URI must match exactly with `NEXTAUTH_URL`:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-domain.com/api/auth/callback/google`

Any protocol, port, or domain mismatch will cause Google OAuth redirect failure.

### Account Linking Safety

- `GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING` defaults to `false`.
- Keep it `false` unless you intentionally want same-email credential accounts to auto-link with Google.
- Auto-linking increases account takeover risk when email access is compromised.

## Signup Reliability Behavior

Email sign-up is resilient to temporary SMTP outages:

- User account creation succeeds.
- Email verification code record is created.
- If delivery fails, response includes `emailSent=false` and a warning message.
- User can continue from `/verify-email` and use resend code once email service recovers.
