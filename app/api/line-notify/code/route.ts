import { redirect } from "next/navigation";

import { issueLineNotifyToken } from "@/lib/line-notify";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    const error_description = url.searchParams.get("error_description");

    throw new Error(
      `Failed to authorize LINE Notify: ${error}:${state} (${error_description})`,
    );
  }

  const code = url.searchParams.get("code");

  if (!code || !state) {
    throw new Error("LINE Notify OAuth callback is missing code or state");
  }

  await issueLineNotifyToken(code, state);

  // TODO: Redirect to the front-end line-notify success page
  redirect("/");
}

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const error = formData.get("error")?.toString();
  const state = formData.get("state")?.toString();

  if (error) {
    const error_description = formData.get("error_description")?.toString();

    throw new Error(
      `Failed to authorize LINE Notify: ${error}:${state} (${error_description})`,
    );
  }
  const code = formData.get("code")?.toString();

  if (!code || !state) {
    throw new Error("LINE Notify OAuth callback is missing code or state");
  }

  await issueLineNotifyToken(code, state);

  // TODO: Redirect to the front-end line-notify success page
  redirect("/");
}
