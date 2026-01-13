import { Fragment } from "react/jsx-runtime";
import { cn } from "@/lib/utils";

type Props = {
  total: number;
  value: number;
  setValue: (value: number) => void;
};

export function SelectPosition({ total, value, setValue }: Props) {
  return (
    <div className="flex w-full flex-wrap justify-center gap-x-1 pt-2">
      {Array.from({ length: total }).map((_, index) => {
        let label = "";
        if (index === 0) label = "UTG";
        else if (index === total - 3) label = "BTN";
        else if (index === total - 2) label = "SB";
        else if (index === total - 1) label = "BB";
        else label = `+${index.toString()}`;

        return (
          <Fragment key={index + label}>
            <button
              type="button"
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-background font-bold font-noto-sans-jp text-[10px]/[1]",
                value === index + 1 && "bg-blue-500 text-white"
              )}
              onClick={() => setValue(index + 1)}
            >
              {label}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
