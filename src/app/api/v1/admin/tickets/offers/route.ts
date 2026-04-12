import { HTTP_STATUS } from "@/server/common/constants/http-status";
import { withApiHandler } from "@/server/common/http/route-handler";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { requirePermissionActor } from "@/lib/auth/route-access";
import {
  createAdminTicketOfferUseCase,
  getAdminTicketSalesOverviewUseCase,
} from "@/server/modules/admin/use-cases/console.use-case";

export const GET = withApiHandler(async () => {
  await requirePermissionActor(ADMIN_PERMISSION.PANEL_ACCESS);

  const overview = await getAdminTicketSalesOverviewUseCase();

  return {
    data: overview,
  };
});

export const POST = withApiHandler(async (request) => {
  const actor = await requirePermissionActor(ADMIN_PERMISSION.PANEL_ACCESS);

  const payload = await request.json();
  const offer = await createAdminTicketOfferUseCase(payload, actor.userId);

  return {
    data: offer,
    statusCode: HTTP_STATUS.CREATED,
  };
});
