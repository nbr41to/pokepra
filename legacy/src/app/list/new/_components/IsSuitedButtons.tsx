import { Button } from "@/components/ui/button";
import { cn } from "@/utils/classNames";
import { FaEquals, FaNotEqual } from "react-icons/fa";

type Props = {
  suited: boolean;
  onClick: (suited: boolean) => void;
};

export const IsSuitedButtons = ({ suited, onClick }: Props) => {
  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "flex-grow gap-x-2",
          !suited && "outline outline-2 outline-slate-400",
        )}
        onClick={() => onClick(false)}
      >
        <FaNotEqual size={24} />
        OF SUIT
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "flex-grow gap-x-2",
          suited && "outline outline-2 outline-slate-400",
        )}
        onClick={() => onClick(true)}
      >
        <FaEquals size={24} />
        SUITED
      </Button>
    </>
  );
};
