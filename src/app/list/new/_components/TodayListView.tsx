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
import { FaListUl, FaUserGroup } from "react-icons/fa6";
import { PositionRangeButton } from "@/components/PositionRangeButton";
import { toHandString } from "@/utils/toHandString";

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
                <div className="flex items-center gap-x-3">
                  <p className="w-5 font-bold">{index + 1}.</p>
                  <div className="w-8 font-bold">
                    {toHandString(hand.preflop)}
                  </div>
                  <div className="w-14">
                    <Badge
                      className="ml-2"
                      variant={
                        hand.action === "fold"
                          ? "outline"
                          : hand.action === "3bet"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {hand.action}
                    </Badge>
                  </div>

                  <p className="flex items-center gap-x-1 text-sm font-bold">
                    <FaUserGroup size={14} />
                    {hand.people}
                  </p>
                </div>

                <div>
                  <PositionRangeButton secondary position={hand.position} />
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
