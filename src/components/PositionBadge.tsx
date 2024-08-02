"use client";

import { Badge } from "@/components/ui/badge";

type Props = {
  position: string;
  active?: boolean;
  onClick?: () => void;
};

export const PositionBadge = ({ position, active = true, onClick }: Props) => {
  return (
    <Badge
      className="h-6 cursor-pointer select-none whitespace-nowrap"
      variant={active ? "default" : "secondary"}
      onClick={onClick}
    >
      {position.startsWith("utg") ? (
        <span className="text-xs">
          UTG{!!Number(position.split("-")[1]) && `+${position.split("-")[1]}`}
        </span>
      ) : (
        <span className="text-xs">{position.toUpperCase()}</span>
      )}
    </Badge>
  );
};
