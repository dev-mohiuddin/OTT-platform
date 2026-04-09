import { withApiHandler } from "@/server/common/http/route-handler";
import { requestPasswordResetUseCase } from "@/server/modules/users/use-cases/request-password-reset.use-case";

export const POST = withApiHandler(async (request) => {
  const payload = await request.json();
  const data = await requestPasswordResetUseCase(payload);

  return {
    data,
  };
});
