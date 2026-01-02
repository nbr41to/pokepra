import { Skeleton } from "@/components/ui/skeleton";

export function ConfirmRankingSkeleton() {
  return (
    <div className="h-[calc(70dvh+48px)] overflow-hidden px-1">
      <div className="flex items-end justify-between">
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-9 w-35.5 rounded-lg" />
      </div>

      <div className="mt-3 space-y-1">
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
        <Skeleton className="h-12.5 w-full rounded" />
      </div>
    </div>
  );
}
