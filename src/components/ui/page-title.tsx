"use client";

import { Info, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../shadcn/button";

type Props = {
  title: string;
  description?: string;
  hidable?: boolean;
};

export const PageTitle = ({ title, description, hidable = false }: Props) => {
  const [hidden, setHidden] = useState(false);

  if (hidden)
    return (
      <Button
        className="fixed top-0 left-0 z-10"
        size="icon-sm"
        variant="ghost"
        onClick={() => setHidden(false)}
      >
        <Info />
      </Button>
    );

  return (
    <div className="grid w-full place-content-center p-2">
      <div className="relative w-fit">
        <h1 className="text-lg">{title}</h1>{" "}
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
        <p className="mt-1 whitespace-pre-wrap text-muted-foreground text-xs leading-normal">
          {description}
        </p>
      )}
    </div>
  );
};
