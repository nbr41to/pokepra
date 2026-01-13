import { Fragment } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import {
  getHandsInRange,
  getRangeStrengthByPosition,
} from "@/utils/hand-range";
import { getPositionLabel } from "@/utils/position";

type Props = {
  total: number;
  setValue: (value: string) => void;
  excludes?: string[];
};

export function SetRangeHands({ total, setValue, excludes = [] }: Props) {
  return (
    <div className="flex w-full flex-wrap justify-center gap-x-1 pt-2">
      {Array.from({ length: total }).map((_, index) => {
        const positionValue =
          index + 3 > total ? (index + 3) % total : index + 3;
        const label = getPositionLabel(positionValue, total);

        const strength = getRangeStrengthByPosition(positionValue, total);
        const hands =
          strength === -1 ? [] : getHandsInRange(strength, excludes);

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
