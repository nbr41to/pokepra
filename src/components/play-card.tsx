import { cva, type VariantProps } from "class-variance-authority";
import { Grape } from "lucide-react";
import { cn } from "@/lib/utils";
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
  rs?: string; // rank suit string. e.g. "As", "Td"
  variant?: "grape";
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
  rs,
  size = "md",
  variant,
  className,
}: Props & VariantProps<typeof variants>) => {
  const suit = rs ? (rs[1] as "s" | "h" | "d" | "c") : undefined;
  const rank = rs ? rs[0] : undefined;

  const reversed = !suit || !rank;

  const designSize = size === "sm" ? 24 : size === "md" ? 54 : 100;
  const rankFontSizeClass = size === "sm" ? "text-sm/[1]" : "text-3xl";

  const strokeWidth = size === "lg" ? 3 : 2.5;

  return (
    <div
      suppressHydrationWarning
      data-suit={suit}
      className={cn(variants({ size, variant, className }))}
    >
      {reversed ? (
        <Grape
          data-design="true"
          size={designSize}
          strokeWidth={1.5}
          className="text-indigo-500 dark:text-indigo-900"
        />
      ) : (
        <div className="grid place-items-center">
          <SuitIcon
            suppressHydrationWarning
            suit={suit}
            strokeWidth={strokeWidth}
            fill="fill"
          />
          <span
            suppressHydrationWarning
            className={cn("font-bold font-montserrat", rankFontSizeClass)}
          >
            {rank}
          </span>
        </div>
      )}
    </div>
  );
};
