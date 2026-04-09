import { withApiHandler } from "@/server/common/http/route-handler";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { requirePermissionActor } from "@/lib/auth/route-access";
import {
  assignRoleToUserUseCase,
  removeRoleFromUserUseCase,
} from "@/server/modules/admin/use-cases/rbac.use-case";

interface UserRoleRouteContext {
  params: Promise<{ userId: string }> | { userId: string };
}

async function resolveUserId(context: UserRoleRouteContext): Promise<string> {
  const resolved = await context.params;
  return resolved.userId;
}

export const POST = withApiHandler(async (request, context: UserRoleRouteContext) => {
  const actor = await requirePermissionActor(ADMIN_PERMISSION.USERS_UPDATE);
  const userId = await resolveUserId(context);

  const payload = await request.json();
  const result = await assignRoleToUserUseCase(userId, payload, actor.userId);

  return {
    data: result,
  };
});

export const DELETE = withApiHandler(async (request, context: UserRoleRouteContext) => {
  const actor = await requirePermissionActor(ADMIN_PERMISSION.USERS_UPDATE);
  const userId = await resolveUserId(context);

  const payload = await request.json();
  const result = await removeRoleFromUserUseCase(userId, payload, actor.userId);

  return {
    data: result,
  };
});
