import { GiCardJoker } from "react-icons/gi";
import { CardIcon } from "./CardIcon";
import { cn } from "@/utils/classNames";

type Open = {
  back?: false | undefined;
  value: string;
  size?: number;
  focus?: boolean;
};
type Back = {
  back: true;
  value?: undefined;
  size?: number;
  focus?: boolean;
};
type Props = Open | Back;

export const PlayCard = ({ value, back, size = 40, focus = false }: Props) => {
  return (
    <div
      className={cn(
        `size-[${size}px]`,
        focus && "rounded-lg outline outline-2 outline-indigo-300",
      )}
    >
      {back ? (
        <GiCardJoker size={size} />
      ) : (
        <CardIcon size={size} value={value} />
      )}
    </div>
  );
};
