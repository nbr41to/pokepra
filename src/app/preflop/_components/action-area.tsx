import { HandConfirmation } from "@/components/hand-confirmation";
import { useActionStore } from "../_utils/state";
import { PreflopAction } from "./preflop-action";

export const ActionArea = () => {
  const { hero, showedHand, showHand, preflopAction } = useActionStore();

  return (
    <div className="relative w-full pt-6">
      <HandConfirmation
        hands={hero}
        onOpenHand={showHand}
        onFold={() => preflopAction("fold")}
        className="bg bg-green-50 dark:bg-green-950/60"
      />
      {showedHand && (
        <div className="absolute top-0 left-0 h-full w-1/2 pt-6">
          <PreflopAction />
        </div>
      )}
    </div>
  );
};
