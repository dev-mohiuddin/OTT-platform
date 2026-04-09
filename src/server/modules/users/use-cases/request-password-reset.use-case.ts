import { getServerEnv } from "@/config/env/server-env";
import { AUTH_CODE_PURPOSE } from "@/lib/auth/constants";
import { createNumericAuthCode, hashAuthCode, normalizeIdentifier } from "@/lib/auth/code";
import { sendAuthCodeEmail } from "@/lib/email/auth-mailer";
import { isEmailTransportError, toEmailServiceAppError } from "@/lib/email/email-delivery";
import {
  createAuthCode,
  deleteAuthCodesForIdentifier,
  findUserByEmail,
} from "@/server/modules/users/repositories/user-auth.repository";
import { forgotPasswordSchema } from "@/server/modules/users/validators/auth.schemas";

export async function requestPasswordResetUseCase(rawInput: { email: string }) {
  const input = forgotPasswordSchema.parse(rawInput);
  const normalizedEmail = normalizeIdentifier(input.email);

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    return {
      message: "If the email exists, a reset code has been sent.",
    };
  }

  const env = getServerEnv(process.env);
  const code = createNumericAuthCode();
  const codeHash = hashAuthCode(code);
  const expiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_CODE_EXPIRY_MINUTES * 60 * 1000,
  );

  await deleteAuthCodesForIdentifier(normalizedEmail, AUTH_CODE_PURPOSE.PASSWORD_RESET);
  await createAuthCode({
    identifier: normalizedEmail,
    purpose: AUTH_CODE_PURPOSE.PASSWORD_RESET,
    codeHash,
    expiresAt,
    userId: user.id,
  });

  try {
    await sendAuthCodeEmail({
      to: normalizedEmail,
      code,
      title: "Reset your Dristy password",
      subtitle: "Use this one-time code to set a new password.",
      expiresInMinutes: env.PASSWORD_RESET_CODE_EXPIRY_MINUTES,
    });
  } catch (error) {
    if (isEmailTransportError(error)) {
      throw toEmailServiceAppError(error);
    }

    throw error;
  }

  return {
    message: "If the email exists, a reset code has been sent.",
  };
}
