import { z } from "zod";

export const createPermissionSchema = z.object({
  key: z.string().trim().min(3).max(80),
  label: z.string().trim().min(2).max(80),
  description: z.string().trim().max(200).optional(),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(200).optional(),
  permissionKeys: z.array(z.string().trim().min(3)).default([]),
});

export const createAdminUserSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  roleSlugs: z.array(z.string().trim().min(2)).min(1),
});

export const assignUserRoleSchema = z.object({
  roleSlug: z.string().trim().min(2),
});
