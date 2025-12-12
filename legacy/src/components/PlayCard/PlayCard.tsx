import { GiCardJoker } from "react-icons/gi";
import { CardIcon } from "./CardIcon";
import { cn } from "@/utils/classNames";
import { GiSuits } from "react-icons/gi";

type Props = {
  value?: string;
  size?: number;
  fontSize?: number;
};

export const PlayCard = ({ value, size = 40, fontSize = 16 }: Props) => {
  const suit = value?.split("-")[0];
  const colorClass = {
    h: "text-red-500",
    d: "text-orange-500",
    s: "text-blue-500",
    c: "text-green-500",
  };
  const rank = value?.split("-")[1];

  return (
    <div
      className={cn(
        `h-[${size}px] flex aspect-[4/5] flex-col items-center justify-evenly rounded border-4 border-double bg-slate-50`,
      )}
    >
      {suit && rank ? (
        <>
          <CardIcon suit={suit} size={size / 3} />
          <div
            className={cn(
              colorClass[suit as keyof typeof colorClass],
              `text-[${fontSize}px]`,
              "font-bold",
            )}
          >
            {rank}
          </div>
        </>
      ) : (
        <GiSuits size={size / 2} className="fill-background" />
      )}
    </div>
  );
};
