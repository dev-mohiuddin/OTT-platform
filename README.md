# Dristy OTT Platform

Modern OTT platform built with Next.js 16, NextAuth, Prisma 7, PostgreSQL, and a custom RBAC-based admin panel.

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL running locally

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

- `DATABASE_URL`
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

4. Ensure the database in `DATABASE_URL` exists.

- If you use `psql`, run `createdb -U postgres ott_platform`.
- If you use pgAdmin or another GUI client, create database `ott_platform` manually.

5. Generate Prisma client, run migration, then seed baseline auth data.

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
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
- PostgreSQL server is running
- Prisma migration has been applied (`npm run prisma:migrate -- --name init`)

### `/sign-in?error=OAuthAccountNotLinked`

This happens when a credential account already exists with the same email and automatic OAuth linking is disabled.

- Set `GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING=true` in `.env.local` if you want auto-linking for same-email users.
- Restart dev server after changing env values.

### Prisma AdapterError about missing database or tables

This means local DB bootstrap is incomplete.

Run:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
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

- Prisma 7 in this repository is configured through `prisma.config.ts`.
- Seed command is configured in `prisma.config.ts` under `migrations.seed`.
