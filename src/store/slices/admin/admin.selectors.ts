import type { RootState } from "@/store/store";

export const selectAdminUiState = (state: RootState) => state.admin;
export const selectAdminLoading = (state: RootState) => state.admin.loading;
export const selectAdminErrorMessage = (state: RootState) => state.admin.errorMessage;
export const selectAdminRoles = (state: RootState) => state.admin.roles;
export const selectAdminUsers = (state: RootState) => state.admin.users;
export const selectAdminPermissions = (state: RootState) => state.admin.permissions;
