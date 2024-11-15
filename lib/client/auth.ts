"use client";

import "client-only";

import { getCookie } from "cookies-next/client";

export function isAdmin() {
  const authRole = getCookie(
    process.env.NEXT_PUBLIC_SESSION_COOKIE_ROLE_NAME || "auth_role",
  );

  const isAdmin = authRole === "admin";

  return isAdmin;
}
