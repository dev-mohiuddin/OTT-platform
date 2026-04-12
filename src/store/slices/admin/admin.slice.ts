import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAdminPermissionsThunk,
  fetchAdminRolesThunk,
  fetchAdminUsersThunk,
} from "@/store/slices/admin/admin.thunks";

export interface AdminUiState {
  loading: boolean;
  errorMessage: string | null;
  roles: unknown[];
  users: unknown[];
  permissions: unknown[];
}

const initialState: AdminUiState = {
  loading: false,
  errorMessage: null,
  roles: [],
  users: [],
  permissions: [],
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError(state) {
      state.errorMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminRolesThunk.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(fetchAdminRolesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchAdminRolesThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message ?? "Failed to load admin roles.";
      })
      .addCase(fetchAdminUsersThunk.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(fetchAdminUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message ?? "Failed to load admin users.";
      })
      .addCase(fetchAdminPermissionsThunk.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(fetchAdminPermissionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchAdminPermissionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message ?? "Failed to load admin permissions.";
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export const adminReducer = adminSlice.reducer;
