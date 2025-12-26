"use client";

import { useEffect } from "react";
import { genHands } from "@/utils/dealer";
import { ActionArea } from "./_components/action-area";
import { CommunityBoard } from "./_components/community-board";
import { ConfirmPosition } from "./_components/confirm-position";
import { Result } from "./_components/result";
import { useActionStore } from "./_utils/state";

export default function Page() {
  const { setPosition, setHands } = useActionStore();

  useEffect(() => {
    const newHands = genHands();
    setPosition();
    setHands(newHands);
  }, [setPosition, setHands]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between gap-y-8 p-2">
      <ConfirmPosition />
      <CommunityBoard />
      <div className="space-y-2">
        <Result />
        <ActionArea />
      </div>
    </div>
  );
}
