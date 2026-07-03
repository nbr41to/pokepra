import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  type CardId,
  SUIT_CHARS,
  suitOfId,
  VALUE_CHARS,
  valueOfId,
} from "@/utils/v2/card";
import { CardBackIcon } from "./card-back-icon";
import { SuitIcon } from "./suit-icon";

const variants = cva(
  "flex flex-col select-none items-center justify-center bg-background border data-[suit=s]:text-suit-spade data-[suit=h]:text-suit-heart data-[suit=d]:text-suit-diamond data-[suit=c]:text-suit-club data-[suit=s]:fill-suit-spade data-[suit=h]:fill-suit-heart data-[suit=d]:fill-suit-diamond data-[suit=c]:fill-suit-club",
  {
    variants: {
      variant: {
        /* カードの裏面Design用 */
        grape: "",
      },
      size: {
        sm: "h-11 w-8 min-w-8 p-px rounded border [&_span]:text-base/[1] [&>div>svg]:size-4 [&>svg]:size-6",
        md: "h-20 w-15 min-w-15 p-1 rounded-md border-2 [&_span]:text-3xl [&>div>svg]:size-7 [&>svg]:size-12",
        lg: "h-36 w-28 min-w-28 p-1 rounded-md border-2 relative [&_span]:text-4xl [&>div>svg]:size-7 [&>svg]:size-22 [&_div]:absolute [&_div]:right-1 [&_div]:bottom-1",
      },
    },

    defaultVariants: {
      variant: "grape",
      size: "sm",
    },
  },
);

type Props = {
  cid: CardId | null;
  backDesign?: "Boxes";
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * **ポーカーで使用されるカードUI**
 *
 * @param rs ランクとスートを表す文字列。例: "As", "Td"
 * @param size カードのサイズ。 "sm"（小）, "md"（中）, "lg"（大）
 */
export const PlayCard = ({
  cid,
  size = "md",
  className,
}: Props & VariantProps<typeof variants>) => {
  const value = cid !== null ? valueOfId(cid) : null;
  const suit = cid !== null ? suitOfId(cid) : null;

  const reversed = suit === null || value === null;

  const rankFontSizeClass = size === "sm" ? "text-sm/[1]" : "text-3xl";

  return (
    <div
      suppressHydrationWarning
      data-suit={suit !== null ? SUIT_CHARS[suit] : undefined}
      className={cn(variants({ size, className }))}
    >
      {reversed ? (
        <CardBackIcon
          data-design="true"
          size={size}
          className="text-teal-500 dark:text-teal-900"
        />
      ) : (
        <div className="grid place-items-center">
          <SuitIcon
            suppressHydrationWarning
            strokeWidth={2}
            fill="currentColor"
            suit={suit}
          />
          <span
            suppressHydrationWarning
            className={cn("font-bold font-montserrat", rankFontSizeClass)}
          >
            {VALUE_CHARS[value]}
          </span>
        </div>
      )}
    </div>
  );
};
