import { ClientHttpError } from "@/lib/http/errors/client-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

const FRIENDLY_ERROR_MESSAGES: Partial<Record<string, string>> = {
  [API_ERROR_CODES.UNAUTHORIZED]: "Your session has expired. Please sign in again.",
  [API_ERROR_CODES.FORBIDDEN]: "You do not have permission to perform this action.",
  [API_ERROR_CODES.RATE_LIMITED]: "Too many requests. Please try again shortly.",
  [API_ERROR_CODES.AUTH_INVALID_CREDENTIALS]: "Invalid credentials. Please check and try again.",
  [API_ERROR_CODES.AUTH_ACCOUNT_NOT_VERIFIED]: "Please verify your account before signing in.",
  [API_ERROR_CODES.AUTH_CODE_INVALID]: "The provided code is invalid.",
  [API_ERROR_CODES.AUTH_CODE_EXPIRED]: "The code has expired. Request a new one.",
  [API_ERROR_CODES.EMAIL_SERVICE_UNAVAILABLE]: "Email service is temporarily unavailable.",
  [API_ERROR_CODES.EMAIL_DELIVERY_FAILED]: "Unable to deliver email right now. Please retry.",
  [API_ERROR_CODES.VALIDATION_ERROR]: "Please check the form fields and try again.",
};

function messageFromStatus(statusCode: number): string | undefined {
  if (statusCode >= 500) {
    return "Server error occurred. Please try again later.";
  }

  if (statusCode === 0) {
    return "Network error. Check your internet connection.";
  }

  if (statusCode === 408) {
    return "Request timed out. Please try again.";
  }

  return undefined;
}

export function resolveRequestErrorMessage(
  error: unknown,
  fallbackMessage: string = FALLBACK_ERROR_MESSAGE,
): string {
  if (error instanceof ClientHttpError) {
    return (
      FRIENDLY_ERROR_MESSAGES[error.code]
      ?? error.message
      ?? messageFromStatus(error.statusCode)
      ?? fallbackMessage
    );
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}
