export type {
	ApiEnvelope,
	ApiErrorEnvelope,
	ApiErrorPayload,
} from "@/lib/http/contracts/error-envelope";
export type {
	ApiMetaEnvelope,
	ApiPaginationMeta,
	ApiSuccessEnvelope,
} from "@/lib/http/contracts/response-envelope";

export interface ApiListQuery {
	page?: number;
	limit?: number;
	sort?: string;
	order?: "asc" | "desc";
	search?: string;
}
