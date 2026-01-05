"use client";

import { useEffect } from "react";
import { StackView } from "@/components/stack-view";
import { ActionArea } from "./_components/action-area";
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
    <div className="flex h-dvh w-full flex-col items-center justify-end gap-y-8 p-2 pb-10">
      <ConfirmPosition />
      <StackView stack={stack} />
      <div className="w-full space-y-2">
        <ResultArea />
        <ActionArea />
      </div>
    </div>
  );
}
