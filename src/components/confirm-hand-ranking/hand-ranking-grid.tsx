import { useEffect } from "react";
import { PlayCard } from "@/components/play-card";
import { getShortHandName } from "@/lib/poker/pokersolver";
import { cn } from "@/lib/utils";

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

export const HandRankingGrid = ({ hand: myHand, results, onScroll }: Props) => {
  useEffect(() => {
    onScroll();
  }, [onScroll]);

  return (
    <div className="grid grid-cols-3 gap-1">
      {results
        .sort((a, b) => b.score - a.score)
        .map(({ hand, score, iterate, result }, index) => (
          <div
            key={hand.join(",")}
            id={hand.join(",")}
            className={cn(
              "flex justify-between gap-x-2 rounded border p-2",
              hand.join(",") === myHand.join(",") &&
                "border-2 border-orange-500 bg-orange-100",
            )}
          >
            <div className="space-y-1">
              <div>
                <span className="text-sm">{index + 1}.</span>
              </div>
              <div className="relative w-12">
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
            </div>

            <div className="space-y-1">
              {result
                .sort((a, b) => b.count - a.count)
                .map(({ name, count }) => {
                  const percentage = ((count / iterate) * 100).toFixed(0);
                  const colorClass =
                    Number(percentage) >= 80
                      ? "bg-green-600"
                      : Number(percentage) >= 60
                        ? "bg-green-500"
                        : Number(percentage) >= 40
                          ? "bg-green-400"
                          : "bg-green-200";

                  return (
                    <div
                      key={name}
                      className="relative z-10 flex h-fit w-14 justify-between gap-x-2 overflow-hidden rounded-xs border px-1 py-px text-[10px]/[1]"
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
