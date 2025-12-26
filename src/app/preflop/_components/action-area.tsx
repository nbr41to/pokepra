"use client";

import { useState } from "react";
import { HandConfirmation } from "@/components/hand-confirmation";
import { genBoard } from "@/utils/dealer";
import { useActionStore } from "../_utils/state";
import { SelectAction } from "./select-action";

export const ActionArea = () => {
  const { hands, showHand, setBoard } = useActionStore();
  const [visibleSelectAction, setVisibleSelectAction] = useState(false);

  const handleOpenHand = () => {
    showHand();
    setVisibleSelectAction(true);
    setBoard(genBoard(3));
  };

  return (
    <div className="relative">
      <HandConfirmation hands={hands} onOpenHand={handleOpenHand} />
      {visibleSelectAction && (
        <div className="absolute top-5 left-5 aspect-video w-full">
          <SelectAction />
        </div>
      )}
    </div>
  );
};
