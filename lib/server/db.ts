import "server-cli-only";

import { Pool, PoolConfig } from "pg";
import { Kysely, PostgresDialect } from "kysely";

import { Database } from "@/types/db";

const ca = process.env.POSTGRES_ROOT_CERT;
const key = process.env.POSTGRES_DB_KEY;
const cert = process.env.POSTGRES_DB_CERT;

const config: PoolConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT ?? "5432"),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    ca,
    key,
    cert,
    rejectUnauthorized: false, // https://github.com/porsager/postgres/issues/62
  },
};

export const pool = new Pool(config);
export const dialect = new PostgresDialect({ pool });
export const db = new Kysely<Database>({
  dialect,
});
