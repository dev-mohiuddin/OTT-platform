export const API_ERROR_CODES = {
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
	BAD_REQUEST: "BAD_REQUEST",
	VALIDATION_ERROR: "VALIDATION_ERROR",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	NOT_FOUND: "NOT_FOUND",
	CONFLICT: "CONFLICT",
	RATE_LIMITED: "RATE_LIMITED",
	PAYMENT_REQUIRED: "PAYMENT_REQUIRED",
	PAYMENT_PROVIDER_UNAVAILABLE: "PAYMENT_PROVIDER_UNAVAILABLE",
	PAYMENT_VERIFICATION_FAILED: "PAYMENT_VERIFICATION_FAILED",
	SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE",
	INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export const DEFAULT_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
	[API_ERROR_CODES.UNKNOWN_ERROR]: "An unexpected error occurred.",
	[API_ERROR_CODES.BAD_REQUEST]: "The request is invalid.",
	[API_ERROR_CODES.VALIDATION_ERROR]: "One or more fields are invalid.",
	[API_ERROR_CODES.UNAUTHORIZED]: "Authentication is required.",
	[API_ERROR_CODES.FORBIDDEN]: "You do not have permission to access this resource.",
	[API_ERROR_CODES.NOT_FOUND]: "The requested resource was not found.",
	[API_ERROR_CODES.CONFLICT]: "The request conflicts with existing data.",
	[API_ERROR_CODES.RATE_LIMITED]: "Too many requests. Please try again later.",
	[API_ERROR_CODES.PAYMENT_REQUIRED]: "A valid payment is required for this operation.",
	[API_ERROR_CODES.PAYMENT_PROVIDER_UNAVAILABLE]: "Payment provider is unavailable.",
	[API_ERROR_CODES.PAYMENT_VERIFICATION_FAILED]: "Payment verification failed.",
	[API_ERROR_CODES.SUBSCRIPTION_INACTIVE]: "An active subscription is required.",
	[API_ERROR_CODES.INTERNAL_SERVER_ERROR]: "Internal server error.",
};

export function getDefaultErrorMessage(code: ApiErrorCode): string {
	return DEFAULT_ERROR_MESSAGES[code];
}
