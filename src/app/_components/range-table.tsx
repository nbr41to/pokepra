import { TIERS } from "@/constants/tiers";
import { cn } from "@/lib/utils";

type Props = {
  mark?: string;
};

export const RangeTable = ({ mark }: Props) => {
  return (
    <div className="space-y-3">
      <div className="grid w-fit grid-cols-13">
        {ranks.map((_rank, rowIndex) => {
          const prefixRank = ranks[rowIndex];
          return ranks.map((rank, column) => {
            const orderedRanks = [prefixRank, rank]
              .sort((a, b) => rankOrder[b] - rankOrder[a])
              .join("");
            const ranksString =
              orderedRanks +
              (rank !== prefixRank ? (column < rowIndex ? "o" : "s") : "");
            const tier = TIERS.findIndex((tier) => tier.includes(ranksString));

            return (
              <div
                key={rank}
                className={cn(
                  "grid h-6 w-8 place-items-center font-bold text-xs outline",
                  tier === 0 && "bg-blue-950",
                  tier === 1 && "bg-red-700",
                  tier === 2 && "bg-yellow-700",
                  tier === 3 && "bg-fuchsia-800",
                  tier === 4 && "bg-sky-700",
                  tier === 5 && "bg-green-900",
                  tier === 6 && "bg-purple-900",
                  tier === 7 && "bg-slate-600",
                  tier === -1 && "bg-gray-800 text-gray-500 outline-white",
                  mark === ranksString && "border-4 border-yellow-400",
                )}
              >
                {ranksString}
              </div>
            );
          });
        })}
      </div>
      <div className="grid w-fit grid-cols-8 gap-2">
        <div className="grid h-6 w-8 place-items-center bg-blue-950 font-bold text-xs outline">
          8 ~
        </div>
        <div className="grid h-6 w-8 place-items-center bg-red-700 font-bold text-xs outline" />
        <div className="grid h-6 w-8 place-items-center bg-yellow-700 font-bold text-xs outline" />
        <div className="grid h-6 w-8 place-items-center bg-fuchsia-800 font-bold text-xs outline">
          6,7
        </div>
        <div className="grid h-6 w-8 place-items-center bg-sky-700 font-bold text-xs outline">
          4,5
        </div>
        <div className="grid h-6 w-8 place-items-center bg-green-900 font-bold text-xs outline">
          3
        </div>
        <div className="grid h-6 w-8 place-items-center bg-purple-900 font-bold text-xs outline">
          BTN
        </div>
        <div className="grid h-6 w-8 place-items-center bg-slate-600 font-bold text-xs outline">
          BB*
        </div>
      </div>
    </div>
  );
};

const ranks = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
] as const;

const rankOrder: { [key: string]: number } = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2,
};
