import { CheckCircle, CircleX } from "lucide-react";
import { ConfirmRangeButton } from "@/components/confirm-range-button";
import { getHandString } from "@/utils/getResult";
import { useActionStore } from "../_utils/state";

export const Result = () => {
  const { phase, state, hands, getResult } = useActionStore();
  const handString = getHandString(hands);

  return (
    <div className="flex items-center justify-between">
      <div />

      {state === "result" &&
        (getResult() ? (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle size={32} strokeWidth={2.5} />
            <span className="text-2xl">GOOD</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500">
            <CircleX size={32} strokeWidth={2.5} />
            <span className="text-2xl">BAD</span>
          </div>
        ))}

      <ConfirmRangeButton mark={handString} disabled={state !== "result"} />
    </div>
  );
};
