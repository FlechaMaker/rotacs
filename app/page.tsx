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
import OverviewTable from "@/components/overview-table";

export default async function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-4">
      <OverviewTable />
    </section>
  );
}
