import { Boxes, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const cardBackConfig: Record<string, LucideIcon> = {
  Boxes: Boxes,
};

type CardBackIconSize = "sm" | "md" | "lg";

const sizeConfig: Record<
  CardBackIconSize,
  { px: number; strokeWidth: number }
> = {
  sm: { px: 12, strokeWidth: 1.5 },
  md: { px: 18, strokeWidth: 1.5 },
  lg: { px: 40, strokeWidth: 1.5 },
};

type CardBackIconProps = {
  size?: CardBackIconSize;
  className?: string;
};

export function CardBackIcon({ size = "md", className }: CardBackIconProps) {
  const Icon = cardBackConfig["Boxes"];
  const { px, strokeWidth } = sizeConfig[size];

  return <Icon size={px} strokeWidth={strokeWidth} className={cn(className)} />;
}
