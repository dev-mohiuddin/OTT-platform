import type { ApiErrorEnvelope } from "@/lib/http/contracts/error-envelope";

export interface ClientHttpErrorOptions<TDetails = unknown> {
	code: string;
	statusCode: number;
	details?: TDetails;
	requestId?: string;
	traceId?: string;
	cause?: unknown;
}

export class ClientHttpError<TDetails = unknown> extends Error {
	readonly code: string;
	readonly statusCode: number;
	readonly details?: TDetails;
	readonly requestId?: string;
	readonly traceId?: string;
	readonly cause?: unknown;

	constructor(message: string, options: ClientHttpErrorOptions<TDetails>) {
		super(message);
		this.name = "ClientHttpError";
		this.code = options.code;
		this.statusCode = options.statusCode;
		this.details = options.details;
		this.requestId = options.requestId;
		this.traceId = options.traceId;
		this.cause = options.cause;
	}
}

export function createClientHttpErrorFromEnvelope<TDetails = unknown>(
	envelope: ApiErrorEnvelope<TDetails>,
): ClientHttpError<TDetails> {
	return new ClientHttpError(envelope.error.message, {
		code: envelope.error.code,
		statusCode: envelope.error.status,
		details: envelope.error.details,
		requestId: envelope.meta.requestId,
		traceId: envelope.meta.traceId,
	});
}
