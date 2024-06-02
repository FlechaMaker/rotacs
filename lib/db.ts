import { Pool } from "pg";
import { createKysely } from "@vercel/postgres-kysely";
import { PostgresDialect } from "kysely";

export const pool = new Pool();

export const db = createKysely<Database>(undefined, {
  dialect: new PostgresDialect({ pool }),
});

interface Database {
  user: UserTable;
  session: SessionTable;
}

interface UserTable {
  id: string;
  username: string;
  password_hash: string;
}

interface SessionTable {
  id: string;
  user_id: string;
  expires_at: Date;
}
