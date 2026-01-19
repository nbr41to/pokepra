import { Slot } from "@radix-ui/react-slot";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
type Variant = "solid" | "glass";

const sizeClasses: Record<Size, string> = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const variantClasses: Record<Variant, string> = {
  solid: "rounded-lg border bg-card shadow-sm",
  glass:
    "rounded-2xl border border-black/10 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70",
};

type TipsCardProps = HTMLAttributes<HTMLDivElement> & {
  size?: Size;
  variant?: Variant;
  asChild?: boolean;
};

export const TipsCard = ({
  size = "md",
  variant = "solid",
  asChild = false,
  className,
  ...props
}: TipsCardProps) => {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
};
