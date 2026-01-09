"use client";

import { useState } from "react";
import { SuitIcon } from "@/components/ui/suit-icon";
import { cn } from "@/lib/utils";

type Props = {
  suit: "s" | "h" | "d" | "c";
};

export const SwitchSuitIcon = ({ suit }: Props) => {
  const [colored, setColored] = useState(false);

  return (
    <SuitIcon
      data-suit={suit}
      className={cn(
        colored &&
          "data-[suit=c]:text-green-400 data-[suit=d]:text-orange-400 data-[suit=h]:text-pink-400 data-[suit=s]:text-blue-400 dark:data-[suit=c]:text-green-600 dark:data-[suit=d]:text-orange-600 dark:data-[suit=h]:text-pink-600 dark:data-[suit=s]:text-blue-600",
      )}
      suit={suit}
      onClick={() => setColored(!colored)}
    />
  );
};
