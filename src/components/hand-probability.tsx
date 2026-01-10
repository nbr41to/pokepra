import { getShortHandName } from "@/lib/poker/pokersolver";
import { cn } from "@/lib/utils";

type Props = {
  handName: string;
  probability: number;
  className?: string;
};

export const HandProbability = ({
  handName,
  probability,
  className,
}: Props) => {
  const colorClass =
    Number(probability) >= 80
      ? "bg-green-600 dark:bg-green-950"
      : Number(probability) >= 60
        ? "bg-green-500 dark:bg-green-900"
        : Number(probability) >= 40
          ? "bg-green-400 dark:bg-green-800"
          : "bg-green-200 dark:bg-green-700";
  return (
    <div
      className={cn(
        "relative z-10 flex h-5 w-18 justify-between gap-x-2 overflow-hidden rounded-xs border px-1 py-px text-xs",
        className,
      )}
    >
      <div>{getShortHandName(handName)}</div>
      <div>{probability.toFixed(1)}%</div>
      <div
        className={`absolute top-0 left-0 -z-10 h-full ${colorClass}`}
        style={{
          width: `${probability}%`,
          opacity: 0.1 + (probability / 100) * 0.9,
        }}
      />
    </div>
  );
};
