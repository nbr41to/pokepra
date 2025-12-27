"use client";

import { HandConfirmation } from "@/components/hand-confirmation";
import { useActionStore } from "../_utils/state";
import { SelectAction } from "./select-action";

export const ActionArea = () => {
  const { hands, showedHand, setShowedHand, setBoard } = useActionStore();

  const handleOpenHand = () => {
    setShowedHand(true);
    setBoard();
  };

  return (
    <div className="relative">
      <HandConfirmation hands={hands} onOpenHand={handleOpenHand} />
      {showedHand && (
        <div className="absolute top-5 left-5 aspect-video w-full">
          <SelectAction />
        </div>
      )}
    </div>
  );
};
