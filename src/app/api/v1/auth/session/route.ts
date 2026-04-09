import { auth } from "@/auth";
import { withApiHandler } from "@/server/common/http/route-handler";

export const GET = withApiHandler(async () => {
  const session = await auth();

  return {
    data: {
      isAuthenticated: Boolean(session?.user?.id),
      user: session?.user ?? null,
    },
  };
});
