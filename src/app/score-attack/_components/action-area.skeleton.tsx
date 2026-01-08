import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const ActionAreaSkeleton = () => {
  return (
    <>
      <div className="flex h-12 gap-4 px-2">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="size-12 rounded-full" />
      </div>
      <div className="p-5">
        <Button
          size="lg"
          variant="outline"
          className="h-16 rounded-lg text-base shadow"
          disabled
        >
          Commit
        </Button>
      </div>
    </>
  );
};
