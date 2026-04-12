import API, { handleRequest } from "@/api/lib/api";

export interface CreateAdminUserInput {
  fullName: string;
  email: string;
  password: string;
  roleSlugs: string[];
}

export interface AssignUserRoleInput {
  roleSlug: string;
}

export const listAdminUsers = () =>
  handleRequest(() => API.get<unknown[]>("/api/v1/admin/users"));

export const createAdminUser = (payload: CreateAdminUserInput) =>
  handleRequest(() =>
    API.post<unknown, CreateAdminUserInput>("/api/v1/admin/users", {
      body: payload,
    }),
  );

export const assignUserRole = (userId: string, payload: AssignUserRoleInput) =>
  handleRequest(() =>
    API.post<unknown, AssignUserRoleInput>(`/api/v1/admin/users/${userId}/roles`, {
      body: payload,
    }),
  );

export const removeUserRole = (userId: string, payload: AssignUserRoleInput) =>
  handleRequest(() =>
    API.request<unknown, AssignUserRoleInput>(`/api/v1/admin/users/${userId}/roles`, {
      method: "DELETE",
      body: payload,
    }),
  );
