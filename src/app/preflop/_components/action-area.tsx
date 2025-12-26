"use client";

import { HandConfirmation } from "@/components/hand-confirmation";
import { genBoard } from "@/utils/dealer";
import { useActionStore } from "../_utils/state";
import { SelectAction } from "./select-action";

export const ActionArea = () => {
  const { hands, showedHand, showHand, setBoard } = useActionStore();

  const handleOpenHand = () => {
    showHand();
    setBoard(genBoard(3));
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
