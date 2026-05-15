"use client";

import { cn } from "@/lib/utils";
import { getPositionLabel } from "@/utils/position";
import { POOL_PEOPLE } from "./_utils/types";

type Props = {
  position: number;
  className?: string;
};

/**
 * 6max用のヒーローのポジション表示
 */
export const PositionDisplay = ({ position, className }: Props) => {
  if (!position) return null;

  const label = getPositionLabel(position, POOL_PEOPLE);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        className,
      )}
    >
      <span className="font-medium text-xs opacity-70">Position</span>
      <span className="font-bold text-sm">{label}</span>
    </div>
  );
};
