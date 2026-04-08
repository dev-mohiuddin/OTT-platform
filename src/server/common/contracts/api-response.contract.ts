import type { ApiErrorResponse } from "@/server/common/contracts/api-error.contract";
import type { ApiMeta } from "@/server/common/contracts/meta.contract";

export interface ApiSuccessResponse<TData = unknown> {
	success: true;
	data: TData;
	meta: ApiMeta;
}

export type ApiResponse<TData = unknown, TErrorDetails = unknown> =
	| ApiSuccessResponse<TData>
	| ApiErrorResponse<TErrorDetails>;
