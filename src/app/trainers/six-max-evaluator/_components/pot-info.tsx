"use client";

import { cn } from "@/lib/utils";
import { BIG_BLIND } from "./_utils/types";

type Props = {
  pot: number;
  toCall: number;
  heroStack: number;
  villainStack: number;
  className?: string;
};

const fmtBB = (chips: number) => `${(chips / BIG_BLIND).toFixed(1)}BB`;

/**
 * Pot/Stack/toCall を一目で確認できる情報パネル
 */
export const PotInfo = ({
  pot,
  toCall,
  heroStack,
  villainStack,
  className,
}: Props) => {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-2 rounded-md border bg-muted/30 p-2 text-center text-xs",
        className,
      )}
    >
      <div>
        <div className="text-muted-foreground">ポット</div>
        <div className="font-bold">{fmtBB(pot)}</div>
      </div>
      <div>
        <div className="text-muted-foreground">コール額</div>
        <div className="font-bold">{toCall > 0 ? fmtBB(toCall) : "-"}</div>
      </div>
      <div>
        <div className="text-muted-foreground">自分</div>
        <div className="font-bold">{fmtBB(heroStack)}</div>
      </div>
      <div>
        <div className="text-muted-foreground">相手</div>
        <div className="font-bold">{fmtBB(villainStack)}</div>
      </div>
    </div>
  );
};
