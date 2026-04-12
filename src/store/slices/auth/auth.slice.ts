import { createSlice } from "@reduxjs/toolkit";

import {
  requestPasswordResetThunk,
  resetPasswordThunk,
  signUpThunk,
  verifyEmailCodeThunk,
} from "@/store/slices/auth/auth.thunks";

export interface AuthUiState {
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: AuthUiState = {
  loading: false,
  errorMessage: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthUiState(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
    clearAuthError(state) {
      state.errorMessage = null;
    },
    clearAuthSuccess(state) {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpThunk.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(signUpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(signUpThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message ?? "Failed to create account.";
      })
      .addCase(verifyEmailCodeThunk.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(verifyEmailCodeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(verifyEmailCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message ?? "Failed to verify email.";
      })
      .addCase(requestPasswordResetThunk.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(requestPasswordResetThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(requestPasswordResetThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message ?? "Failed to send reset code.";
      })
      .addCase(resetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message ?? "Failed to reset password.";
      });
  },
});

export const { clearAuthUiState, clearAuthError, clearAuthSuccess } = authSlice.actions;
export const authReducer = authSlice.reducer;
