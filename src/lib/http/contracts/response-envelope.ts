export interface ApiPaginationMeta {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface ApiMetaEnvelope {
	requestId: string;
	traceId?: string;
	timestamp: string;
	version: string;
	locale?: string;
	country?: string;
	currency?: string;
	pagination?: ApiPaginationMeta;
}

export interface ApiSuccessEnvelope<TData = unknown> {
	success: true;
	data: TData;
	meta: ApiMetaEnvelope;
}

export function isApiSuccessEnvelope<TData = unknown>(
	value: unknown,
): value is ApiSuccessEnvelope<TData> {
	if (!value || typeof value !== "object") {
		return false;
	}

	const maybeEnvelope = value as Partial<ApiSuccessEnvelope<TData>>;
	return maybeEnvelope.success === true && "data" in maybeEnvelope && Boolean(maybeEnvelope.meta);
}
