"use server";

import React from "react";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { redirect } from "next/navigation";
import { Button } from "@nextui-org/button";

import { siteConfig } from "@/config/site";
import { homeTitle, homeSubtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import {
  sendLineNotifyMessage,
  startLineNotifyAuthorize,
} from "@/lib/server/line-notify";
import { validateRequest } from "@/lib/server/auth";

export default async function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg justify-center text-center">
        <h1 className={homeTitle()}>RoTACS</h1>
        <h2 className={homeSubtitle({ class: "mt-4" })}>
          Robocon Testrun And Check Scheduler
        </h2>
        <h2 className={homeSubtitle({ class: "mt-4" })}>
          テストランと計量計測の予約システム
        </h2>
        <h2 className={homeSubtitle({ class: "mt-4" })}>
          ここにチーム別一覧を表示予定
        </h2>
      </div>
    </section>
  );
}
