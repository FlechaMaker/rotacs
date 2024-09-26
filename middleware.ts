import "server-cli-only";

import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const currentUser = request.cookies.get(
    process.env.LUCIA_SESSION_COOKIE_NAME ?? "auth_session",
  )?.value;
  const currentUserRole = request.cookies.get(
    process.env.SESSION_COOKIE_ROLE_NAME ?? "auth_role",
  )?.value;

  console.log(currentUser, currentUserRole, request.nextUrl.pathname);

  if (!currentUser) {
    if (request.nextUrl.pathname.match(/^\/(about|settings|logout).*/)) {
      return Response.redirect(new URL("/login", request.url));
    }
  } else if (currentUser) {
    if (request.nextUrl.pathname.startsWith("/login")) {
      return Response.redirect(new URL("/", request.url));
    }

    if (currentUserRole === "user") {
      if (request.nextUrl.pathname.match(/^\/settings\/(users).*/)) {
        return Response.redirect(new URL("/settings", request.url));
      }
    }
  }
}

export const config = {
  matcher: ["/((?!api/line-notify|_next/static|_next/image|.*\\.png$).*)"],
};
