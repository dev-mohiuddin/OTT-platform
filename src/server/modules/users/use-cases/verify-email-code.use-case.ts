import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";
import { AUTH_CODE_PURPOSE } from "@/lib/auth/constants";
import {
  hashAuthCode,
  isAuthCodeExpired,
  normalizeIdentifier,
} from "@/lib/auth/code";
import {
  consumeAuthCode,
  findUserByEmail,
  getLatestAuthCode,
  incrementAuthCodeAttempt,
  markUserEmailVerified,
} from "@/server/modules/users/repositories/user-auth.repository";
import { verifyEmailCodeSchema } from "@/server/modules/users/validators/auth.schemas";
import type { VerifyEmailCodeInput } from "@/server/modules/users/types/auth.types";

const MAX_AUTH_CODE_ATTEMPTS = 5;

export async function verifyEmailCodeUseCase(rawInput: VerifyEmailCodeInput) {
  const input = verifyEmailCodeSchema.parse(rawInput);
  const normalizedEmail = normalizeIdentifier(input.email);

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError("User not found for this email.", {
      code: API_ERROR_CODES.NOT_FOUND,
      expose: true,
    });
  }

  if (user.emailVerified) {
    return {
      verified: true,
      message: "Email is already verified.",
    };
  }

  const authCode = await getLatestAuthCode(normalizedEmail, AUTH_CODE_PURPOSE.EMAIL_VERIFICATION);
  if (!authCode) {
    throw new AppError("Verification code is invalid.", {
      code: API_ERROR_CODES.AUTH_CODE_INVALID,
      expose: true,
    });
  }

  if (authCode.attemptCount >= MAX_AUTH_CODE_ATTEMPTS) {
    throw new AppError("Verification code attempts exceeded. Request a new code.", {
      code: API_ERROR_CODES.AUTH_CODE_INVALID,
      expose: true,
    });
  }

  if (isAuthCodeExpired(authCode.expiresAt)) {
    throw new AppError("Verification code has expired.", {
      code: API_ERROR_CODES.AUTH_CODE_EXPIRED,
      expose: true,
    });
  }

  const codeHash = hashAuthCode(input.code);
  if (codeHash !== authCode.codeHash) {
    await incrementAuthCodeAttempt(authCode.id);
    throw new AppError("Verification code is invalid.", {
      code: API_ERROR_CODES.AUTH_CODE_INVALID,
      expose: true,
    });
  }

  await consumeAuthCode(authCode.id);
  await markUserEmailVerified(user.id);

  return {
    verified: true,
    message: "Email verified successfully.",
  };
}
