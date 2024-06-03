import { Kysely } from "kysely";

export async function up(kysely: Kysely<any>): Promise<void> {
  await kysely.schema
    .createTable("user")
    .addColumn("id", "varchar", (column) => column.primaryKey())
    .addColumn("username", "varchar", (column) => column.notNull().unique())
    .addColumn("password_hash", "varchar", (column) => column.notNull())
    .execute();

  await kysely.schema
    .createTable("session")
    .addColumn("id", "varchar", (column) => column.primaryKey())
    .addColumn("user_id", "varchar", (column) =>
      column.notNull().references("user.id"),
    )
    .addColumn("expires_at", "timestamp", (column) => column.notNull())
    .execute();

  await kysely.schema
    .createTable("line_notify_token")
    .addColumn("id", "varchar", (column) => column.primaryKey())
    .addColumn("issued_at", "timestamp")
    .addColumn("user_id", "varchar", (column) =>
      column.notNull().references("user.id"),
    )
    .addColumn("token", "varchar", (column) => column.unique())
    .execute();
}

export async function down(kysely: Kysely<any>): Promise<void> {
  await kysely.schema.dropTable("line_notify_token").execute();
  await kysely.schema.dropTable("session").execute();
  await kysely.schema.dropTable("user").execute();
}
