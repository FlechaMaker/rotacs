import "server-cli-only";

import fs from "node:fs";

import { Pool, PoolConfig } from "pg";
import { Kysely, PostgresDialect } from "kysely";

import { Database } from "@/types/db";

const ca = fs
  .readFileSync(process.env.POSTGRES_ROOT_CERT ?? "server-ca.pem")
  .toString();
const key = fs
  .readFileSync(process.env.POSTGRES_DB_KEY ?? "client-key.pem")
  .toString();
const cert = fs
  .readFileSync(process.env.POSTGRES_DB_CERT ?? "client-cert.pem")
  .toString();

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
