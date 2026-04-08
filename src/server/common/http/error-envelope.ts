import type { ApiErrorResponse } from "@/server/common/contracts/api-error.contract";
import { createApiMeta, type ApiMetaInput } from "@/server/common/contracts/meta.contract";
import { createAppErrorFromUnknown } from "@/server/common/errors/app-error";

export interface ErrorEnvelopeOptions extends Omit<ApiMetaInput, "version"> {
	version?: string;
}

export function createErrorEnvelope(
	error: unknown,
	options: ErrorEnvelopeOptions,
): ApiErrorResponse {
	const appError = createAppErrorFromUnknown(error);

	return {
		success: false,
		error: {
			code: appError.code,
			message: appError.expose ? appError.message : "Internal server error.",
			status: appError.statusCode,
			...(appError.expose && appError.details !== undefined
				? {
						details: appError.details,
					}
				: {}),
		},
		meta: createApiMeta(options),
	};
}
