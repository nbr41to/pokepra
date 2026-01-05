import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onClick: () => void;
};

export const DeleteButton = ({ onClick }: Props) => {
  return (
    <button
      type="button"
      className={cn(
        "relative grid size-15 place-items-center rounded-lg border-2 bg-background p-3 shadow active:top-px active:left-px active:bg-gray-300 disabled:opacity-40 disabled:shadow-none dark:disabled:opacity-20 dark:active:bg-gray-800",
      )}
      onClick={onClick}
    >
      <Delete size={28} />
    </button>
  );
};
