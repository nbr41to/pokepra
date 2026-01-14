import { CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onClick: () => void;
  className?: string;
};

export const EnterButton = ({ onClick, className }: Props) => {
  return (
    <button
      type="button"
      className={cn(
        "x-15 y-31 relative grid place-items-center rounded-lg border-2 bg-background p-3 shadow active:top-px active:left-px active:bg-gray-300 disabled:opacity-40 disabled:shadow-none dark:disabled:opacity-20 dark:active:bg-gray-800",
        className,
      )}
      onClick={onClick}
    >
      <CornerDownLeft size={28} />
    </button>
  );
};
