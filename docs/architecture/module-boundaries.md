# Module Boundaries

## API Boundary

- `src/app/api/v1/*` route handlers stay thin.
- Route handlers only parse request payload and call domain use-cases.
- All handlers must use `withApiHandler` so response envelopes are consistent.

## Backend Domain Boundary

- `src/server/modules/*` contains business logic by domain.
- Pattern per domain:
	- `use-cases`
	- `repositories`
	- `validators`
	- `mappers`
	- `types`

## Frontend API Boundary

- `src/api/lib/*` contains reusable request runtime and shared request helpers.
- `src/api/domains/*` contains domain-wise API functions only.
- Pages/components should call domain API functions, not direct endpoint strings.

## State Boundary

- `src/store/slices/*` keeps redux state domain-wise.
- Each domain slice keeps:
	- `<domain>.slice.ts`
	- `<domain>.thunks.ts`
	- `<domain>.selectors.ts`
- UI components should use store hooks/selectors and domain APIs, not mixed inline logic.

## Provider Boundary

- `src/providers/auth` handles NextAuth session provider.
- `src/providers/redux` handles redux provider.
- `src/providers/theme` handles theme provider.
- Global providers are composed in `src/app/layout.tsx`.
