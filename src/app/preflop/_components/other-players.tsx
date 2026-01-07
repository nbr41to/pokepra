import { Redo } from "lucide-react";
import { OtherHand } from "@/components/other-hand";
import Rating from "@/data/preflop-hand-ranking.json";
import { cn } from "@/lib/utils";
import { getPositionString } from "@/utils/position";
import { getHandString } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";

export const OtherPlayers = () => {
  const PEOPLE = 9;
  const { position, stack, hero, otherPlayersHands, preflop } =
    useActionStore();

  const seats = Array.from({ length: PEOPLE }, (_, index) => index + 1);
  const angleStep = (2 * Math.PI) / PEOPLE;
  const baseAngle = Math.PI / 2 - (position - 1) * angleStep; // 自身が真下に来るように調整
  const radiusPercent = 38;
  const selfRate =
    hero.length > 1
      ? Rating.find((r) => r.hand === getHandString(hero))?.player6
      : undefined;

  return (
    <div className="relative h-80 w-full">
      <div className="absolute inset-0">
        {seats.map((seatNumber) => {
          const angle = baseAngle + (seatNumber - 1) * angleStep;
          const x = 50 + Math.cos(angle) * radiusPercent;
          const y = 50 + Math.sin(angle) * radiusPercent;
          const isSelf = seatNumber === position;
          const hand = [hero, ...otherPlayersHands][seatNumber - position];
          const rating = hand
            ? Rating.find((r) => r.hand === getHandString(hand))?.player6
            : undefined;

          return (
            <div
              key={seatNumber}
              className="absolute flex flex-col items-center gap-1"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={cn(
                  "grid size-15 place-items-center rounded-full border bg-background/80 shadow-sm",
                  !hand && !isSelf && "bg-gray-400 opacity-60 dark:bg-gray-800",
                )}
              >
                {hand && !isSelf ? (
                  <OtherHand
                    hand={hand}
                    reversed={!!preflop}
                    delay={200 * (seatNumber - position)}
                  />
                ) : (
                  <span>{getPositionString(seatNumber, PEOPLE)}</span>
                )}
              </div>
              {rating && selfRate && (
                <span
                  className={cn(
                    "font-bold",
                    isSelf ? "text-lg" : "text-xs",
                    rating > selfRate && "text-red-500 dark:text-red-600",
                    preflop
                      ? "opacity-100 transition-opacity"
                      : "opacity-0 transition-none",
                  )}
                  style={{
                    transitionDelay: `${200 * (seatNumber - position)}ms`,
                  }}
                >
                  {rating}%
                </span>
              )}
            </div>
          );
        })}
        <div>
          <Redo className="absolute -bottom-2 left-1/2 size-8 -translate-x-20 rotate-225 text-gray-400 dark:text-gray-600" />
        </div>
        <div className="absolute right-0 bottom-0 font-bold text-xl">
          {stack} pt
        </div>
      </div>
    </div>
  );
};
