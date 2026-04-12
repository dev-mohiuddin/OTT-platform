import { withApiHandler } from "@/server/common/http/route-handler";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { requirePermissionActor } from "@/lib/auth/route-access";
import { getAdminDashboardSummaryUseCase } from "@/server/modules/admin/use-cases/console.use-case";

export const GET = withApiHandler(async () => {
  await requirePermissionActor(ADMIN_PERMISSION.PANEL_ACCESS);

  const summary = await getAdminDashboardSummaryUseCase();

  return {
    data: summary,
  };
});
