import { HandConfirmation } from "@/components/hand-confirmation";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { useActionStore } from "../_utils/state";
import { SelectAction } from "./select-action";

export const ActionArea = ({
  rankPromise,
}: {
  rankPromise: Promise<CombinedPayload>;
}) => {
  const {
    phase,
    position,
    hand,
    board,
    river,
    showedHand,
    showHand,
    preflopAction,
    postflopAction,
  } = useActionStore();

  const handleOnPostflopAction = async (answer: "commit" | "fold") => {
    const result = await rankPromise;
    postflopAction(phase, answer, result);
  };

  const handleFoldAction = () => {
    if (phase === "preflop") {
      preflopAction("fold");
    } else {
      handleOnPostflopAction("fold");
    }
  };

  return (
    <div className="relative pt-6">
      <HandConfirmation
        hands={hand}
        onOpenHand={showHand}
        onFold={handleFoldAction}
        disabledFold={!!river}
      />
      {showedHand && (
        <div className="absolute top-0 left-0 h-full w-1/2 pt-6">
          <SelectAction onAction={handleOnPostflopAction} />
        </div>
      )}
    </div>
  );
};
