import { HTTP_STATUS } from "@/server/common/constants/http-status";
import { withApiHandler } from "@/server/common/http/route-handler";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { requirePermissionActor } from "@/lib/auth/route-access";
import {
  createPermissionUseCase,
  listPermissionsUseCase,
} from "@/server/modules/admin/use-cases/rbac.use-case";

export const GET = withApiHandler(async () => {
  await requirePermissionActor(ADMIN_PERMISSION.PERMISSIONS_READ);

  const permissions = await listPermissionsUseCase();
  return {
    data: permissions,
  };
});

export const POST = withApiHandler(async (request) => {
  await requirePermissionActor(ADMIN_PERMISSION.PERMISSIONS_CREATE);

  const payload = await request.json();
  const permission = await createPermissionUseCase(payload);

  return {
    data: permission,
    statusCode: HTTP_STATUS.CREATED,
  };
});
