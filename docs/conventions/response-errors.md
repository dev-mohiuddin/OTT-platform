# Response and Error Envelope Conventions

This structure is reserved so every API returns a consistent envelope.

## Success Envelope (Target Shape)

```json
{
	"success": true,
	"data": {},
	"meta": {
		"requestId": "...",
		"timestamp": "..."
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
		"timestamp": "..."
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
