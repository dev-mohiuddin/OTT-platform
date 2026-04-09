# Auth Setup

## Required Environment Variables

Use these values in `.env.local`:

- `DATABASE_URL`
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

## Signup Reliability Behavior

Email sign-up is resilient to temporary SMTP outages:

- User account creation succeeds.
- Email verification code record is created.
- If delivery fails, response includes `emailSent=false` and a warning message.
- User can continue from `/verify-email` and use resend code once email service recovers.
