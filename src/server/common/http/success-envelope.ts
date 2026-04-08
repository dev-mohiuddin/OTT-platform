import type { ApiSuccessResponse } from "@/server/common/contracts/api-response.contract";
import { createApiMeta, type ApiMetaInput } from "@/server/common/contracts/meta.contract";

export interface SuccessEnvelopeOptions extends Omit<ApiMetaInput, "version"> {
	version?: string;
}

export function createSuccessEnvelope<TData>(
	data: TData,
	options: SuccessEnvelopeOptions,
): ApiSuccessResponse<TData> {
	return {
		success: true,
		data,
		meta: createApiMeta(options),
	};
}
