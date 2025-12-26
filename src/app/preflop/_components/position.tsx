import { ArrowRight } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

type Props = {
  total: number;
  playerPosition: number;
};

export function Position({ total, playerPosition }: Props) {
  return (
    <div className="flex items-center justify-center gap-x-px rounded-full border px-4 py-2">
      {Array.from({ length: total }).map((_, index) => {
        let label = "";
        if (index === 0) label = "UTG";
        else if (index === total - 3) label = "BTN";
        else if (index === total - 2) label = "SB";
        else if (index === total - 1) label = "BB";

        const isPlayer = index === playerPosition;

        return (
          <Fragment key={index + label}>
            <div className="flex flex-col items-center">
              <div className="h-3.75 font-bold text-[10px] text-red-500">
                {isPlayer && "YOU"}
              </div>
              <div
                className={`flex size-6 items-center justify-center rounded-full border-2 ${
                  isPlayer ? "border-red-500 bg-red-100" : "border-gray-300"
                }`}
              />
              <div className="font-bold font-noto-sans-jp text-[10px]">
                {label || `+${index.toString()}`}
              </div>
            </div>
            {index !== total - 1 && <ArrowRight size={8} />}
          </Fragment>
        );
      })}
    </div>
  );
}
