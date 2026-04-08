import type { ApiErrorEnvelope } from "@/lib/http/contracts/error-envelope";

export type ErrorResponse<TDetails = unknown> = ApiErrorEnvelope<TDetails>;
