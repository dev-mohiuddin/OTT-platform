import { withApiHandler } from "@/server/common/http/route-handler";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { requirePermissionActor } from "@/lib/auth/route-access";
import { updateAdminContentDraftUseCase } from "@/server/modules/admin/use-cases/console.use-case";

interface ContentItemRouteContext {
  params: Promise<{ contentId: string }> | { contentId: string };
}

async function resolveContentId(context: ContentItemRouteContext): Promise<string> {
  const resolved = await context.params;
  return resolved.contentId;
}

export const PATCH = withApiHandler(async (request, context: ContentItemRouteContext) => {
  const actor = await requirePermissionActor(ADMIN_PERMISSION.PANEL_ACCESS);

  const contentId = await resolveContentId(context);
  const payload = await request.json();
  const item = await updateAdminContentDraftUseCase(contentId, payload, actor.userId);

  return {
    data: item,
  };
});
