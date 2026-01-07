import { cva, type VariantProps } from "class-variance-authority";
import { Grape } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuitIcon } from "./ui/suit-icon";

const variants = cva(
  "flex flex-col items-center justify-center bg-background border data-[suit=s]:text-blue-400 dark:data-[suit=s]:text-blue-600 data-[suit=h]:text-pink-400 dark:data-[suit=h]:text-pink-600 data-[suit=d]:text-orange-400 dark:data-[suit=d]:text-orange-600 data-[suit=c]:text-green-400 dark:data-[suit=c]:text-green-600",
  {
    variants: {
      variant: {
        /* カードの裏面Design用 */
        grape: "",
      },
      size: {
        sm: "h-11 w-8 p-px rounded border [&_span]:text-base/[1] [&>div>svg]:size-5 [&>svg]:size-6",
        md: "h-22 w-16 p-1 rounded-md border-2 [&_span]:text-3xl [&>div>svg]:size-9 [&>svg]:size-[54px]",
        lg: "h-42 w-32 p-1 rounded-md border-2 relative [&_span]:text-4xl [&>div>svg]:size-9 [&>svg]:size-25 [&_div]:absolute [&_div]:right-1 [&_div]:bottom-1",
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
