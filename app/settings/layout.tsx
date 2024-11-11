import React from "react";

import SettingTabs from "@/components/settings/setting-tabs";
import { validateRequest } from "@/lib/server/auth";
import {
  pageContainer,
  pageSubtitle,
  pageTitle,
} from "@/components/primitives";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  const isAdmin = user?.role === "admin";

  return (
    <div className={pageContainer()}>
      {/* Title */}
      <div className="flex-col items-center">
        <h1 className={pageTitle()}>設定</h1>
        <h2 className={pageSubtitle()}>設定の確認と変更ができます．</h2>
      </div>
      <SettingTabs isAdmin={isAdmin} />
      {children}
    </div>
  );
}
