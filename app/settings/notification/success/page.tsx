"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import ResultCard from "@/components/result-card";

const SuccessPage: React.FC = () => {
  const searchParams = useSearchParams();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <ResultCard
        message={`${searchParams.get("message")}`}
        returnHref="/settings/notification"
        returnText="通知設定ページに戻る"
        status="success"
        title="通知設定成功"
      />
    </div>
  );
};

SuccessPage.displayName = "DeleteUserSuccessPage";

export default SuccessPage;
