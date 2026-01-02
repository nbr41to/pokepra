import { useEffect } from "react";
import { getShortHandName } from "@/lib/poker/pokersolver";
import { cn } from "@/lib/utils";
import { PlayCard } from "./play-card";

type Props = {
  hand: string[];
  results: {
    hand: string[];
    score: number;
    iterate: number;
    result: {
      name: string;
      rank: number;
      count: number;
    }[];
  }[];
  onScroll: () => void;
};

export const HandRankingList = ({ hand: myHand, results, onScroll }: Props) => {
  useEffect(() => {
    onScroll();
  }, [onScroll]);

  return (
    <div className="divide-y">
      {results
        .sort((a, b) => b.score - a.score)
        .map(({ hand, score, iterate, result }, index) => (
          <div
            key={hand.join(",")}
            id={hand.join(",")}
            className={cn(
              "grid grid-cols-[36px_48px_52px_1fr] items-center px-2 py-1",
              hand.join(",") === myHand.join(",") &&
                "bg-orange-200 dark:bg-orange-900",
            )}
          >
            <span className="w-10 text-sm">{index + 1}.</span>
            <div className="relative w-12 scale-75">
              <PlayCard
                className="relative -left-px -rotate-2"
                suit={hand[0][1] as "c" | "d" | "h" | "s"}
                rank={hand[0].slice(0, -1)}
                size="sm"
              />
              <PlayCard
                className="absolute top-0 right-0 rotate-4"
                suit={hand[1][1] as "c" | "d" | "h" | "s"}
                rank={hand[1].slice(0, -1)}
                size="sm"
              />
            </div>
            <div className="text-center font-bold">{score}</div>

            <div className="flex h-full flex-wrap gap-1 pl-2">
              {result
                .sort((a, b) => b.count - a.count)
                .map(({ name, count }) => {
                  const percentage = ((count / iterate) * 100).toFixed(0);
                  const colorClass =
                    Number(percentage) >= 80
                      ? "bg-green-600 dark:bg-green-950"
                      : Number(percentage) >= 60
                        ? "bg-green-500 dark:bg-green-900"
                        : Number(percentage) >= 40
                          ? "bg-green-400 dark:bg-green-800"
                          : "bg-green-200 dark:bg-green-700";

                  return (
                    <div
                      key={name}
                      className="relative z-10 flex h-fit w-18 justify-between gap-x-2 overflow-hidden rounded-xs border px-1 py-px text-xs"
                    >
                      <div>{getShortHandName(name)}</div>
                      <div>{percentage}%</div>
                      <div
                        className={`${colorClass} absolute top-0 left-0 -z-10 h-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
    </div>
  );
};
