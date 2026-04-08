import { ZodError } from "zod";

import { HTTP_STATUS, type HttpStatusCode } from "@/server/common/constants/http-status";
import {
	API_ERROR_CODES,
	getDefaultErrorMessage,
	type ApiErrorCode,
} from "@/server/common/errors/error-codes";

const STATUS_BY_ERROR_CODE: Partial<Record<ApiErrorCode, HttpStatusCode>> = {
	[API_ERROR_CODES.BAD_REQUEST]: HTTP_STATUS.BAD_REQUEST,
	[API_ERROR_CODES.VALIDATION_ERROR]: HTTP_STATUS.UNPROCESSABLE_ENTITY,
	[API_ERROR_CODES.UNAUTHORIZED]: HTTP_STATUS.UNAUTHORIZED,
	[API_ERROR_CODES.FORBIDDEN]: HTTP_STATUS.FORBIDDEN,
	[API_ERROR_CODES.NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
	[API_ERROR_CODES.CONFLICT]: HTTP_STATUS.CONFLICT,
	[API_ERROR_CODES.RATE_LIMITED]: HTTP_STATUS.TOO_MANY_REQUESTS,
	[API_ERROR_CODES.PAYMENT_REQUIRED]: HTTP_STATUS.PAYMENT_REQUIRED,
	[API_ERROR_CODES.PAYMENT_PROVIDER_UNAVAILABLE]: HTTP_STATUS.SERVICE_UNAVAILABLE,
	[API_ERROR_CODES.PAYMENT_VERIFICATION_FAILED]: HTTP_STATUS.BAD_REQUEST,
	[API_ERROR_CODES.SUBSCRIPTION_INACTIVE]: HTTP_STATUS.FORBIDDEN,
	[API_ERROR_CODES.INTERNAL_SERVER_ERROR]: HTTP_STATUS.INTERNAL_SERVER_ERROR,
	[API_ERROR_CODES.UNKNOWN_ERROR]: HTTP_STATUS.INTERNAL_SERVER_ERROR,
};

export interface AppErrorOptions<TDetails = unknown> {
	code?: ApiErrorCode;
	statusCode?: HttpStatusCode;
	details?: TDetails;
	expose?: boolean;
	cause?: unknown;
}

export class AppError<TDetails = unknown> extends Error {
	readonly code: ApiErrorCode;
	readonly statusCode: HttpStatusCode;
	readonly details?: TDetails;
	readonly expose: boolean;
	readonly cause?: unknown;

	constructor(message: string, options: AppErrorOptions<TDetails> = {}) {
		super(message);
		this.name = "AppError";

		this.code = options.code ?? API_ERROR_CODES.UNKNOWN_ERROR;
		this.statusCode = options.statusCode ?? resolveStatusCode(this.code);
		this.details = options.details;
		this.expose = options.expose ?? this.statusCode < HTTP_STATUS.INTERNAL_SERVER_ERROR;
		this.cause = options.cause;
	}

	toJSON() {
		return {
			name: this.name,
			code: this.code,
			statusCode: this.statusCode,
			message: this.message,
			details: this.details,
		};
	}
}

export function resolveStatusCode(
	code: ApiErrorCode,
	fallback: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
): HttpStatusCode {
	return STATUS_BY_ERROR_CODE[code] ?? fallback;
}

export function isAppError(value: unknown): value is AppError {
	return value instanceof AppError;
}

export function createAppErrorFromUnknown(error: unknown): AppError {
	if (isAppError(error)) {
		return error;
	}

	if (error instanceof ZodError) {
		return new AppError(getDefaultErrorMessage(API_ERROR_CODES.VALIDATION_ERROR), {
			code: API_ERROR_CODES.VALIDATION_ERROR,
			statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
			details: error.flatten(),
			expose: true,
			cause: error,
		});
	}

	if (error instanceof Error) {
		return new AppError(getDefaultErrorMessage(API_ERROR_CODES.INTERNAL_SERVER_ERROR), {
			code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
			statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			details: {
				originalMessage: error.message,
			},
			expose: false,
			cause: error,
		});
	}

	return new AppError(getDefaultErrorMessage(API_ERROR_CODES.UNKNOWN_ERROR), {
		code: API_ERROR_CODES.UNKNOWN_ERROR,
		statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
		details: {
			originalError: error,
		},
		expose: false,
	});
}
