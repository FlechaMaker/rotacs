import { Pool } from "pg";
import { createKysely } from "@vercel/postgres-kysely";
import { Insertable, PostgresDialect, Selectable, Updateable } from "kysely";

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const db = createKysely<Database>(undefined, {
  dialect: new PostgresDialect({ pool }),
});

interface Database {
  user: UserTable;
  session: SessionTable;
  line_notify_token: LineNotifyTokenTable;
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

interface LineNotifyTokenTable {
  id: string;
  issued_at?: Date;
  user_id: string;
  token?: string;
}

export type LineNotifyToken = Selectable<LineNotifyTokenTable>;
export type NewLineNotifyToken = Insertable<LineNotifyTokenTable>;
export type LineNotifyTokenUpdate = Updateable<LineNotifyTokenTable>;
