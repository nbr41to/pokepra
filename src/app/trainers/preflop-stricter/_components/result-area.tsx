import { RangeTable } from "@/components/range-table";
import { ResultBad } from "@/components/result-bad";
import { ResultGood } from "@/components/result-good";
import { toHandSymbol } from "@/utils/hand-range";
import { useTrainerStore } from "./_utils/state";

export const ResultArea = () => {
  const { finished, hero, delta, correctRange } = useTrainerStore();

  return (
    <div className="grid w-full place-items-center gap-y-2">
      <RangeTable
        data={finished ? correctRange.map((hand) => toHandSymbol(hand)) : []}
        mark={finished ? toHandSymbol(hero) : undefined}
      />
      <div className="h-8">
        {delta > 0 && <ResultGood />}
        {delta < 0 && <ResultBad />}
      </div>
    </div>
  );
};
