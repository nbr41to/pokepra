import { Fragment } from "react/jsx-runtime";
import { ConfirmComboButton } from "@/components/confirm-combo-button";
import { useActionStore } from "../_utils/state";

export const Result = () => {
  const { state, hands, board, getOdds } = useActionStore();

  const odds = getOdds();

  return (
    <div className="flex items-center justify-between">
      <div />

      {state === "result" && odds && (
        <div className="grid grid-cols-2 gap-x-2 text-green-500">
          {Object.values(odds[0].handChances)
            // @ts-expect-error
            .filter((o) => o.count)
            .map((o) => (
              // @ts-expect-error
              <Fragment key={o.name}>
                {/* @ts-expect-error */}
                <div>{o.name}</div>
                {/* @ts-expect-error */}
                <div className="w-8 text-right">{o.count}%</div>
              </Fragment>
            ))}
        </div>
      )}

      {hands.length === 2 && <ConfirmComboButton hand={hands} board={board} />}
    </div>
  );
};
