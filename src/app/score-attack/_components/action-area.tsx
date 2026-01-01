import { HandConfirmation } from "@/components/hand-confirmation";
import { useActionStore } from "../_utils/state";
import { SelectAction } from "./select-action";

export const ActionArea = () => {
  const { hand, showedHand, showHand } = useActionStore();

  return (
    <div className="relative">
      <HandConfirmation hands={hand} onOpenHand={showHand} />
      {showedHand && (
        <div className="absolute top-0 left-0 aspect-video w-full p-5">
          <SelectAction />
        </div>
      )}
    </div>
  );
};
