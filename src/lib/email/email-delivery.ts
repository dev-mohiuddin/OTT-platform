import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";

interface MailErrorLike {
  code?: unknown;
  command?: unknown;
  responseCode?: unknown;
  message?: unknown;
}

function getErrorCode(error: unknown): string {
  const value = (error as MailErrorLike | undefined)?.code;
  return typeof value === "string" ? value.toUpperCase() : "";
}

function getErrorMessage(error: unknown): string {
  const value = (error as MailErrorLike | undefined)?.message;
  return typeof value === "string" ? value.toLowerCase() : "";
}

export function isEmailTransportError(error: unknown): boolean {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);
  const responseCode = (error as MailErrorLike | undefined)?.responseCode;

  if (typeof responseCode === "number" && responseCode >= 400) {
    return true;
  }

  return (
    code === "EAUTH"
    || code === "ECONNECTION"
    || code === "ETIMEDOUT"
    || code === "ENOTFOUND"
    || code === "ESOCKET"
    || message.includes("invalid login")
    || message.includes("badcredentials")
    || message.includes("535")
  );
}

export function toEmailServiceAppError(error: unknown): AppError {
  return new AppError("Email service is temporarily unavailable. Please try again.", {
    code: API_ERROR_CODES.EMAIL_SERVICE_UNAVAILABLE,
    expose: true,
    cause: error,
  });
}
