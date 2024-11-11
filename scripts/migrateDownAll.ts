import * as path from "path";
import { promises as fs } from "fs";
import { Console } from "console";
import { stdout } from "process";

import { Migrator, FileMigrationProvider, NO_MIGRATIONS } from "kysely";

import { db } from "@/lib/server/db";

const console = new Console(stdout);

async function migrateDownAll() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "../migrations"),
    }),
  });

  const { error, results } = await migrator.migrateTo(NO_MIGRATIONS);

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`Migration "${it.migrationName}" was executed successfully.`);
    } else if (it.status === "Error") {
      console.error(`Migration "${it.migrationName}" failed`);
    }

    if (error) {
      console.error("Failed to migrate database");
      console.error(error);
      process.exit(1);
    }
  });

  await db.destroy();
}

migrateDownAll();
