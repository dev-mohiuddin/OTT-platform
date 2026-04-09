import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/access";
import { ADMIN_PERMISSION } from "@/lib/auth/constants";

const authPages = new Set([
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
  "/reset-password",
]);

const protectedUserPrefixes = [
  "/account",
  "/settings",
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

  const isAuthPage = authPages.has(pathname);
  const isUserProtected = protectedUserPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAdminProtected = protectedAdminPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (!isLoggedIn && (isUserProtected || isAdminProtected)) {
    if (pathname.startsWith("/api/")) {
      return Response.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required.",
            status: 401,
          },
        },
        { status: 401 },
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
        return Response.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Admin access required.",
              status: 403,
            },
          },
          { status: 403 },
        );
      }

      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/admin/:path*",
    "/account/:path*",
    "/settings/:path*",
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
