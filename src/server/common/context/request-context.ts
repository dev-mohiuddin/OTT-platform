import { ensureRequestId } from "@/lib/ids/request-id";
import { ensureTraceId } from "@/lib/ids/trace-id";
import {
	type LocaleResolutionDefaults,
	resolveLocaleFromRequest,
} from "@/lib/i18n/locale";

export const REQUEST_ID_HEADER = "x-request-id";
export const TRACE_ID_HEADER = "x-trace-id";

export interface RequestContext {
	requestId: string;
	traceId: string;
	method: string;
	path: string;
	timestamp: string;
	ipAddress?: string;
	userAgent?: string;
	locale: string;
	country: string;
	currency: string;
	timeZone: string;
}

export interface CreateRequestContextOptions {
	requestId?: string;
	traceId?: string;
	now?: Date;
	localeDefaults?: LocaleResolutionDefaults;
}

function parseIpAddress(request: Request): string | undefined {
	const forwardedFor = request.headers.get("x-forwarded-for");

	if (forwardedFor) {
		const [firstIp] = forwardedFor.split(",").map((value) => value.trim());
		if (firstIp) {
			return firstIp;
		}
	}

	const realIp = request.headers.get("x-real-ip");
	return realIp || undefined;
}

export function createRequestContext(
	request: Request,
	options: CreateRequestContextOptions = {},
): RequestContext {
	const requestIdHeader = request.headers.get(REQUEST_ID_HEADER);
	const traceIdHeader = request.headers.get(TRACE_ID_HEADER);
	const locale = resolveLocaleFromRequest(request, options.localeDefaults);

	return {
		requestId: ensureRequestId(options.requestId ?? requestIdHeader),
		traceId: ensureTraceId(options.traceId ?? traceIdHeader),
		method: request.method.toUpperCase(),
		path: new URL(request.url).pathname,
		timestamp: (options.now ?? new Date()).toISOString(),
		ipAddress: parseIpAddress(request),
		userAgent: request.headers.get("user-agent") ?? undefined,
		locale: locale.locale,
		country: locale.countryCode,
		currency: locale.currency,
		timeZone: locale.timeZone,
	};
}
