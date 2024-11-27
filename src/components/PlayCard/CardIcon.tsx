import type { IconBaseProps } from "react-icons";
import {
  BsFillSuitClubFill,
  BsFillSuitDiamondFill,
  BsFillSuitHeartFill,
  BsFillSuitSpadeFill,
} from "react-icons/bs";

type Props = {
  suit: string;
  size: number;
} & IconBaseProps;

export const CardIcon = ({ suit, size, ...props }: Props) => {
  const colorClass = {
    s: "fill-blue-500",
    h: "fill-red-500",
    d: "fill-orange-500",
    c: "fill-green-500",
  }[suit];

  switch (suit) {
    case "c":
      return (
        <BsFillSuitClubFill size={size} className={colorClass} {...props} />
      );
    case "d":
      return (
        <BsFillSuitDiamondFill size={size} className={colorClass} {...props} />
      );
    case "h":
      return (
        <BsFillSuitHeartFill size={size} className={colorClass} {...props} />
      );
    default:
      return (
        <BsFillSuitSpadeFill size={size} className={colorClass} {...props} />
      );
  }
};
