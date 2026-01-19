import { Suspense } from "react";
import { ResultBad } from "@/components/result-bad";
import { ResultGood } from "@/components/result-good";
import { parseRangeToHands } from "@/lib/wasm/simulation";
import {
  getRangeStrengthByPosition,
  getSettingOpenRange,
} from "@/utils/hand-range";
import { useTrainerStore } from "./_utils/state";
import { RangeTable, RangeTableSkeleton } from "./range-table";

export const ResultArea = () => {
  const { finished, position, hero, delta } = useTrainerStore();

  const ranges = getSettingOpenRange();
  const range = ranges[getRangeStrengthByPosition(position, 9) - 1];
  const rangeCombos = parseRangeToHands({ range });

  return (
    <div className="grid w-full place-items-center gap-y-2">
      {finished && (
        <Suspense fallback={<RangeTableSkeleton />}>
          <RangeTable combosPromise={rangeCombos} hero={hero} />
        </Suspense>
      )}
      <div className="h-8">
        {delta > 0 && <ResultGood delta={delta} />}
        {delta < 0 && <ResultBad delta={delta} />}
      </div>
    </div>
  );
};
