import API, { handleRequest } from "@/api/lib/api";

export interface CreateRoleInput {
  name: string;
  slug: string;
  description?: string;
  permissionKeys: string[];
}

export const listAdminRoles = () =>
  handleRequest(() => API.get<unknown[]>("/api/v1/admin/roles"));

export const createAdminRole = (payload: CreateRoleInput) =>
  handleRequest(() =>
    API.post<unknown, CreateRoleInput>("/api/v1/admin/roles", {
      body: payload,
    }),
  );
