export interface AdminPermission {
  id: string;
  key: string;
  label: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRolePermission {
  roleId: string;
  permissionId: string;
  createdAt: string;
  permission: AdminPermission;
}

export interface AdminRole {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: AdminRolePermission[];
  _count?: {
    users: number;
  };
}

export interface AdminUserRole {
  userId: string;
  roleId: string;
  assignedById: string | null;
  assignedAt: string;
  role: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  roles: AdminUserRole[];
}
