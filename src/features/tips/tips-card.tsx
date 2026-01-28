import { Slot } from "@radix-ui/react-slot";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

export const TipsCard = ({ asChild = false, className, ...props }: Props) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(
        "space-y-3 rounded-lg border bg-card p-5 shadow-sm [&_h2]:font-bold [&_p]:text-muted-foreground [&_p]:text-sm/normal",
        className,
      )}
      {...props}
    />
  );
};
