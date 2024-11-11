import { redirect } from "next/navigation";

import { signup } from "@/lib/server/auth";

export default async function Page() {
  return (
    <>
      <h1>Create an account</h1>
      <form action={handleSignUp}>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
        <br />
        <button>Continue</button>
      </form>
    </>
  );
}

async function handleSignUp(formData: FormData) {
  "use server";
  signup(formData);
  redirect("/");
}
