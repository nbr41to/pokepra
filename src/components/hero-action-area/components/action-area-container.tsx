import type { PointerEvent, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ActionAreaContainerProps = {
  className?: string;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
  children: ReactNode;
};

export const ActionAreaContainer = forwardRef<
  HTMLDivElement,
  ActionAreaContainerProps
>(
  (
    {
      className,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      children,
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-62 w-full touch-none select-none items-center justify-evenly rounded-md border-2 bg-orange-50 dark:bg-orange-950/60",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {children}
    </div>
  ),
);

ActionAreaContainer.displayName = "ActionAreaContainer";
