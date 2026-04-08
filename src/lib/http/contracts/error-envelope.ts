import type { ApiMetaEnvelope, ApiSuccessEnvelope } from "@/lib/http/contracts/response-envelope";

export interface ApiErrorPayload<TDetails = unknown> {
	code: string;
	message: string;
	status: number;
	details?: TDetails;
}

export interface ApiErrorEnvelope<TDetails = unknown> {
	success: false;
	error: ApiErrorPayload<TDetails>;
	meta: ApiMetaEnvelope;
}

export type ApiEnvelope<TData = unknown, TDetails = unknown> =
	| ApiSuccessEnvelope<TData>
	| ApiErrorEnvelope<TDetails>;

export function isApiErrorEnvelope<TDetails = unknown>(
	value: unknown,
): value is ApiErrorEnvelope<TDetails> {
	if (!value || typeof value !== "object") {
		return false;
	}

	const maybeEnvelope = value as Partial<ApiErrorEnvelope<TDetails>>;
	return maybeEnvelope.success === false && Boolean(maybeEnvelope.error) && Boolean(maybeEnvelope.meta);
}
