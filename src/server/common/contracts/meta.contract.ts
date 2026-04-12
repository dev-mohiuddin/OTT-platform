import { API_VERSION } from "@/server/common/constants/api-version";
import type { PaginationMeta } from "@/server/common/contracts/pagination.contract";

export interface ApiMeta {
	requestId: string;
	traceId?: string;
	timestamp: string;
	version: string;
	method?: string;
	path?: string;
	locale?: string;
	country?: string;
	currency?: string;
	pagination?: PaginationMeta;
}

export interface ApiMetaInput {
	requestId: string;
	traceId?: string;
	timestamp?: string;
	version?: string;
	method?: string;
	path?: string;
	locale?: string;
	country?: string;
	currency?: string;
	pagination?: PaginationMeta;
}

export function createApiMeta(input: ApiMetaInput): ApiMeta {
	return {
		requestId: input.requestId,
		traceId: input.traceId,
		timestamp: input.timestamp ?? new Date().toISOString(),
		version: input.version ?? API_VERSION,
		method: input.method,
		path: input.path,
		locale: input.locale,
		country: input.country,
		currency: input.currency,
		pagination: input.pagination,
	};
}
