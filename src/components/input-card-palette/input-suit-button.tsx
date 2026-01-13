import { cn } from "@/lib/utils";
import type { CARD_SUIT } from "@/utils/card";
import { SuitIcon } from "../ui/suit-icon";

type Props = {
  suit: CARD_SUIT;
  onClick: () => void;
  pending?: boolean; // 入力中
  disabled?: boolean;
};

export const InputSuitButton = ({
  suit,
  onClick,
  pending,
  disabled,
}: Props) => {
  return (
    <button
      type="button"
      className={cn(
        "relative grid size-15 place-items-center rounded-lg border-2 bg-background p-3 shadow active:top-px active:left-px active:bg-gray-300 disabled:opacity-50 disabled:shadow-none dark:active:bg-gray-800",
        pending && "top-px left-px bg-gray-300 shadow-none dark:bg-gray-800",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <SuitIcon
        className={cn(
          suit === "s" && "text-blue-400 dark:text-blue-600",
          suit === "h" && "text-pink-400 dark:text-pink-600",
          suit === "d" && "text-orange-400 dark:text-orange-600",
          suit === "c" && "text-green-400 dark:text-green-600",
        )}
        suit={suit}
        size={32}
        strokeWidth={2.5}
      />
    </button>
  );
};
