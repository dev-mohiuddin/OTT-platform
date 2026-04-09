import { HTTP_STATUS } from "@/server/common/constants/http-status";
import { withApiHandler } from "@/server/common/http/route-handler";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { requirePermissionActor } from "@/lib/auth/route-access";
import {
  createRoleUseCase,
  listRolesUseCase,
} from "@/server/modules/admin/use-cases/rbac.use-case";

export const GET = withApiHandler(async () => {
  await requirePermissionActor(ADMIN_PERMISSION.ROLES_READ);

  const roles = await listRolesUseCase();

  return {
    data: roles,
  };
});

export const POST = withApiHandler(async (request) => {
  const actor = await requirePermissionActor(ADMIN_PERMISSION.ROLES_CREATE);

  const payload = await request.json();
  const role = await createRoleUseCase(payload, actor.userId);

  return {
    data: role,
    statusCode: HTTP_STATUS.CREATED,
  };
});
