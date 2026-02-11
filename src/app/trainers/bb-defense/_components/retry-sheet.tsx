"use client";

import { Swords, X } from "lucide-react";
import { useState } from "react";
import { Combo } from "@/components/combo";
import { HandProbability } from "@/components/hand-probability";
import { Button } from "@/components/shadcn/button";
import { Progress } from "@/components/shadcn/progress";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";
import { cn } from "@/lib/utils";
import { simulateVsListWithRanks } from "@/lib/wasm-v1/simulation";
import type {
  CombinedPayload,
  MultiHandEquityPayload,
} from "@/lib/wasm-v1/types";

const TRIAL_ITERATIONS = 100000;

type Props = {
  hero: string[];
  result: MultiHandEquityPayload | null;
  disabled: boolean;
  className?: string;
};

export const RetrySheet = ({
  hero,
  result: prevResult,
  disabled,
  className,
}: Props) => {
  const [selected, setSelected] = useState<string[]>();
  const [result, setResult] = useState<CombinedPayload>();
  const [loading, setLoading] = useState(false);

  const retry = async () => {
    if (!selected) return;

    setLoading(true);
    const result = await simulateVsListWithRanks({
      hero,
      board: [],
      compare: [selected],
      trials: TRIAL_ITERATIONS,
    });
    setLoading(false);
    setResult(result);
  };

  return (
    <Sheet>
      <SheetTrigger asChild disabled={disabled}>
        <Button className={cn("rounded-full", className)} size="icon-lg">
          <Swords />
        </Button>
      </SheetTrigger>

      <SheetContent className="h-dvh" side="bottom">
        <ScrollArea className="h-dvh">
          <SheetHeader>
            <SheetTitle>Retry</SheetTitle>
            <SheetDescription className="">
              指定した相手と再シミュレーションできます。
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-wrap justify-evenly gap-3 px-2 py-4">
            {prevResult?.data
              .filter((entry) => entry.hand !== hero.join(" "))
              .map(({ hand, equity }) => (
                <button
                  key={hand}
                  type="button"
                  className={cn(
                    "grid place-items-center gap-1 rounded-md border-2 px-3 py-2 shadow",
                    selected?.join(" ") === hand ? "border-blue-500" : "",
                  )}
                  onClick={() => setSelected(hand.split(" "))}
                >
                  <Combo hand={hand.split(" ")} />
                  <div
                    className={cn(
                      "font-bold text-sm",
                      equity > 0.5 && "text-red-500 dark:text-red-600",
                    )}
                  >
                    {(equity * 100).toFixed(2)}%
                  </div>
                </button>
              ))}
          </div>

          <div className="mx-auto w-fit">
            <Button
              className="rounded-full"
              size="lg"
              onClick={() => retry()}
              disabled={!selected || loading}
            >
              {loading ? "再戦中..." : "再戦する"}
            </Button>
          </div>

          {result && (
            <div className="flex flex-col items-center gap-4 px-4 py-6">
              <div className="flex items-end justify-center gap-x-3">
                <Combo hand={hero} />
                <span className="font-bold text-sm">VS</span>
                <Combo
                  hand={result.data
                    .filter((r) => r.hand === hero.join(" "))[0]
                    .hand.split(" ")}
                />
              </div>
              <Progress
                value={result.equity * 100}
                className="mx-auto h-4 w-60"
              />
              <p className="font-bold text-xl">
                {(result.equity * 100).toFixed(2)}%
              </p>
              <div className="flex gap-2">
                {result.data.map((r) => {
                  return (
                    <div key={r.hand} className="flex flex-col items-center">
                      <Combo className="scale-80" hand={r.hand.split(" ")} />
                      <div className="space-y-1">
                        {Object.keys(r.results)
                          .filter((name) => {
                            const outcome =
                              r.results[name as keyof typeof r.results];
                            return outcome.win > 0;
                          })
                          .map((name) => {
                            const outcome =
                              r.results[name as keyof typeof r.results];
                            const total = outcome.win;
                            const probability = (total / r.count) * 100;

                            return (
                              <HandProbability
                                key={name}
                                handName={name}
                                probability={probability}
                              />
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <SheetFooter className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
            <SheetClose asChild>
              <Button
                variant="outline"
                size="icon-lg"
                className="rounded-full opacity-90"
              >
                <X />
              </Button>
            </SheetClose>
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
