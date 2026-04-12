import type { RootState } from "@/store/store";

export const selectAuthUiState = (state: RootState) => state.auth;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthErrorMessage = (state: RootState) => state.auth.errorMessage;
export const selectAuthSuccessMessage = (state: RootState) => state.auth.successMessage;
