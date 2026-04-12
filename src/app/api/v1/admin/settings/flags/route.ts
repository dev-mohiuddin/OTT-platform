import { withApiHandler } from "@/server/common/http/route-handler";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { requirePermissionActor } from "@/lib/auth/route-access";
import {
  getAdminFeatureFlagsUseCase,
  saveAdminFeatureFlagsUseCase,
} from "@/server/modules/admin/use-cases/console.use-case";

export const GET = withApiHandler(async () => {
  await requirePermissionActor(ADMIN_PERMISSION.PANEL_ACCESS);

  const flags = await getAdminFeatureFlagsUseCase();

  return {
    data: flags,
  };
});

export const PUT = withApiHandler(async (request) => {
  const actor = await requirePermissionActor(ADMIN_PERMISSION.PANEL_ACCESS);

  const payload = await request.json();
  const flags = await saveAdminFeatureFlagsUseCase(payload, actor.userId);

  return {
    data: flags,
  };
});
