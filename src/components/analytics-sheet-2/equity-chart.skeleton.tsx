import { Skeleton } from "../shadcn/skeleton";

type Props = {
  step?: number;
};

export const EquityChartSkeleton = ({ step = 10 }: Props) => {
  return (
    <div>
      <Skeleton className="mx-auto h-5 w-28 rounded-xs" />
      <div className="mx-auto flex w-fit pt-4 pb-12">
        <Skeleton className="relative h-72 w-10 rounded-[3px] border border-gray-300 dark:border-gray-600" />
        <div className="relative -z-10 w-8">
          {Array.from({ length: 100 / step + 1 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: Static tick marks are stable.
              key={i}
              className="absolute -left-1 h-px w-8 bg-gray-300 dark:bg-gray-600"
              style={{
                bottom: i === 100 / step ? "calc(100% - 1px)" : `${step * i}%`,
              }}
            >
              <p className="absolute -top-2 left-9 whitespace-nowrap text-xs">
                {step * i}%{" "}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
