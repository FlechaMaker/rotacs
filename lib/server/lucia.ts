import { Lucia } from "lucia";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";

import { pool } from "@/lib/server/db";

const adapter = new NodePostgresAdapter(pool, {
  user: "user",
  session: "session",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: process.env.LUCIA_SESSION_COOKIE_NAME,
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      display_name: attributes.display_name,
      role: attributes.role,
    };
  },
});
