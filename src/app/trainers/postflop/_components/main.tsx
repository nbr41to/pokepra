"use client";

import { useEffect } from "react";
import { StackView } from "@/components/stack-view";
import { useActionStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { CommunityBoard } from "./community-board";
import { ConfirmPosition } from "./confirm-position";
import { ResultArea } from "./result-area";

export default function Main() {
  const { initialized, stack, shuffleAndDeal, reset } = useActionStore();

  useEffect(() => {
    shuffleAndDeal();
    return reset;
  }, [shuffleAndDeal, reset]);

  if (!initialized) return null;

  return (
    <div className="w-full">
      <CommunityBoard />
      <ConfirmPosition />
      <ResultArea />
      <StackView className="justify-end pb-8" stack={stack} />
      <ActionArea />
    </div>
  );
}
