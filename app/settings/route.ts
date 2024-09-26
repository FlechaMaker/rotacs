import { redirect } from "next/navigation";

export async function GET(request: Request): Promise<Response> {
  redirect("/settings/notification");
}
