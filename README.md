# Dristy OTT Platform

Modern OTT platform built with Next.js 16, NextAuth, MongoDB, Redis, and a custom RBAC-based admin panel.

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB running locally
- Redis running locally

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create local environment file.

```bash
copy .env.example .env.local
```

3. Fill required values in `.env.local`.

- `MONGODB_URI`
- `MONGODB_DB_NAME` (optional if URI already contains DB name)
- `REDIS_URL`
- `REDIS_ENABLED`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUTH_TRUST_HOST` (recommended `true` for local proxy/tunnel setups)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING` (set `true` if same-email credential accounts should link with Google)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (must be a plain email string)

For Gmail SMTP, `SMTP_PASS` must be an App Password.

4. Ensure MongoDB and Redis are running and reachable from `.env.local`.

- Typical local values:
	- `MONGODB_URI="mongodb://localhost:27017/ott_platform"`
	- `REDIS_URL="redis://localhost:6379"`

5. Seed baseline auth and RBAC data.

```bash
npm run db:seed
```

6. Start the app.

```bash
npm run dev
```

Open http://localhost:3000

## Common Commands

```bash
npm run lint
npm run build
npm run test
```

## Auth and OAuth Troubleshooting

### `/api/auth/error?error=Configuration`

Check all of these:

- `NEXTAUTH_URL` is exactly `http://localhost:3000` in local dev
- `NEXTAUTH_SECRET` is present and non-empty in `.env.local`
- `AUTH_TRUST_HOST` is set to `true` if you use proxy/tunnel based local access
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are valid
- MongoDB server is running and reachable from `MONGODB_URI`
- Redis server is running and reachable from `REDIS_URL`

### `/sign-in?error=OAuthAccountNotLinked`

This happens when a credential account already exists with the same email and automatic OAuth linking is disabled.

- Set `GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING=true` in `.env.local` if you want auto-linking for same-email users.
- Restart dev server after changing env values.

### Mongo adapter/database configuration issues

This usually means local datastore bootstrap is incomplete.

Run:

```bash
npm run db:seed
```

### `SMTP_FROM` zod validation error

Use plain email format, for example:

```env
SMTP_FROM="no-reply@example.com"
```

Do not use display-name format unless the env schema is updated to allow it.

### Signup succeeds but verification mail is delayed

Email sign-up now remains successful when SMTP has temporary transport issues.

- User is created in verification-pending state.
- Verification code can be resent from `/verify-email`.
- Check server logs for SMTP transport errors and fix credentials.

## Auth Docs

- `docs/auth/setup.md`
- `docs/auth/troubleshooting.md`

## Notes

- Authentication and RBAC persistence are backed by MongoDB collections.
- Rate limiting and access snapshot caching are backed by Redis.
