"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type Props = {
  title: string;
  description?: string;
  hidable?: boolean;
};

export const HeaderTitle = ({ title, description, hidable = false }: Props) => {
  const [hidden, setHidden] = useState(false);

  if (hidden) return <div className="size-0" />;

  return (
    <div className="grid w-full place-content-center p-2">
      <div className="relative w-fit">
        <h1 className="text-xl">{title}</h1>{" "}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute top-1/2 left-full -translate-y-1/2",
            !hidable && "hidden",
          )}
          onClick={() => setHidden(true)}
          disabled={!hidable}
        >
          <X />
        </Button>
      </div>
      {description && (
        <p className="mt-1 whitespace-pre-wrap text-muted-foreground text-xs">
          {description}
        </p>
      )}
    </div>
  );
};
