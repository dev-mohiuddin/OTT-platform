import { HTTP_STATUS } from "@/server/common/constants/http-status";
import { withApiHandler } from "@/server/common/http/route-handler";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { requirePermissionActor } from "@/lib/auth/route-access";
import {
  createAdminUserUseCase,
  listAdminUsersUseCase,
} from "@/server/modules/admin/use-cases/rbac.use-case";

export const GET = withApiHandler(async () => {
  await requirePermissionActor(ADMIN_PERMISSION.USERS_READ);

  const users = await listAdminUsersUseCase();

  return {
    data: users,
  };
});

export const POST = withApiHandler(async (request) => {
  const actor = await requirePermissionActor(ADMIN_PERMISSION.USERS_CREATE);

  const payload = await request.json();
  const user = await createAdminUserUseCase(payload, actor.userId);

  return {
    data: user,
    statusCode: HTTP_STATUS.CREATED,
  };
});
