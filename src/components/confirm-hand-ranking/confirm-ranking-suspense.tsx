"use client";

import { Suspense } from "react";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { ConfirmRankingSkeleton } from "./confirm-ranking.skeleton";
import { ConfirmRankingSheet } from "./confirm-ranking-sheet";

type Props = {
  board: string[];
  disabled?: boolean;
  rankPromise: Promise<CombinedPayload>;
  className?: string;
};

export const ConfirmRankingSuspense = ({
  board,
  disabled = false,
  rankPromise,
  className,
}: Props) => {
  return (
    <Suspense fallback={<ConfirmRankingSkeleton />}>
      <ConfirmRankingSheet
        board={board}
        disabled={disabled}
        rankPromise={rankPromise}
        className={className}
      />
    </Suspense>
  );
};
