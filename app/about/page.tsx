import { redirect } from "next/navigation";

import { title } from "@/components/primitives";
import { validateRequest } from "@/lib/auth";

export default async function AboutPage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div>
      <h1 className={title()}>Hello, {user.username}!</h1>
    </div>
  );
}
