import type { ApiSuccessEnvelope } from "@/lib/http/contracts/response-envelope";

export type SuccessResponse<TData = unknown> = ApiSuccessEnvelope<TData>;

export interface SuccessMessagePayload {
	message: string;
}

export type SuccessMessageResponse = SuccessResponse<SuccessMessagePayload>;
