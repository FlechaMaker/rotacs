import React from "react";

import ResultCard from "@/components/result-card";

const DeleteUserSuccessPage = React.forwardRef<React.JSX.Element, {}>(
  (_props, _ref) => {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <ResultCard
          message="ユーザーの削除に成功しました"
          returnHref="/settings/users"
          returnText="ユーザー設定ページに戻る"
          status="success"
          title="削除成功"
        />
      </div>
    );
  },
);

DeleteUserSuccessPage.displayName = "DeleteUserSuccessPage";

export default DeleteUserSuccessPage;
