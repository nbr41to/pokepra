import { Button } from "@/components/ui/button";
import { cn } from "@/utils/classNames";
import {
  PiClubFill,
  PiDiamondFill,
  PiHeartFill,
  PiSpadeFill,
} from "react-icons/pi";

type Props = {
  hand: string;
  onClick: (value: string) => void;
};

export const SuitButtons = ({ hand, onClick }: Props) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "flex-grow",
          hand.startsWith("s") && "outline outline-2 outline-slate-400",
        )}
        onClick={() => onClick("s")}
      >
        <PiSpadeFill className="fill-blue-500" size={24} />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "flex-grow",
          hand.startsWith("c") && "outline outline-2 outline-slate-400",
        )}
        onClick={() => onClick("c")}
      >
        <PiClubFill className="fill-green-500" size={24} />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "flex-grow",
          hand.startsWith("h") && "outline outline-2 outline-slate-400",
        )}
        onClick={() => onClick("h")}
      >
        <PiHeartFill className="fill-red-500" size={24} />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "flex-grow",
          hand.startsWith("d") && "outline outline-2 outline-slate-400",
        )}
        onClick={() => onClick("d")}
      >
        <PiDiamondFill className="fill-orange-500" size={24} />
      </Button>
    </div>
  );
};
