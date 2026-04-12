import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { ADMIN_PERMISSION } from "@/lib/auth/constants";

const authPages = new Set([
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
  "/reset-password",
]);

const protectedUserPrefixes = [
  "/dashboard",
  "/account",
  "/settings",
  "/billing",
  "/shows",
  "/movies",
  "/watchlist",
  "/my-list",
  "/browse",
  "/search",
  "/kids",
  "/watch",
];

const protectedAdminPrefixes = ["/admin", "/api/v1/admin"];

function hasPermission(permissions: unknown, requiredPermission: string): boolean {
  return Array.isArray(permissions) && permissions.includes(requiredPermission);
}

function createApiErrorResponse(
  status: 401 | 403,
  code: "UNAUTHORIZED" | "FORBIDDEN",
  message: string,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        status,
      },
    },
    { status },
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isLoggedIn = Boolean(token?.sub);

  const isAuthPage = authPages.has(pathname);
  const isUserProtected = protectedUserPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAdminProtected = protectedAdminPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/browse", request.url));
  }

  if (!isLoggedIn && (isUserProtected || isAdminProtected)) {
    if (pathname.startsWith("/api/")) {
      return createApiErrorResponse(401, "UNAUTHORIZED", "Authentication is required.");
    }

    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAdminProtected && isLoggedIn) {
    if (!hasPermission(token?.permissions, ADMIN_PERMISSION.PANEL_ACCESS)) {
      if (pathname.startsWith("/api/")) {
        return createApiErrorResponse(403, "FORBIDDEN", "Admin access required.");
      }

      return NextResponse.redirect(new URL("/browse", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/v1/admin/:path*",
    "/account/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/shows/:path*",
    "/movies/:path*",
    "/watchlist/:path*",
    "/my-list/:path*",
    "/browse/:path*",
    "/search/:path*",
    "/kids/:path*",
    "/watch/:path*",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/verify-email",
    "/reset-password",
  ],
};
