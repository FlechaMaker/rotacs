"use server";

import "server-cli-only";

import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/server/auth";
import {
  sendLineNotifyMessage,
  startLineNotifyAuthorize,
} from "@/lib/server/line-notify";

export async function startLineLogin(formData: FormData) {
  const { user, session } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  const description = formData.get("description")?.toString() ?? "";

  const url = await startLineNotifyAuthorize(user, session, description);

  return redirect(url);
}

export async function handleTestMessageSend() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  await sendLineNotifyMessage(
    {
      message:
        "RoTACS (Robocon Testrun And Check Scheduler)からのテスト通知です。",
    },
    user,
  );
}
