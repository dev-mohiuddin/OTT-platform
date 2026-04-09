import { withApiHandler } from "@/server/common/http/route-handler";
import { resendEmailCodeUseCase } from "@/server/modules/users/use-cases/resend-email-code.use-case";

export const POST = withApiHandler(async (request) => {
  const payload = await request.json();
  const data = await resendEmailCodeUseCase(payload);

  return {
    data,
  };
});
