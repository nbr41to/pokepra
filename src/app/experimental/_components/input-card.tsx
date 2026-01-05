"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const InputCard = ({ value, onChange, placeholder }: Props) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onBlur={(e) => {
              const related = e.relatedTarget as Node | null;
              if (
                related &&
                (anchorEl?.contains(related) ||
                  document
                    .getElementById("input-card-content")
                    ?.contains(related))
              ) {
                return;
              }
              setOpen(false);
            }}
            ref={setAnchorEl}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            className="w-full"
          />
        </PopoverAnchor>
        <PopoverContent
          id="input-card-content"
          align="start"
          onInteractOutside={(event) => {
            const target = event.target as Node | null;
            if (anchorEl && anchorEl.contains(target)) {
              event.preventDefault();
              return;
            }
            setOpen(false);
          }}
        >
          Place content for the popover here.
        </PopoverContent>
      </Popover>
    </div>
  );
};
