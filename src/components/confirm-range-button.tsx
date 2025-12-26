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
import { RangeTable } from "./range-table";
import { Button } from "./ui/button";

type Props = {
  mark?: string;
  disabled?: boolean;
};

export const ConfirmRangeButton = ({ mark, disabled }: Props) => {
  return (
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <Button
          className="rounded-full"
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
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto w-fit">
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
