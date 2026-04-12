# OTT Folder Map (Structure Only)

This project is scaffolded as a large-scale Next.js full-stack OTT foundation.
Only structure is prepared now. Business logic can be added later module by module.

## Core Layers

- `src/app`: App Router pages and REST API route namespaces.
- `src/features`: Frontend feature modules grouped by domain.
- `src/components/ui`: Shadcn-generated base UI primitives (CLI generated only).
- `src/components/ott`: OTT-specific composed component locations.
- `src/server/common`: Shared backend contracts and cross-cutting concerns.
- `src/server/modules`: Domain-wise backend modules (use-cases/repositories/etc).
- `src/lib`: Shared app/runtime utilities and provider-independent helpers.
- `src/api`: Reusable API runtime and domain-based frontend API modules.
- `src/store`: Redux store setup, domain slices, selectors, and middleware scaffolding.
- `src/providers`: App-level providers (auth, redux, theme, query).
- `src/styles`: Global tokens, gradients, themes, and animation variable files.
- `src/lib/db`: MongoDB client, collection typing, and data access primitives.
- `src/lib/redis`: Redis client and cache/rate-limit primitives.
- `scripts`: Project automation scripts, including Mongo seed bootstrap.
- `tests`: Unit, integration, contract, and e2e test folders.
- `docs`: Architecture, API, payment, and convention docs.

## REST Versioning

- Mobile-consumable APIs are grouped under `src/app/api/v1`.
- Resource-based path groups are prepared for content, users, playback, subscriptions, payments, webhooks, and admin.

## Backend Module Pattern

Each domain module under `src/server/modules/*` follows the same structure:

- `use-cases`
- `repositories`
- `validators`
- `mappers`
- `types`

This keeps route handlers thin and maintenance-friendly at scale.

## Frontend Domain API Pattern

Frontend API calls are grouped by domain under `src/api/domains/*`.

- `src/api/lib`: shared request runtime (`API`, `handleRequest`, server API client creation).
- `src/api/domains/auth`: auth-related API functions and client auth wrappers.
- `src/api/domains/admin`: admin-related API functions.

This avoids direct endpoint calls inside page components and keeps imports predictable.
