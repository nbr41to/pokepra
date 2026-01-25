"use client";

import { useEffect, useState } from "react";
import { StackView } from "@/components/stack-view";
import { cn } from "@/lib/utils";
import { useActionStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { ConfirmPosition } from "./confirm-position";
import { FailureOverlay } from "./failure-overlay";
import { ResultArea } from "./result-area";

export function Main() {
  const { initialized, stack, delta, action, shuffleAndDeal, reset, retry } =
    useActionStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await shuffleAndDeal();
      setLoading(false);
    })();

    return reset;
  }, [shuffleAndDeal, reset]);

  if (!initialized || loading) return null;

  return (
    <div className="relative mt-auto w-full">
      <ResultArea />
      <ConfirmPosition />
      <div className="flex items-end justify-center gap-2">
        <StackView stack={stack} className="" />
        <div
          className={cn(
            "w-15 font-bold text-sm tabular-nums transition-opacity",
            action ? "opacity-100" : "opacity-0",
            delta >= 0 ? "text-green-500" : "text-red-500",
          )}
        >
          {delta >= 0 ? "+" : ""}
          {delta} BB
        </div>
      </div>
      <ActionArea />
      <FailureOverlay visible={stack < 1} onRetry={retry} />
    </div>
  );
}
