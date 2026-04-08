import { ensureRequestId } from "@/lib/ids/request-id";

export interface IdempotencyKeyOptions {
	prefix?: string;
	scope?: string;
	requestId?: string;
	subjectId?: string;
	maxLength?: number;
}

function sanitizeSegment(value: string | undefined, fallback: string): string {
	const normalized = value?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
	if (!normalized) {
		return fallback;
	}

	return normalized.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function randomToken(size: number): string {
	const bytes = new Uint8Array(size);

	if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
		crypto.getRandomValues(bytes);
	} else {
		for (let index = 0; index < bytes.length; index += 1) {
			bytes[index] = Math.floor(Math.random() * 256);
		}
	}

	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function truncateIdempotencyKey(key: string, maxLength = 255): string {
	if (key.length <= maxLength) {
		return key;
	}

	return key.slice(0, maxLength);
}

export function createIdempotencyKey(options: IdempotencyKeyOptions = {}): string {
	const prefix = sanitizeSegment(options.prefix, "idem");
	const scope = sanitizeSegment(options.scope, "payment");
	const subjectId = sanitizeSegment(options.subjectId, "global");
	const requestId = sanitizeSegment(ensureRequestId(options.requestId), "request");
	const token = randomToken(6);

	const key = `${prefix}:${scope}:${subjectId}:${requestId}:${token}`;
	return truncateIdempotencyKey(key, options.maxLength ?? 255);
}
