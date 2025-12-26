import { PlayCard } from "@/components/play-card";

type Props = {
  hands: string[];
  position: string;
};
export const Situation = ({ hands, position }: Props) => {
  return (
    <div className="flex flex-col items-center gap-y-6">
      <div className="scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0">
        Position: {position}
      </div>
      <div className="flex justify-center gap-x-2">
        {hands.map((hand) => (
          <PlayCard
            key={hand}
            suit={hand[1] as "s" | "h" | "d" | "c"}
            rank={hand[0]}
          />
        ))}
        {hands.length === 0 && (
          <>
            <PlayCard />
            <PlayCard />
          </>
        )}
      </div>
    </div>
  );
};
