import { Table2 } from "lucide-react";
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
import { RangeTable } from "./range-table";
import { Button } from "./ui/button";

type Props = {
  mark?: string;
  disabled?: boolean;
  className?: string;
};

export const ConfirmRangeButton = ({
  mark,
  disabled = false,
  className,
}: Props) => {
  return (
    <Drawer direction="top">
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
        <div className="mx-auto w-fit px-1">
          <RangeTable mark={mark} />
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
