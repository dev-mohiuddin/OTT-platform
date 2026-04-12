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

export interface VerifyEmailCodeResult {
  verified: boolean;
  message: string;
}

export interface ResendEmailCodeInput {
  email: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthMessageResult {
  message: string;
}

export interface AuthSessionResult {
  isAuthenticated: boolean;
  user: {
    id?: string;
    roles?: string[];
    permissions?: string[];
  } | null;
}
