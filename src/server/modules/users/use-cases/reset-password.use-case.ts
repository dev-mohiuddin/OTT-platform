import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";
import { AUTH_CODE_PURPOSE } from "@/lib/auth/constants";
import {
  hashAuthCode,
  isAuthCodeExpired,
  normalizeIdentifier,
} from "@/lib/auth/code";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import {
  consumeAuthCode,
  findUserByEmail,
  getLatestAuthCode,
  incrementAuthCodeAttempt,
  updateUserPassword,
} from "@/server/modules/users/repositories/user-auth.repository";
import { resetPasswordSchema } from "@/server/modules/users/validators/auth.schemas";

const MAX_AUTH_CODE_ATTEMPTS = 5;

export async function resetPasswordUseCase(rawInput: {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const input = resetPasswordSchema.parse(rawInput);
  const normalizedEmail = normalizeIdentifier(input.email);

  const passwordStrength = validatePasswordStrength(input.newPassword);
  if (!passwordStrength.isValid) {
    throw new AppError("Password does not meet security requirements.", {
      code: API_ERROR_CODES.VALIDATION_ERROR,
      expose: true,
      details: {
        password: passwordStrength.errors,
      },
    });
  }

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError("Invalid password reset request.", {
      code: API_ERROR_CODES.AUTH_CODE_INVALID,
      expose: true,
    });
  }

  const authCode = await getLatestAuthCode(normalizedEmail, AUTH_CODE_PURPOSE.PASSWORD_RESET);
  if (!authCode) {
    throw new AppError("Reset code is invalid.", {
      code: API_ERROR_CODES.AUTH_CODE_INVALID,
      expose: true,
    });
  }

  if (authCode.attemptCount >= MAX_AUTH_CODE_ATTEMPTS) {
    throw new AppError("Reset code attempts exceeded. Request a new code.", {
      code: API_ERROR_CODES.AUTH_CODE_INVALID,
      expose: true,
    });
  }

  if (isAuthCodeExpired(authCode.expiresAt)) {
    throw new AppError("Reset code has expired.", {
      code: API_ERROR_CODES.AUTH_CODE_EXPIRED,
      expose: true,
    });
  }

  const submittedCodeHash = hashAuthCode(input.code);
  if (submittedCodeHash !== authCode.codeHash) {
    await incrementAuthCodeAttempt(authCode.id);
    throw new AppError("Reset code is invalid.", {
      code: API_ERROR_CODES.AUTH_CODE_INVALID,
      expose: true,
    });
  }

  const passwordHash = await hashPassword(input.newPassword);
  await updateUserPassword(user.id, passwordHash);
  await consumeAuthCode(authCode.id);

  return {
    message: "Password reset successful. You can now sign in.",
  };
}
