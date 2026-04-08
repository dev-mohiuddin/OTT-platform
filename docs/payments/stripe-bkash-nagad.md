# Multi-Provider Payment Structure

This scaffold supports three payment providers at structure level:

- Stripe
- bKash
- Nagad

## Provider-Agnostic Core

- `src/server/modules/payments/core`
- `src/server/modules/payments/transactions`
- `src/server/modules/payments/retries`
- `src/server/modules/payments/idempotency`
- `src/server/modules/payments/reconciliation`
- `src/server/modules/payments/webhooks`

## Provider Adapter Locations

- `src/server/modules/payments/adapters/stripe`
- `src/server/modules/payments/adapters/bkash`
- `src/server/modules/payments/adapters/nagad`

## API Namespaces

- `/api/v1/payments/methods`
- `/api/v1/payments/transactions`
- `/api/v1/payments/refunds`
- `/api/v1/payments/retry`

## Webhook Namespaces

- `/api/v1/webhooks/stripe`
- `/api/v1/webhooks/bkash`
- `/api/v1/webhooks/nagad`

## Entitlement Boundary

- Subscription access checks are separated under `src/server/modules/entitlements`.
- Payment provider logic stays inside `src/server/modules/payments`.
