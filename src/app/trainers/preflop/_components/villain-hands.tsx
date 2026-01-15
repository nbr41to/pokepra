import { Redo } from "lucide-react";
import { OtherHand } from "@/components/other-hand";
import { cn } from "@/lib/utils";
import type { EquityPayload } from "@/lib/wasm/types";
import { getPositionLabel } from "@/utils/position";

type Props = {
  people: number;
  position: number;
  villains: string[][];
  reversed?: boolean;
  result?: EquityPayload | null;
  className?: string;
};
export const VillainHands = ({
  people,
  position,
  villains,
  reversed = true,
  result,
  className,
}: Props) => {
  const seats = Array.from({ length: people }, (_, index) => index + 1);
  const angleStep = (2 * Math.PI) / people;
  const baseAngle = Math.PI / 2 - (position - 1) * angleStep; // 自身が真下に来るように調整
  const radiusPercent = 38;
  const getSeatPosition = (seatNumber: number) =>
    ((seatNumber + 1) % people) + 1;

  return (
    <div
      className={cn(
        "relative aspect-video max-h-80 w-full max-w-screen",
        className,
      )}
    >
      <div className="absolute inset-0">
        {seats.map((seatNumber) => {
          const seatPosition = getSeatPosition(seatNumber);
          const angle = baseAngle + (seatPosition - 1) * angleStep;
          const x = 50 + Math.cos(angle) * radiusPercent;
          const y = 50 + Math.sin(angle) * radiusPercent;
          const isSelf = seatPosition === position;
          const distanceToSeat = (seatPosition - position + people) % people;
          const distanceToBB = (2 - position + people) % people;
          const handIndex =
            distanceToSeat > 0 && distanceToSeat <= distanceToBB
              ? distanceToSeat - 1
              : null;
          const hand = handIndex !== null ? villains[handIndex] : undefined;
          const equity = result?.data.find(
            (r) => r.hand === hand?.join(" "),
          )?.equity;

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
                    reversed={reversed}
                    delay={200 * distanceToSeat}
                  />
                ) : (
                  <span>{getPositionLabel(seatPosition, people)}</span>
                )}
              </div>
              {equity && result && (
                <span
                  className={cn(
                    "absolute -bottom-1.5 font-bold",
                    isSelf ? "-bottom-7 text-lg" : "-bottom-1.5 text-xs",
                    equity > 0.5 && "text-red-500 dark:text-red-600",
                    reversed
                      ? "opacity-100 transition-opacity"
                      : "opacity-0 transition-none",
                  )}
                  style={{
                    transitionDelay: `${200 * (seatNumber - position)}ms`,
                  }}
                >
                  {(equity * 100).toFixed(1)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      <Redo
        className="absolute -bottom-2 left-1/2 size-8 -translate-x-20 rotate-225 text-gray-400 dark:text-gray-600"
        strokeWidth={1.5}
      />
    </div>
  );
};
