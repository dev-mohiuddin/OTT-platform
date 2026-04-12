import { createAsyncThunk } from "@reduxjs/toolkit";

import type { ApiRequestFailure } from "@/api/lib/api";
import {
  listAdminPermissions,
  listAdminRoles,
  listAdminUsers,
} from "@/api/domains/admin";

export const fetchAdminRolesThunk = createAsyncThunk<
  unknown[],
  void,
  { rejectValue: ApiRequestFailure }
>("admin/fetchRoles", async (_payload, { rejectWithValue }) => {
  const result = await listAdminRoles();

  if (!result.success) {
    return rejectWithValue(result);
  }

  return result.data;
});

export const fetchAdminUsersThunk = createAsyncThunk<
  unknown[],
  void,
  { rejectValue: ApiRequestFailure }
>("admin/fetchUsers", async (_payload, { rejectWithValue }) => {
  const result = await listAdminUsers();

  if (!result.success) {
    return rejectWithValue(result);
  }

  return result.data;
});

export const fetchAdminPermissionsThunk = createAsyncThunk<
  unknown[],
  void,
  { rejectValue: ApiRequestFailure }
>("admin/fetchPermissions", async (_payload, { rejectWithValue }) => {
  const result = await listAdminPermissions();

  if (!result.success) {
    return rejectWithValue(result);
  }

  return result.data;
});
