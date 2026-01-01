"use client";

import { useEffect } from "react";
import { StackView } from "@/components/stack-view";
import { ActionArea } from "./_components/action-area";
import { CommunityBoard } from "./_components/community-board";
import { ConfirmPosition } from "./_components/confirm-position";
import { Result } from "./_components/result";
import { useActionStore } from "./_utils/state";

export default function Page() {
  const { stack, shuffleAndDeal, reset } = useActionStore();

  useEffect(() => {
    shuffleAndDeal();

    return reset;
  }, [shuffleAndDeal, reset]);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-between gap-y-8 p-2">
      <div className="flex flex-col items-end space-y-1">
        <ConfirmPosition />
        <StackView stack={stack} />
      </div>
      <CommunityBoard />
      <div className="w-full space-y-2">
        <Result />
        <ActionArea />
      </div>
    </div>
  );
}
