import "server-cli-only";

import { Pool } from "pg";
import { createKysely } from "@vercel/postgres-kysely";
import { PostgresDialect } from "kysely";

import { Database } from "@/types/db";

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const db = createKysely<Database>(undefined, {
  dialect: new PostgresDialect({ pool }),
});
