import { Fragment } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { getPositionLabel } from "@/utils/position";

type Props = {
  total: number;
  value: number;
  setValue: (value: number) => void;
};

export function SelectPosition({ total, value, setValue }: Props) {
  return (
    <div className="flex w-full flex-wrap justify-center gap-x-1 pt-2">
      {Array.from({ length: total }).map((_, index) => {
        const positionValue =
          index + 3 > total ? (index + 3) % total : index + 3;
        const label = getPositionLabel(positionValue, total);

        return (
          <Fragment key={index + label}>
            <button
              type="button"
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-background font-bold font-noto-sans-jp text-[10px]/[1]",
                value === positionValue && "bg-blue-500 text-white",
              )}
              onClick={() => setValue(positionValue)}
            >
              {label}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
