import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/access";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";
import { createRequestContext } from "@/server/common/context/request-context";
import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";
import { createErrorJsonResponse } from "@/server/common/http/json-response";

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

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isLoggedIn = Boolean(request.auth?.user?.id);
  const requestContext = createRequestContext(request);

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
      return createErrorJsonResponse(
        new AppError("Authentication is required.", {
          code: API_ERROR_CODES.UNAUTHORIZED,
          expose: true,
        }),
        requestContext,
      );
    }

    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAdminProtected && request.auth?.user) {
    const access = {
      roles: request.auth.user.roles ?? [],
      permissions: request.auth.user.permissions ?? [],
    };

    if (!hasPermission(access, ADMIN_PERMISSION.PANEL_ACCESS)) {
      if (pathname.startsWith("/api/")) {
        return createErrorJsonResponse(
          new AppError("Admin access required.", {
            code: API_ERROR_CODES.FORBIDDEN,
            expose: true,
          }),
          requestContext,
        );
      }

      return NextResponse.redirect(new URL("/browse", request.url));
    }
  }

  return NextResponse.next();
});

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
