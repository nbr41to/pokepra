import type { RANKS } from "@/constants/card";
import { cn } from "@/lib/utils";

type Props = {
  rank: (typeof RANKS)[number];
  onClick: () => void;
  pending?: boolean; // 入力中
  disabled?: boolean;
};

export const InputRankButton = ({
  rank,
  onClick,
  pending,
  disabled,
}: Props) => {
  return (
    <button
      type="button"
      className={cn(
        "relative grid size-15 place-items-center rounded-lg border-2 bg-background p-3 text-2xl shadow active:top-px active:left-px active:bg-gray-300 disabled:opacity-40 disabled:shadow-none dark:disabled:opacity-20 dark:active:bg-gray-800",
        pending && "top-px left-px bg-gray-300 shadow-none dark:bg-gray-800",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {rank}
    </button>
  );
};
