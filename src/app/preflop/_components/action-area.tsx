import { HandConfirmation } from "@/components/hand-confirmation";
import { useActionStore } from "../_utils/state";
import { PreflopAction } from "./preflop-action";

export const ActionArea = () => {
  const { hand, showedHand, showHand, preflopAction } = useActionStore();

  return (
    <div className="relative pt-6">
      <HandConfirmation
        hands={hand}
        onOpenHand={showHand}
        onFold={() => preflopAction("fold")}
      />
      {showedHand && (
        <div className="absolute top-0 left-0 h-full w-1/2 pt-6">
          <PreflopAction />
        </div>
      )}
    </div>
  );
};
