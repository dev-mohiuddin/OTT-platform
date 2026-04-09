export type SignUpMethod = "email" | "phone";

export interface SignUpInput {
  method: SignUpMethod;
  fullName: string;
  password: string;
  email?: string;
  phone?: string;
}

export interface SignUpResult {
  userId: string;
  method: SignUpMethod;
  requiresEmailVerification: boolean;
  email?: string;
  emailSent?: boolean;
  warning?: string;
  message: string;
}

export interface VerifyEmailCodeInput {
  email: string;
  code: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface SignInInput {
  identifier: string;
  password: string;
}
