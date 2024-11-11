import { redirect } from "next/navigation";

import { homeTitle } from "@/components/primitives";
import { validateRequest } from "@/lib/server/auth";

export default async function AboutPage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div>
      <h1 className={homeTitle()}>Hello, {user.username}!</h1>
    </div>
  );
}
