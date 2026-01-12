import { Fragment } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";

type Props = {
  total: number;
  setValue: (value: string) => void;
  excludes?: string[];
};

export function SetRangeHands({ total, setValue, excludes = [] }: Props) {
  return (
    <div className="flex w-full flex-wrap justify-center gap-x-1 pt-2">
      {Array.from({ length: total }).map((_, index) => {
        let label = "";
        if (index === 0) label = "UTG";
        else if (index === total - 3) label = "BTN";
        else if (index === total - 2) label = "SB";
        else if (index === total - 1) label = "BB";
        else label = `+${index.toString()}`;

        const tierIndex = getTierIndexByPosition(index + 1, total);
        const hands = getHandsByTiers(tierIndex, excludes);

        return (
          <Fragment key={index + label}>
            <button
              type="button"
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 border-gray-300 font-bold font-noto-sans-jp text-[10px]/[1]",
              )}
              onClick={() => setValue(hands.map((h) => h.join(" ")).join("; "))}
            >
              {label}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
