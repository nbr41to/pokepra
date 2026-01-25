import { Table2, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/shadcn/drawer";
import { cn } from "@/lib/utils";
import { RangeTable } from "./range-table";

type Props = {
  mark?: string;
  disabled?: boolean;
  className?: string;
};

export const HandRangeDrawer = ({
  mark,
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
          size="icon-lg"
          disabled={disabled}
        >
          <Table2 size={16} />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Preflop Range</DrawerTitle>
          <DrawerDescription>
            Confirm your selected hand range below.
          </DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto w-fit px-2 pb-20">
          <RangeTable mark={mark} />
        </div>

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
