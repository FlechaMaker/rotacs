"use server";

import React from "react";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { redirect } from "next/navigation";
import { Button } from "@nextui-org/button";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import {
  sendLineNotifyMessage,
  startLineNotifyAuthorize,
} from "@/lib/line-notify";
import { validateRequest } from "@/lib/auth";

export default async function Home() {
  const handleLineLogin = async () => {
    "use server";

    const { user, session } = await validateRequest();

    if (!user) {
      return redirect("/login");
    }

    const url = await startLineNotifyAuthorize(user, session);

    return redirect(url);
  };

  const handleMessageSend = async () => {
    "use server";

    const { user } = await validateRequest();

    if (!user) {
      return redirect("/login");
    }

    await sendLineNotifyMessage(
      {
        message: "Hello, world!",
      },
      user,
    );
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg justify-center text-center">
        <h1 className={title()}>Make&nbsp;</h1>
        <h1 className={title({ color: "violet" })}>beautiful&nbsp;</h1>
        <br />
        <h1 className={title()}>
          websites regardless of your design experience.
        </h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Beautiful, fast and modern React UI library.
        </h2>
      </div>

      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href={siteConfig.links.docs}
        >
          Documentation
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>

      <div className="mt-8">
        <form action={handleLineLogin}>
          <Button color="success" type="submit">
            Login with LINE
          </Button>
        </form>
        <form action={handleMessageSend}>
          <Button color="primary" type="submit">
            Hello World!
          </Button>
        </form>
      </div>

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="flat">
          <span>
            Get started by editing <Code color="primary">app/page.tsx</Code>
          </span>
        </Snippet>
      </div>
    </section>
  );
}
