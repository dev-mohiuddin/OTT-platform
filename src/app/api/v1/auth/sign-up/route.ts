import { HTTP_STATUS } from "@/server/common/constants/http-status";
import { withApiHandler } from "@/server/common/http/route-handler";
import { registerUserUseCase } from "@/server/modules/users/use-cases/register-user.use-case";

export const POST = withApiHandler(async (request) => {
  const payload = await request.json();
  const data = await registerUserUseCase(payload);

  return {
    data,
    statusCode: HTTP_STATUS.CREATED,
  };
});
