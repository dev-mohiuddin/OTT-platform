import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";
import { getServerEnv } from "@/config/env/server-env";
import {
  AUTH_CODE_PURPOSE,
  SYSTEM_ROLE,
} from "@/lib/auth/constants";
import {
  createNumericAuthCode,
  hashAuthCode,
  maskEmail,
  normalizeIdentifier,
} from "@/lib/auth/code";
import { validatePasswordStrength, hashPassword } from "@/lib/auth/password";
import { sendAuthCodeEmail } from "@/lib/email/auth-mailer";
import { isEmailTransportError } from "@/lib/email/email-delivery";
import {
  assignRoleToUserBySlug,
  createAuthCode,
  createUserWithPassword,
  deleteAuthCodesForIdentifier,
  findUserByEmail,
  findUserByPhone,
} from "@/server/modules/users/repositories/user-auth.repository";
import { signUpSchema } from "@/server/modules/users/validators/auth.schemas";
import type { SignUpInput, SignUpResult } from "@/server/modules/users/types/auth.types";

export async function registerUserUseCase(rawInput: SignUpInput): Promise<SignUpResult> {
  const input = signUpSchema.parse(rawInput);
  const passwordStrength = validatePasswordStrength(input.password);

  if (!passwordStrength.isValid) {
    throw new AppError("Password does not meet security requirements.", {
      code: API_ERROR_CODES.VALIDATION_ERROR,
      details: {
        password: passwordStrength.errors,
      },
      expose: true,
    });
  }

  if (input.method === "email") {
    const normalizedEmail = normalizeIdentifier(input.email!);
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new AppError("An account already exists with this email.", {
        code: API_ERROR_CODES.CONFLICT,
        expose: true,
      });
    }

    const passwordHash = await hashPassword(input.password);
    const user = await createUserWithPassword({
      fullName: input.fullName,
      email: normalizedEmail,
      passwordHash,
    });

    await assignRoleToUserBySlug(user.id, SYSTEM_ROLE.USER);

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

    let emailSent = true;

    try {
      await sendAuthCodeEmail({
        to: normalizedEmail,
        code,
        title: "Verify your Dristy account",
        subtitle: "Use this one-time code to complete your sign-up.",
        expiresInMinutes: env.AUTH_CODE_EXPIRY_MINUTES,
      });
    } catch (error) {
      if (!isEmailTransportError(error)) {
        throw error;
      }

      emailSent = false;
    }

    return {
      userId: user.id,
      method: input.method,
      requiresEmailVerification: true,
      email: maskEmail(normalizedEmail),
      emailSent,
      warning: emailSent
        ? undefined
        : "Account created but verification email could not be delivered. Please use resend code.",
      message: emailSent
        ? "Account created. Verification code sent to your email."
        : "Account created. Verification email delivery is delayed. Use resend code.",
    };
  }

  const normalizedPhone = input.phone!.trim();
  const existingUser = await findUserByPhone(normalizedPhone);
  if (existingUser) {
    throw new AppError("An account already exists with this phone number.", {
      code: API_ERROR_CODES.CONFLICT,
      expose: true,
    });
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUserWithPassword({
    fullName: input.fullName,
    phone: normalizedPhone,
    phoneVerified: true,
    passwordHash,
  });

  await assignRoleToUserBySlug(user.id, SYSTEM_ROLE.USER);

  return {
    userId: user.id,
    method: input.method,
    requiresEmailVerification: false,
    message: "Phone account created successfully.",
  };
}
