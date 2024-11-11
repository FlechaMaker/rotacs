"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import ResultCard from "@/components/result-card";

const TestRunFailedPage: React.FC = () => {
  const searchParams = useSearchParams();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <ResultCard
        message={`テストラン予約に失敗しました．${searchParams.get("message")}`}
        returnHref="/testrun"
        returnText="テストラン一覧ページに戻る"
        status="danger"
        title="予約失敗"
      />
    </div>
  );
};

TestRunFailedPage.displayName = "TestRunFailedPage";

export default TestRunFailedPage;
