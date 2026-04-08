import type { HttpStatusCode } from "@/server/common/constants/http-status";
import type { ApiMeta } from "@/server/common/contracts/meta.contract";
import type { ApiErrorCode } from "@/server/common/errors/error-codes";

export interface ApiErrorShape<TDetails = unknown> {
	code: ApiErrorCode;
	message: string;
	status: HttpStatusCode;
	details?: TDetails;
}

export interface ApiErrorResponse<TDetails = unknown> {
	success: false;
	error: ApiErrorShape<TDetails>;
	meta: ApiMeta;
}
