import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActionStore } from "../_utils/state";

export const Result = () => {
  const { state, hand, board, startSimulation } = useActionStore();

  return (
    <ScrollArea className="">
      <div className="flex flex-wrap gap-1.5 p-1">
        <Button onClick={startSimulation}>Start Simulation</Button>
        {/* {getAllHands().map((hand) => (
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
          </div>
        ))} */}
      </div>
    </ScrollArea>
  );
};
