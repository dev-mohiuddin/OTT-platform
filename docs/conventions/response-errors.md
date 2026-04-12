# Response and Error Envelope Conventions

This structure is reserved so every API returns a consistent envelope.

## Success Envelope (Target Shape)

```json
{
	"success": true,
	"data": {},
	"meta": {
		"requestId": "...",
		"traceId": "...",
		"method": "POST",
		"path": "/api/v1/auth/sign-up",
		"timestamp": "...",
		"version": "v1"
	}
}
```

## Error Envelope (Target Shape)

```json
{
	"success": false,
	"error": {
		"code": "...",
		"message": "...",
		"details": {}
	},
	"meta": {
		"requestId": "...",
		"traceId": "...",
		"method": "POST",
		"path": "/api/v1/auth/sign-up",
		"timestamp": "...",
		"version": "v1"
	}
}
```

## Structure Locations

- Server contracts: `src/server/common/contracts`
- Server response/error wrappers: `src/server/common/http`
- Shared client contracts: `src/lib/http/contracts`
- Shared error abstractions: `src/lib/http/errors`

## Goal

Keep response and error format identical across all modules, including payment and webhook-related endpoints.

## Frontend Handling Rule

- Page/components should call domain API functions from `src/api/domains/*`.
- Domain APIs should use `API` + `handleRequest` from `src/api/lib/api`.
- Frontend should show server-provided messages (or mapped friendly fallbacks) via inline message or toast.
