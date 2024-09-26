import React from "react";

import SettingTabs from "@/components/settings/setting-tabs";
import { validateRequest } from "@/lib/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  const isAdmin = user?.role === "admin";

  return (
    <div className="h-full w-full flex-1 flex-col p-4">
      {/* Title */}
      <div className="flex items-center gap-x-3">
        <h1 className="text-3xl font-bold text-default-foreground">設定</h1>
      </div>
      <h2 className="mt-2 text-small text-default-500">設定に関する説明</h2>
      <SettingTabs isAdmin={isAdmin} />
      {children}
    </div>
  );
}
