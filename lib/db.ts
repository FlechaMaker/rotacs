import { Console } from "console";
import { stdout } from "process";

import { Pool } from "pg";
import { createKysely } from "@vercel/postgres-kysely";
import { PostgresDialect } from "kysely";

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const console = new Console(stdout);

export const db = createKysely<Database>(undefined, {
  dialect: new PostgresDialect({ pool }),
  log: (event) => {
    if (event.level == "query") {
      const q = event.query;
      const time = Math.round(event.queryDurationMillis * 100) / 100;

      console.log(
        `\u001b[34mkysely:sql\u001b[0m [${q.sql}] parameters: [${q.parameters}] time: ${time}`,
      );
    }
  },
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
