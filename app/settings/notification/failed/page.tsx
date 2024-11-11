"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import ResultCard from "@/components/result-card";

const TestRunFailedPage: React.FC = () => {
  const searchParams = useSearchParams();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <ResultCard
        message={`${searchParams.get("message")}`}
        returnHref="/settings/notification"
        returnText="通知設定に戻る"
        status="danger"
        title="通知設定失敗"
      />
    </div>
  );
};

TestRunFailedPage.displayName = "TestRunFailedPage";

export default TestRunFailedPage;
