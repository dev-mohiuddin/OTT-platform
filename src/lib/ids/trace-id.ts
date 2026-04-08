const TRACE_ID_REGEX = /^[a-f0-9]{32}$/;

function randomHex(bytesLength: number): string {
	const bytes = new Uint8Array(bytesLength);

	if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
		crypto.getRandomValues(bytes);
	} else {
		for (let index = 0; index < bytes.length; index += 1) {
			bytes[index] = Math.floor(Math.random() * 256);
		}
	}

	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createTraceId(): string {
	return randomHex(16);
}

export function isTraceId(value: string): boolean {
	return TRACE_ID_REGEX.test(value);
}

export function ensureTraceId(value: string | undefined | null): string {
	if (value && isTraceId(value)) {
		return value;
	}

	return createTraceId();
}
