"use server";

import "server-cli-only";

import { parse as parseCsv } from "csv/sync";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { UserTable, UserRole } from "@/types/auth";
import { ActionResult } from "@/types/actions";
import { createUserInfo } from "@/lib/auth";

export async function createUsers(
  state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const csv = formData.get("users")?.toString() ?? "";

  // CSVをパースしてユーザー情報を取得
  const userRecords = parseCsv(csv, {
    skip_empty_lines: true,
  }) as string[][];

  let users;

  try {
    users = userRecords.map((record) => {
      const [username, password, display_name, role] = record;

      if (
        !username ||
        !password ||
        !display_name ||
        !role ||
        (role !== "admin" && role !== "user")
      ) {
        throw new Error("Invalid user record");
      }

      return {
        username,
        password,
        display_name,
        role: role as UserRole,
      };
    });
  } catch (error) {
    return {
      errors: "CSVの形式が正しくありません．",
    };
  }

  if (users.length === 0) {
    return {
      errors:
        "ユーザー情報がありません．作成するユーザー情報をCSVで記述してください．",
    };
  }

  const createUserInfoPromises = users.map((user) => {
    return createUserInfo(
      user.username,
      user.password,
      user.display_name,
      user.role,
    );
  });

  const userEntries = await Promise.all(createUserInfoPromises);

  // もし１つでもuserEntriesのなかにエラーがあったら，エラーを投げる
  if (userEntries.some((entry) => "errors" in entry)) {
    return {
      errors: "ユーザー作成に失敗しました．CSVの内容を確認してください．",
    };
  }

  await db
    .insertInto("user")
    .values(userEntries as UserTable[])
    .execute();

  return redirect("/settings/users/create/success");
}

export async function deleteUsers(formData: FormData) {
  const userIds = formData.getAll("user_id").map((id) => id.toString());

  await db.deleteFrom("user").where("id", "in", userIds).execute();

  return redirect("/settings/users/delete/success");
}
