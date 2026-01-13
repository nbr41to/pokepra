import { ArrowRight } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { getPositionLabel } from "@/utils/position";

type Props = {
  total: number;
  playerPosition: number;
};

export function Position({ total, playerPosition }: Props) {
  return (
    <div className="flex w-full justify-center gap-x-px pt-2">
      {Array.from({ length: total }).map((_, index) => {
        const positionValue =
          index + 3 > total ? (index + 3) % total : index + 3;
        const isPlayer = positionValue === playerPosition;
        const label = getPositionLabel(positionValue, total);

        return (
          <Fragment key={index + label}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 font-bold font-noto-sans-jp text-[10px]/[1]",
                  isPlayer
                    ? "border-red-500 bg-red-100 dark:border-red-600 dark:bg-red-900"
                    : "border-gray-300",
                )}
              >
                {!isPlayer && label}
              </div>
              <div className="h-3.75 font-bold text-[10px] text-red-500 dark:text-red-600">
                {isPlayer && "YOU"}
              </div>
            </div>
            {index !== total - 1 && <ArrowRight size={8} className="mt-2.5" />}
          </Fragment>
        );
      })}
    </div>
  );
}
