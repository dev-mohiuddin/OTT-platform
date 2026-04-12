import API, { handleRequest } from "@/api/lib/api";

export interface CreatePermissionInput {
  key: string;
  label: string;
  description?: string;
}

export const listAdminPermissions = () =>
  handleRequest(() => API.get<unknown[]>("/api/v1/admin/permissions"));

export const createAdminPermission = (payload: CreatePermissionInput) =>
  handleRequest(() =>
    API.post<unknown, CreatePermissionInput>("/api/v1/admin/permissions", {
      body: payload,
    }),
  );
