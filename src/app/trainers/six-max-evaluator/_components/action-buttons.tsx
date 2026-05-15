"use client";

import { useMemo } from "react";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";
import { type ActionChoice, BIG_BLIND } from "./_utils/types";

type Props = {
  pot: number;
  toCall: number;
  heroStack: number;
  villainStack: number;
  disabled?: boolean;
  onPick: (choice: ActionChoice) => void;
  className?: string;
};

const fmtBB = (chips: number) => `${(chips / BIG_BLIND).toFixed(1)}BB`;

const BET_RATIOS: { ratio: number; label: string }[] = [
  { ratio: 0.33, label: "33%" },
  { ratio: 0.66, label: "66%" },
  { ratio: 1.0, label: "100%" },
  { ratio: 1.5, label: "150%" },
];

/**
 * アクション選択ボタン群
 * - fold / check or call / bet|raise (4size) / allin
 * - sliderではなく明確な選択肢を提供
 */
export const ActionButtons = ({
  pot,
  toCall,
  heroStack,
  villainStack,
  disabled = false,
  onPick,
  className,
}: Props) => {
  const choices = useMemo<ActionChoice[]>(() => {
    const list: ActionChoice[] = [];
    list.push({ kind: "fold", amount: 0, label: "フォールド" });

    if (toCall === 0) {
      list.push({ kind: "check", amount: 0, label: "チェック" });
    } else {
      const callAmount = Math.min(toCall, heroStack);
      list.push({
        kind: "call",
        amount: callAmount,
        label: `コール ${fmtBB(callAmount)}`,
      });
    }

    const baseKind = toCall === 0 ? "bet" : "raise";
    const baseLabel = baseKind === "bet" ? "ベット" : "レイズ";
    const callAmount = toCall;
    const newPot = pot + callAmount;
    for (const { ratio, label } of BET_RATIOS) {
      const totalSize = Math.floor(callAmount + newPot * ratio);
      if (totalSize <= toCall) continue;
      if (totalSize > heroStack) continue;
      list.push({
        kind: baseKind,
        amount: totalSize,
        label: `${baseLabel} ${label} (${fmtBB(totalSize)})`,
      });
    }

    const maxBet = Math.min(heroStack, villainStack + toCall);
    if (maxBet > toCall && maxBet > 0) {
      list.push({
        kind: "allin",
        amount: maxBet,
        label: `オールイン (${fmtBB(maxBet)})`,
      });
    }

    return list;
  }, [pot, toCall, heroStack, villainStack]);

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {choices.map((c) => (
        <Button
          key={`${c.kind}-${c.amount}`}
          variant={
            c.kind === "fold"
              ? "outline"
              : c.kind === "allin"
                ? "destructive"
                : "default"
          }
          disabled={disabled}
          onClick={() => onPick(c)}
          className="h-12 text-sm"
        >
          {c.label}
        </Button>
      ))}
    </div>
  );
};
