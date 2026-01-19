import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TipsPageProps = HTMLAttributes<HTMLDivElement>;

export const TipsPage = ({ className, ...props }: TipsPageProps) => {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-6 py-10",
        className,
      )}
      {...props}
    />
  );
};
