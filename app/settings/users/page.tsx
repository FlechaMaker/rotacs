import "server-cli-only";

import React from "react";
import { User as LuciaUser } from "lucia";

import UserSettingsTable from "@/components/settings/user-table";
import { db } from "@/lib/db";
import NewUsersTextarea from "@/components/settings/new-users-textarea";

export default async function UserSettings() {
  const users: LuciaUser[] = await db.selectFrom("user").selectAll().execute();

  return (
    <div>
      <div className="p-2">
        <p className="text-base font-medium text-default-700">ユーザー一覧</p>
        <p className="mt-1 text-sm font-normal text-default-400">
          ユーザーの削除を行えます．
        </p>
        <UserSettingsTable users={users} />
      </div>
      <div className="p-2">
        <p className="text-base font-medium text-default-700">ユーザーの追加</p>
        <p className="mt-1 text-sm font-normal text-default-400">
          CSV形式でユーザーを追加できます．
        </p>
        <NewUsersTextarea />
      </div>
    </div>
  );
}
