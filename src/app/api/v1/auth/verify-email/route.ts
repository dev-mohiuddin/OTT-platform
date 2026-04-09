import { withApiHandler } from "@/server/common/http/route-handler";
import { verifyEmailCodeUseCase } from "@/server/modules/users/use-cases/verify-email-code.use-case";

export const POST = withApiHandler(async (request) => {
  const payload = await request.json();
  const data = await verifyEmailCodeUseCase(payload);

  return {
    data,
  };
});
