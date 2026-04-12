import { createAsyncThunk } from "@reduxjs/toolkit";

import type { ApiRequestFailure } from "@/api/lib/api";
import {
  requestPasswordReset,
  resetPassword,
  signUp,
  verifyEmailCode,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type SignUpInput,
  type SignUpResult,
  type VerifyEmailCodeInput,
  type VerifyEmailCodeResult,
  type AuthMessageResult,
} from "@/api/domains/auth";

export const signUpThunk = createAsyncThunk<
  SignUpResult,
  SignUpInput,
  { rejectValue: ApiRequestFailure }
>("auth/signUp", async (payload, { rejectWithValue }) => {
  const result = await signUp(payload);

  if (!result.success) {
    return rejectWithValue(result);
  }

  return result.data;
});

export const verifyEmailCodeThunk = createAsyncThunk<
  VerifyEmailCodeResult,
  VerifyEmailCodeInput,
  { rejectValue: ApiRequestFailure }
>("auth/verifyEmailCode", async (payload, { rejectWithValue }) => {
  const result = await verifyEmailCode(payload);

  if (!result.success) {
    return rejectWithValue(result);
  }

  return result.data;
});

export const requestPasswordResetThunk = createAsyncThunk<
  AuthMessageResult,
  ForgotPasswordInput,
  { rejectValue: ApiRequestFailure }
>("auth/requestPasswordReset", async (payload, { rejectWithValue }) => {
  const result = await requestPasswordReset(payload);

  if (!result.success) {
    return rejectWithValue(result);
  }

  return result.data;
});

export const resetPasswordThunk = createAsyncThunk<
  AuthMessageResult,
  ResetPasswordInput,
  { rejectValue: ApiRequestFailure }
>("auth/resetPassword", async (payload, { rejectWithValue }) => {
  const result = await resetPassword(payload);

  if (!result.success) {
    return rejectWithValue(result);
  }

  return result.data;
});
