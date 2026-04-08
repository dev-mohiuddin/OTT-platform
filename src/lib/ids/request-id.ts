const DEFAULT_PREFIX = "req";
const REQUEST_ID_REGEX = /^[a-z0-9]+_[a-z0-9]{8,}$/;

function getRandomHex(length: number): string {
	const bytesLength = Math.ceil(length / 2);
	const bytes = new Uint8Array(bytesLength);

	if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
		crypto.getRandomValues(bytes);
	} else {
		for (let index = 0; index < bytes.length; index += 1) {
			bytes[index] = Math.floor(Math.random() * 256);
		}
	}

	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, length);
}

function sanitizePrefix(prefix: string | undefined): string {
	const normalized = prefix?.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
	if (!normalized) {
		return DEFAULT_PREFIX;
	}

	return normalized;
}

export function createRequestId(prefix: string = DEFAULT_PREFIX): string {
	const safePrefix = sanitizePrefix(prefix);
	const timestamp = Date.now().toString(36);
	const entropy = getRandomHex(10);
	return `${safePrefix}_${timestamp}${entropy}`;
}

export function isRequestId(value: string): boolean {
	return REQUEST_ID_REGEX.test(value);
}

export function ensureRequestId(value: string | undefined | null): string {
	if (value && isRequestId(value)) {
		return value;
	}

	return createRequestId();
}
