import { ScrollText, X } from "lucide-react";
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

export type ActionHistoryEntry = {
  id: number;
  street: "preflop" | "flop" | "turn" | "river";
  actor: "hero" | "bb";
  action: "bet" | "raise";
  amount: number | null;
};

type Props = {
  items: ActionHistoryEntry[];
  disabled?: boolean;
  className?: string;
};

const formatStreet = (street: ActionHistoryEntry["street"]) =>
  street.charAt(0).toUpperCase() + street.slice(1);

const formatActor = (actor: ActionHistoryEntry["actor"]) =>
  actor === "hero" ? "YOU" : "BB";

export const ActionHistoryDrawer = ({
  items,
  disabled = false,
  className,
}: Props) => {
  const content = items.length === 0;

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
          <ScrollText size={16} />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Bet & Raise History</DrawerTitle>
          <DrawerDescription>
            Track bets and raises during the current hand.
          </DrawerDescription>
        </DrawerHeader>

        <div className="mx-auto w-full max-w-sm space-y-2 px-4 pb-20 text-sm">
          {content ? (
            <p className="text-muted-foreground">No bets or raises yet.</p>
          ) : (
            <div className="space-y-2">
              {items
                .slice()
                .reverse()
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-background/60 px-3 py-2"
                  >
                    <div className="font-medium">
                      {formatStreet(entry.street)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatActor(entry.actor)} {entry.action.toUpperCase()}
                    </div>
                    <div className="text-right font-semibold">
                      {entry.amount !== null ? `${entry.amount} BB` : "-"}
                    </div>
                  </div>
                ))}
            </div>
          )}
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
