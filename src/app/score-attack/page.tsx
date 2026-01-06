"use client";

import { useEffect } from "react";
import { StackView } from "@/components/stack-view";
import { ActionArea } from "./_components/action-area";
import { CommunityBoard } from "./_components/community-board";
import { ConfirmPosition } from "./_components/confirm-position";
import { ResultArea } from "./_components/result-area";
import { useActionStore } from "./_utils/state";

export default function Page() {
  const { stack, shuffleAndDeal, reset } = useActionStore();

  useEffect(() => {
    shuffleAndDeal();

    return reset;
  }, [shuffleAndDeal, reset]);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-end gap-y-8 p-2 pb-8">
      <CommunityBoard />
      <div className="flex flex-col items-end space-y-1">
        <ConfirmPosition />
        <StackView stack={stack} />
      </div>
      <div className="w-full space-y-2">
        <ResultArea />
        <ActionArea />
      </div>
    </div>
  );
}
