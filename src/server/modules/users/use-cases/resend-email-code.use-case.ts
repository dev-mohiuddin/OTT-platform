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
import { resendEmailCodeSchema } from "@/server/modules/users/validators/auth.schemas";

export async function resendEmailCodeUseCase(rawInput: { email: string }) {
  const input = resendEmailCodeSchema.parse(rawInput);
  const normalizedEmail = normalizeIdentifier(input.email);

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    return {
      message: "If an account exists, a verification code has been sent.",
    };
  }

  if (user.emailVerified) {
    return {
      message: "Email is already verified.",
    };
  }

  const env = getServerEnv(process.env);
  const code = createNumericAuthCode();
  const codeHash = hashAuthCode(code);
  const expiresAt = new Date(Date.now() + env.AUTH_CODE_EXPIRY_MINUTES * 60 * 1000);

  await deleteAuthCodesForIdentifier(normalizedEmail, AUTH_CODE_PURPOSE.EMAIL_VERIFICATION);
  await createAuthCode({
    identifier: normalizedEmail,
    purpose: AUTH_CODE_PURPOSE.EMAIL_VERIFICATION,
    codeHash,
    expiresAt,
    userId: user.id,
  });

  try {
    await sendAuthCodeEmail({
      to: normalizedEmail,
      code,
      title: "Your new Dristy verification code",
      subtitle: "Use this code to verify your email and activate your account.",
      expiresInMinutes: env.AUTH_CODE_EXPIRY_MINUTES,
    });
  } catch (error) {
    if (isEmailTransportError(error)) {
      throw toEmailServiceAppError(error);
    }

    throw error;
  }

  return {
    message: "A new verification code has been sent.",
  };
}
