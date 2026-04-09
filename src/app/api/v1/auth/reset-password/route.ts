import { withApiHandler } from "@/server/common/http/route-handler";
import { resetPasswordUseCase } from "@/server/modules/users/use-cases/reset-password.use-case";

export const POST = withApiHandler(async (request) => {
  const payload = await request.json();
  const data = await resetPasswordUseCase(payload);

  return {
    data,
  };
});
