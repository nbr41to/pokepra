import { Button } from "@/components/ui/button";
import { cn } from "@/utils/classNames";
import {
  PiClubFill,
  PiDiamondFill,
  PiHeartFill,
  PiSpadeFill,
} from "react-icons/pi";
import { BsPersonFillAdd, BsPersonFillDash } from "react-icons/bs";

type Props = {
  current: number;
  increment: () => void;
  decrement: () => void;
};

export const PeopleCounter = ({ current, increment, decrement }: Props) => {
  return (
    <div className="flex items-center justify-center gap-6">
      <Button variant="secondary" size="icon" onClick={decrement}>
        <BsPersonFillDash size={24} />
      </Button>
      <p className="text-lg font-bold">
        {current} <span className="text-sm">players</span>
      </p>
      <Button variant="secondary" size="icon" onClick={increment}>
        <BsPersonFillAdd size={24} />
      </Button>
    </div>
  );
};
