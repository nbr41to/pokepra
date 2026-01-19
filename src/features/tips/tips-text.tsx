import { Slot } from "@radix-ui/react-slot";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TipsTextProps = HTMLAttributes<HTMLParagraphElement> & {
  asChild?: boolean;
};

export const TipsText = ({
  asChild = false,
  className,
  ...props
}: TipsTextProps) => {
  const Component = asChild ? Slot : "p";

  return (
    <Component
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  );
};
