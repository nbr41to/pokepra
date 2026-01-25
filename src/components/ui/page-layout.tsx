import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLDivElement>;

export const PageLayout = ({ className, ...props }: Props) => {
  return (
    <div
      className={cn("flex min-h-dvh flex-col gap-6 p-6 pb-24", className)}
      {...props}
    />
  );
};
