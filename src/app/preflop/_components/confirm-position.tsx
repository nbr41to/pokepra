import { AutoHandConfirmation } from "@/components/auto-hand-confirmation";
import Rating from "@/data/preflop-hand-ranking.json";
import { getHandString } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";
export const ConfirmPosition = () => {
  const { position, otherPlayersHands } = useActionStore();

  const startDeg = 210; // 左下あたり
  const endDeg = -30; // 右下あたり
  const count = otherPlayersHands.length || 1;
  const step = count > 1 ? (startDeg - endDeg) / (count - 1) : 0;
  const radius = 140;
  const centerY = 160; // 半円の中心を少し下に置く
  const centerX = 200;

  return (
    <div className="relative h-80 w-full">
      <div className="absolute bottom-0 left-0 h-40 w-full overflow-visible">
        {otherPlayersHands.map((hand, index) => {
          const angle = ((startDeg - step * index) * Math.PI) / 180;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const rating = Rating.find(
            (r) => r.hand === getHandString(hand),
          )?.player10;

          return (
            <div
              key={hand.join(",")}
              className="absolute flex flex-col items-center"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <AutoHandConfirmation hand={hand} open={true} />
              {rating && (
                <span className="mt-1 font-semibold text-muted-foreground text-xs">
                  {rating.toFixed(1)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute -bottom-8 left-0 w-fit rounded-full bg-card px-4 py-2 text-sm shadow">
        position: {position}
      </div>
    </div>
  );
};
