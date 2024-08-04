"use client";

import { PositionRangeButton } from "@/components/PositionRangeButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/classNames";
import { toHandString } from "@/utils/toHandString";
import { experimental_useObject as useObject } from "ai/react";
import { FaUserGroup } from "react-icons/fa6";
import { z } from "zod";

type Props = {
  hands: Hand[];
};

export const Main = ({ hands }: Props) => {
  const { object, submit, isLoading } = useObject({
    api: "/api/diagnostics",
    schema: z.object({
      results: z.array(
        z.object({
          index: z.number(),
          people: z.number(),
          position: z.string(),
          action: z.string(),
          hand: z.string(),
          explanation: z.string(),
          result: z.boolean(),
        }),
      ),
    }),
  });

  const handleSubmit = async () => {
    submit(
      hands.map((hand, index) => ({
        index,
        people: hand.people,
        position: hand.position,
        action: hand.action,
        hand: toHandString(hand.preflop),
      })),
    );
  };

  return (
    <>
      <div className="divide-y py-4">
        {hands.map((hand, index) => (
          <div key={index} className="flex justify-between py-2">
            <div className="flex items-center gap-x-3">
              <p className="w-5 font-bold">{index + 1}.</p>
              <div className="w-8 font-bold">{toHandString(hand.preflop)}</div>
              <div className="w-14">
                <Badge
                  className="ml-2"
                  variant={
                    hand.action === "fold"
                      ? "outline"
                      : hand.action === "3bet"
                        ? "destructive"
                        : "default"
                  }
                >
                  {hand.action}
                </Badge>
              </div>

              <p className="flex items-center gap-x-1 text-sm font-bold">
                <FaUserGroup size={14} />
                {hand.people}
              </p>
            </div>

            <div>
              <PositionRangeButton secondary position={hand.position} />
            </div>
          </div>
        ))}
      </div>

      {/* <div>
        <Button disabled={isLoading} onClick={handleSubmit}>
          AIに診断してもらう
        </Button>
      </div>

      <div className="space-y-2 py-4">
        {object?.results?.map((result, index) => (
          <div
            key={index}
            className={cn(
              "space-y-2 rounded px-4 py-2",
              result?.result ? "bg-green-200" : "bg-red-200",
            )}
          >
            <div className="flex justify-between rounded bg-white p-2">
              <div className="flex items-center gap-x-3">
                <p className="w-5 font-bold">{index + 1}.</p>
                <div className="w-8 font-bold">{result?.hand}</div>
                <div className="w-14">
                  <Badge
                    className="ml-2"
                    variant={
                      result?.action === "fold"
                        ? "outline"
                        : result?.action === "3bet"
                          ? "destructive"
                          : "default"
                    }
                  >
                    {result?.action}
                  </Badge>
                </div>

                <p className="flex items-center gap-x-1 text-sm font-bold">
                  <FaUserGroup size={14} />
                  {result?.people}
                </p>
              </div>

              <div>
                <PositionRangeButton
                  secondary
                  position={result?.position || ""}
                />
              </div>
            </div>
            <p className="text-sm">{result?.explanation}</p>
          </div>
        ))}
      </div> */}
    </>
  );
};
