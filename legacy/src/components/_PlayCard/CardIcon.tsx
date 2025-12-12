import type { IconBaseProps } from "react-icons";
import {
  GiCard2Clubs,
  GiCard2Diamonds,
  GiCard2Hearts,
  GiCard2Spades,
  GiCard3Clubs,
  GiCard3Diamonds,
  GiCard3Hearts,
  GiCard3Spades,
  GiCard4Clubs,
  GiCard4Diamonds,
  GiCard4Hearts,
  GiCard4Spades,
  GiCard5Clubs,
  GiCard5Diamonds,
  GiCard5Hearts,
  GiCard5Spades,
  GiCard6Clubs,
  GiCard6Diamonds,
  GiCard6Hearts,
  GiCard6Spades,
  GiCard7Clubs,
  GiCard7Diamonds,
  GiCard7Hearts,
  GiCard7Spades,
  GiCard8Clubs,
  GiCard8Diamonds,
  GiCard8Hearts,
  GiCard8Spades,
  GiCard9Clubs,
  GiCard9Diamonds,
  GiCard9Hearts,
  GiCard9Spades,
  GiCard10Clubs,
  GiCard10Diamonds,
  GiCard10Hearts,
  GiCard10Spades,
  GiCardAceClubs,
  GiCardAceDiamonds,
  GiCardAceHearts,
  GiCardAceSpades,
  GiCardJackClubs,
  GiCardJackDiamonds,
  GiCardJackHearts,
  GiCardJackSpades,
  GiCardKingClubs,
  GiCardKingDiamonds,
  GiCardKingHearts,
  GiCardKingSpades,
  GiCardQueenClubs,
  GiCardQueenDiamonds,
  GiCardQueenHearts,
  GiCardQueenSpades,
} from "react-icons/gi";

type Props = {
  value: string;
} & IconBaseProps;

export const CardIcon = ({ value, ...props }: Props) => {
  const suit = value.split("-")[0];
  const colorClass = {
    h: "fill-red-500",
    d: "fill-orange-500",
    s: "fill-blue-500",
    c: "fill-green-500",
  }[suit];

  switch (value) {
    case "h-1":
      return <GiCardAceHearts className={colorClass} {...props} />;
    case "c-1":
      return <GiCardAceClubs className={colorClass} {...props} />;
    case "d-1":
      return <GiCardAceDiamonds className={colorClass} {...props} />;
    case "s-1":
      return <GiCardAceSpades className={colorClass} {...props} />;
    case "h-2":
      return <GiCard2Hearts className={colorClass} {...props} />;
    case "c-2":
      return <GiCard2Clubs className={colorClass} {...props} />;
    case "d-2":
      return <GiCard2Diamonds className={colorClass} {...props} />;
    case "s-2":
      return <GiCard2Spades className={colorClass} {...props} />;
    case "h-3":
      return <GiCard3Hearts className={colorClass} {...props} />;
    case "c-3":
      return <GiCard3Clubs className={colorClass} {...props} />;
    case "d-3":
      return <GiCard3Diamonds className={colorClass} {...props} />;
    case "s-3":
      return <GiCard3Spades className={colorClass} {...props} />;
    case "h-4":
      return <GiCard4Hearts className={colorClass} {...props} />;
    case "c-4":
      return <GiCard4Clubs className={colorClass} {...props} />;
    case "d-4":
      return <GiCard4Diamonds className={colorClass} {...props} />;
    case "s-4":
      return <GiCard4Spades className={colorClass} {...props} />;
    case "h-5":
      return <GiCard5Hearts className={colorClass} {...props} />;
    case "c-5":
      return <GiCard5Clubs className={colorClass} {...props} />;
    case "d-5":
      return <GiCard5Diamonds className={colorClass} {...props} />;
    case "s-5":
      return <GiCard5Spades className={colorClass} {...props} />;
    case "h-6":
      return <GiCard6Hearts className={colorClass} {...props} />;
    case "c-6":
      return <GiCard6Clubs className={colorClass} {...props} />;
    case "d-6":
      return <GiCard6Diamonds className={colorClass} {...props} />;
    case "s-6":
      return <GiCard6Spades className={colorClass} {...props} />;
    case "h-7":
      return <GiCard7Hearts className={colorClass} {...props} />;
    case "c-7":
      return <GiCard7Clubs className={colorClass} {...props} />;
    case "d-7":
      return <GiCard7Diamonds className={colorClass} {...props} />;
    case "s-7":
      return <GiCard7Spades className={colorClass} {...props} />;
    case "h-8":
      return <GiCard8Hearts className={colorClass} {...props} />;
    case "c-8":
      return <GiCard8Clubs className={colorClass} {...props} />;
    case "d-8":
      return <GiCard8Diamonds className={colorClass} {...props} />;
    case "s-8":
      return <GiCard8Spades className={colorClass} {...props} />;
    case "h-9":
      return <GiCard9Hearts className={colorClass} {...props} />;
    case "c-9":
      return <GiCard9Clubs className={colorClass} {...props} />;
    case "d-9":
      return <GiCard9Diamonds className={colorClass} {...props} />;
    case "s-9":
      return <GiCard9Spades className={colorClass} {...props} />;
    case "h-10":
      return <GiCard10Hearts className={colorClass} {...props} />;
    case "c-10":
      return <GiCard10Clubs className={colorClass} {...props} />;
    case "d-10":
      return <GiCard10Diamonds className={colorClass} {...props} />;
    case "s-10":
      return <GiCard10Spades className={colorClass} {...props} />;
    case "h-11":
      return <GiCardJackHearts className={colorClass} {...props} />;
    case "c-11":
      return <GiCardJackClubs className={colorClass} {...props} />;
    case "d-11":
      return <GiCardJackDiamonds className={colorClass} {...props} />;
    case "s-11":
      return <GiCardJackSpades className={colorClass} {...props} />;
    case "h-12":
      return <GiCardQueenHearts className={colorClass} {...props} />;
    case "c-12":
      return <GiCardQueenClubs className={colorClass} {...props} />;
    case "d-12":
      return <GiCardQueenDiamonds className={colorClass} {...props} />;
    case "s-12":
      return <GiCardQueenSpades className={colorClass} {...props} />;
    case "h-13":
      return <GiCardKingHearts className={colorClass} {...props} />;
    case "c-13":
      return <GiCardKingClubs className={colorClass} {...props} />;
    case "d-13":
      return <GiCardKingDiamonds className={colorClass} {...props} />;
    case "s-13":
      return <GiCardKingSpades className={colorClass} {...props} />;

    default:
      return null;
  }
};
