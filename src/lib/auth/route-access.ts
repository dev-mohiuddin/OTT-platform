import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/access";
import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";

export interface RequestActor {
  userId: string;
  roles: string[];
  permissions: string[];
}

export async function requireAuthenticatedActor(): Promise<RequestActor> {
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) {
    throw new AppError("Authentication is required.", {
      code: API_ERROR_CODES.UNAUTHORIZED,
      expose: true,
    });
  }

  return {
    userId,
    roles: session.user.roles ?? [],
    permissions: session.user.permissions ?? [],
  };
}

export async function requirePermissionActor(permission: string): Promise<RequestActor> {
  const actor = await requireAuthenticatedActor();

  if (!hasPermission(actor, permission)) {
    throw new AppError("You do not have permission for this operation.", {
      code: API_ERROR_CODES.FORBIDDEN,
      expose: true,
      details: {
        permission,
      },
    });
  }

  return actor;
}
