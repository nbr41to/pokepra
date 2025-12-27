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
import { ScrollArea } from "@/components/ui/scroll-area";
import { PokerModules } from "./poker-modules";
import { Button } from "./ui/button";

type Props = {
  hand: string[];
  board: string[];
  disabled?: boolean;
};

export const ConfirmComboButton = ({
  hand,
  board,
  disabled = false,
}: Props) => {
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
        <ScrollArea className="h-120">
          <PokerModules hand={hand} board={board} />
        </ScrollArea>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
