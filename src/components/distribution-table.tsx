import data from "./data.json";
import { PlayCard } from "./play-card";
import { Separator } from "./ui/separator";

type Props = {};

export const DistributionTable = ({}: Props) => {
  const iteration = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <div>
      {data.slice(0, 4).map((item) => (
        <div key={item.name} className="">
          <div>
            {item.name} | {((item.count / iteration) * 100).toFixed(2)} % |{" "}
            {item.hands.length} hands
          </div>

          <div className="flex flex-wrap gap-1.5 p-1">
            {item.hands.map(({ hand, count }, index) => (
              <div key={hand.join("-")} className="relative w-12">
                <div className="relative -left-px z-10 w-fit -rotate-2">
                  <PlayCard
                    key={hand[0]}
                    suit={hand[0][1] as "c" | "d" | "h" | "s"}
                    rank={hand[0].slice(0, -1)}
                    size="sm"
                  />
                </div>
                <div className="absolute top-0 right-0 rotate-4">
                  <PlayCard
                    key={hand[1]}
                    suit={hand[1][1] as "c" | "d" | "h" | "s"}
                    rank={hand[1].slice(0, -1)}
                    size="sm"
                  />
                </div>
                <div className="text-xs">
                  <div>{((count / item.count) * 100).toFixed(2)}%</div>
                  <div>{item.rank * count * (item.hands.length - index)}</div>
                </div>
              </div>
            ))}
          </div>
          <Separator />
        </div>
      ))}
    </div>
  );
};
