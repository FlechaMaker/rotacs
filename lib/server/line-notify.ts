"use server";

import "server-cli-only";

import { hash } from "@node-rs/argon2";
import { Session, User } from "lucia";
import axios from "axios";
import { redirect } from "next/navigation";

import { db } from "@/lib/server/db";
import { ActionResult } from "@/types/actions";

interface OAuthAuthorizeParams extends Record<string, string> {
  response_type: "code";
  client_id: string;
  redirect_uri: string;
  scope: "notify";
  state: string;
  response_mode: "form_post" | "";
}

interface OAuthTokenParams extends Record<string, string> {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}

interface OAuthTokenResponse {
  access_token: string;
}

export interface LineNotifyMessage {
  message: string;
  imageThumbnail?: string;
  imageFullsize?: string;
  imageFile?: File;
  stickerPackageId?: number;
  stickerId?: number;
  notificationDisabled?: boolean;
}

interface LineNotifyNotifyResponse {
  status: number;
  message: string;
}

export async function startLineNotifyAuthorize(
  user: User,
  session: Session,
  description: string,
): Promise<string> {
  const client_id = process.env.LINE_NOTIFY_CLIENT_ID;

  if (!client_id) {
    throw new Error("LINE_NOTIFY_CLIENT_ID is not set");
  }

  const redirect_uri = process.env.LINE_NOTIFY_REDIRECT_URI;

  if (!redirect_uri) {
    throw new Error("LINE_NOTIFY_REDIRECT_URI is not set");
  }

  const state = await hash(session.id, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const tokenEntry = await db
    .insertInto("line_notify_token")
    .values({
      id: state,
      user_id: user.id,
      description,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  const requestParams: OAuthAuthorizeParams = {
    response_type: "code",
    client_id: client_id,
    redirect_uri: redirect_uri,
    scope: "notify",
    state: tokenEntry.id,
    response_mode: "",
  };

  const url = "https://notify-bot.line.me/oauth/authorize";
  const urlParams = new URLSearchParams(requestParams);

  return `${url}?${urlParams}`;
}

export async function issueLineNotifyToken(
  code: string,
  state: string,
): Promise<string | undefined> {
  const redirect_uri = process.env.LINE_NOTIFY_REDIRECT_URI;
  const client_id = process.env.LINE_NOTIFY_CLIENT_ID;
  const client_secret = process.env.LINE_NOTIFY_CLIENT_SECRET;

  if (!redirect_uri || !client_id || !client_secret) {
    throw new Error(
      "LINE_NOTIFY_REDIRECT_URI, LINE_NOTIFY_CLIENT_ID, or LINE_NOTIFY_CLIENT_SECRET is not set",
    );
  }

  let validEntry = null;

  // 届いたコードが本アプリからのリクエストによるものか確認
  try {
    validEntry = await db
      .selectFrom("line_notify_token")
      .select("id")
      .where("id", "=", state)
      .executeTakeFirstOrThrow();
  } catch (error) {
    throw new Error(`Invalid state: ${state}`);
  }

  const url = "https://notify-bot.line.me/oauth/token";
  const requestParams: OAuthTokenParams = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirect_uri,
    client_id: client_id,
    client_secret: client_secret,
  };
  const requestData = new URLSearchParams(requestParams);

  const token = await axios
    .post(url, requestData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => {
      const data = response.data as OAuthTokenResponse;
      const token = data.access_token;

      return token;
    });

  await db
    .updateTable("line_notify_token")
    .set({
      token: token,
      issued_at: new Date(),
    })
    .where("id", "=", validEntry.id)
    .executeTakeFirstOrThrow();

  return token;
}

export async function revokeNotifyToken(
  formData: FormData,
): Promise<ActionResult> {
  const ids = formData.getAll("id");

  if (!ids || ids.length === 0) {
    redirect(
      `/settings/notification/failed?message=${encodeURIComponent("不正なリクエストです．管理者に問題を報告してください．")}`,
    );
  }

  ids.forEach(async (id) => {
    const token = await db
      .selectFrom("line_notify_token")
      .where("id", "=", id.toString())
      .select("token")
      .executeTakeFirst();

    if (!token) {
      redirect(
        `/settings/notification/failed?message=${encodeURIComponent("指定されたトークンが見つかりません")}`,
      );
    }

    if (token.token) {
      const url = "https://notify-api.line.me/api/revoke";
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token.token}`,
      };

      await axios
        .post(url, {}, { headers })
        .then((response) => {
          const data = response.data as LineNotifyNotifyResponse;
          const status = data.status;
          const message = data.message;

          if (status !== 200 && status !== 401) {
            redirect(
              `/settings/notification/failed?message=${encodeURIComponent(`Failed to revoke LINE Notify token: ${message}`)}`,
            );
          }
        })
        .catch((error) => {
          console.warn(`Failed to revoke LINE Notify token: ${error.message}`);
        });
    }

    await db
      .deleteFrom("line_notify_token")
      .where("id", "=", id.toString())
      .execute();
  });

  redirect(
    `/settings/notification/success?message=${encodeURIComponent("通知設定を削除しました")}`,
  );
}

export async function getUserTokens(user: User) {
  return db
    .selectFrom("line_notify_token")
    .selectAll()
    .where("user_id", "=", user.id)
    .execute();
}

export async function sendLineNotifyMessage(
  message: LineNotifyMessage,
  user: User,
) {
  const tokenEntries = await db
    .selectFrom("line_notify_token")
    .select("token")
    .where("user_id", "=", user.id)
    .execute();

  const requestPromises = tokenEntries.map(async (entry) => {
    const token = entry.token;

    if (!token) {
      return;
    }

    const url = "https://notify-api.line.me/api/notify";
    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };

    await axios.post(url, message, { headers }).then((response) => {
      const data = response.data as LineNotifyNotifyResponse;
      const status = data.status;
      const message = data.message;

      if (status !== 200) {
        throw new Error(`Failed to send LINE Notify message: ${message}`);
      }
    });
  });

  await Promise.all(requestPromises);
}
