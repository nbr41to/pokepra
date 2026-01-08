import { ChartColumnStacked, X } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { PlayCard } from "../play-card";
import { EquityChart } from "./equity-chart";

type Props = {
  board: string[];
  rankPromise: Promise<CombinedPayload>;
  disabled?: boolean;
  className?: string;
};

export const ConfirmEquityDrawer = ({
  board,
  rankPromise,
  disabled = false,
  className,
}: Props) => {
  return (
    <Drawer direction="bottom">
      <DrawerTrigger
        asChild
        onClick={(e) => {
          // Blocked aria-hidden on an element の警告回避
          e.currentTarget.blur();
        }}
      >
        <Button
          className={cn("rounded-full", className)}
          variant="outline"
          size="icon-lg"
          disabled={disabled}
        >
          <ChartColumnStacked size={16} />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Equity density</DrawerTitle>
          <div className="flex items-center gap-x-4 py-1">
            <div className="flex gap-x-1">
              {board.map((card) => (
                <PlayCard key={card} className="w-8" size="sm" rs={card} />
              ))}
            </div>
            <DrawerDescription className="text-left">
              Simulated equity distribution based on the current board.
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <Suspense fallback="loading...">
          <EquityChart promise={rankPromise} />
        </Suspense>

        <DrawerFooter className="absolute bottom-6 left-0 z-10 w-full">
          <DrawerClose asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-90"
            >
              <X />
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
