# REST Contract Conventions (v1)

This file documents the structure-level contract conventions for mobile-facing REST APIs.

## Base Namespace

- `/api/v1/*` is the only public API namespace for now.
- Future breaking changes should use `/api/v2/*`.

## Resource Groups

- `/api/v1/content`
- `/api/v1/users`
- `/api/v1/watchlist`
- `/api/v1/playback`
- `/api/v1/search`
- `/api/v1/recommendations`
- `/api/v1/subscriptions`
- `/api/v1/payments`
- `/api/v1/webhooks`
- `/api/v1/admin`
- `/api/v1/health`

## Route Handler Placement

- Next.js route handlers live only in `src/app/api/v1/**/route.ts`.
- Business orchestration belongs to `src/server/modules/**/use-cases`.
- Data access belongs to `src/server/modules/**/repositories`.

## Stability Rules

- Keep URL paths stable for mobile clients.
- Evolve payloads by additive fields when possible.
- Avoid moving resources across namespaces once public.
