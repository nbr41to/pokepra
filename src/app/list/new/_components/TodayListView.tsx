import { PlayCard } from "@/components/PlayCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FaListUl } from "react-icons/fa6";
import { PositionBadge } from "@/components/PositionBadge";
import { PositionRangeButton } from "@/components/PositionRangeButton";

type Props = {
  hands: Hand[];
};

export const TodayListView = ({ hands }: Props) => {
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <FaListUl size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Today Hands</SheetTitle>
            <SheetDescription>Storage period is 30 days.</SheetDescription>
          </SheetHeader>

          <div className="divide-y py-4">
            {hands.map((hand, index) => (
              <div key={index} className="flex justify-between py-2">
                <div className="flex items-center">
                  <p className="w-5 font-bold">{index + 1}.</p>
                  <PlayCard value={hand.preflop[0]} size={40} />
                  <PlayCard value={hand.preflop[1]} size={40} />

                  <Badge
                    className="ml-2"
                    variant={hand.isJoin ? "destructive" : "outline"}
                  >
                    {hand.isJoin ? "Join" : "Fold"}
                  </Badge>
                </div>

                <div>
                  <PositionRangeButton position={hand.position} />
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
