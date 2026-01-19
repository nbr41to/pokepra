import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CARD_RANK_ORDER, CARD_RANKS } from "@/utils/card";

type Props = {
  data: string[] | { symbol: string; prob: number }[] | Record<string, number>;
  mark?: string;
};

export const RangeTable = ({ data, mark }: Props) => {
  const parsedData = useMemo(() => {
    const isProbabilityObject =
      !Array.isArray(data) && typeof data === "object";
    if (isProbabilityObject) {
      return data as Record<string, number>;
    }
    if (Array.isArray(data)) {
      if (data.length === 0) return {};

      const isProbabilityObjectArray =
        data.length > 0 &&
        typeof data[0] === "object" &&
        "symbol" in data[0] &&
        "prob" in data[0];
      const isStringArray = data.length > 0 && typeof data[0] === "string";
      if (isProbabilityObjectArray) {
        const dataObj: Record<string, number> = {};
        (data as { symbol: string; prob: number }[]).forEach((entry) => {
          dataObj[entry.symbol] = entry.prob;
        });
        return dataObj;
      } else if (isStringArray) {
        const dataObj: Record<string, number> = {};
        (data as string[]).forEach((symbol) => {
          dataObj[symbol] = 1;
        });
        return dataObj;
      }
    }

    throw new Error("Invalid data format for RangeTable");
  }, [data]);

  return (
    <div className="grid h-53 w-[320px] place-content-center">
      <div className="grid w-fit grid-cols-13 border-r border-b font-noto-sans-jp">
        {CARD_RANKS.map((_rank, rowIndex) => {
          const prefixRank = CARD_RANKS[rowIndex];
          return CARD_RANKS.map((rank, column) => {
            const orderedRanks = [prefixRank, rank]
              .sort((a, b) => CARD_RANK_ORDER[b] - CARD_RANK_ORDER[a])
              .join("");
            const ranksString =
              orderedRanks +
              (rank !== prefixRank ? (column < rowIndex ? "o" : "s") : "");
            const probability = parsedData[ranksString] || 0;

            return (
              <div
                key={rank}
                className={cn(
                  "relative grid h-4 w-6 place-items-center border-t border-l text-[10px] text-foreground",
                  probability === 0 &&
                    "bg-gray-300 opacity-40 dark:bg-gray-800",
                  mark === ranksString &&
                    "z-10 animate-pulse rounded outline-3 outline-red-500 outline-offset-1",
                )}
              >
                <div
                  className={cn(
                    "absolute top-0 left-0 h-full bg-green-400 dark:bg-green-700",
                    probability > 0 && "bg-green-100",
                    probability > 0.25 && "bg-green-200",
                    probability > 0.5 && "bg-green-300",
                    probability > 0.75 && "bg-green-500",
                  )}
                  style={{
                    width: `${probability * 100}%`,
                  }}
                />
                <span className="relative z-10">{ranksString}</span>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
