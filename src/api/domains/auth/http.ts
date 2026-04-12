import API, { handleRequest } from "@/api/lib/api";

import type {
  AuthMessageResult,
  AuthSessionResult,
  ForgotPasswordInput,
  ResendEmailCodeInput,
  ResetPasswordInput,
  SignUpInput,
  SignUpResult,
  VerifyEmailCodeInput,
  VerifyEmailCodeResult,
} from "@/api/domains/auth/types";

export const signUp = (payload: SignUpInput) =>
  handleRequest(() =>
    API.post<SignUpResult, SignUpInput>("/api/v1/auth/sign-up", {
      body: payload,
    }),
  );

export const verifyEmailCode = (payload: VerifyEmailCodeInput) =>
  handleRequest(() =>
    API.post<VerifyEmailCodeResult, VerifyEmailCodeInput>("/api/v1/auth/verify-email", {
      body: payload,
    }),
  );

export const resendEmailCode = (payload: ResendEmailCodeInput) =>
  handleRequest(() =>
    API.post<AuthMessageResult, ResendEmailCodeInput>("/api/v1/auth/resend-code", {
      body: payload,
    }),
  );

export const requestPasswordReset = (payload: ForgotPasswordInput) =>
  handleRequest(() =>
    API.post<AuthMessageResult, ForgotPasswordInput>("/api/v1/auth/forgot-password", {
      body: payload,
    }),
  );

export const resetPassword = (payload: ResetPasswordInput) =>
  handleRequest(() =>
    API.post<AuthMessageResult, ResetPasswordInput>("/api/v1/auth/reset-password", {
      body: payload,
    }),
  );

export const fetchAuthSession = () =>
  handleRequest(() => API.get<AuthSessionResult>("/api/v1/auth/session"));
