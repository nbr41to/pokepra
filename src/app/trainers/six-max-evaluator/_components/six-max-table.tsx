"use client";

import { cn } from "@/lib/utils";
import { getPositionLabel } from "@/utils/position";
import { POOL_PEOPLE } from "./_utils/types";

type Props = {
  heroPosition: number;
  /** opener として動いたポジション (まだ動いていないなら null) */
  openerPosition?: number | null;
  /** opener以外でcoldコール参加したポジション一覧 */
  coldCallerPositions?: number[];
  /** pot を中央に表示 */
  potLabel?: string;
  className?: string;
};

/**
 * 6人テーブルを楕円状に表現するコンポーネント。
 *
 * - Heroは常に最下段（手前）に配置し、残りの5席は時計回りに並べる
 *   (slot0=Hero, slot1=Hero+1clockwise, ..., slot5=Hero+5clockwise)
 * - Heroの座席は赤色 + 「あなた」バッジで強調
 * - openerが居れば「OPEN」バッジ
 * - SB / BB はサブラベル
 *
 * Position番号は pokepra 規約に従う:
 *   1 = SB, 2 = BB, 3 = UTG, 4 = MP, 5 = CO, 6 = BTN
 * 時計回りに +1 = 次のポジション (BTN(6) -> SB(1) -> BB(2) -> UTG(3) ...)
 */

// 楕円上の6スロット (slot0=手前中央のHero、時計回り)
const SLOT_LAYOUT: Array<{ left: string; top: string }> = [
  { left: "50%", top: "100%" }, // slot 0: 手前中央 (Hero)
  { left: "5%", top: "75%" }, // slot 1: 手前左
  { left: "0%", top: "25%" }, // slot 2: 奥左
  { left: "50%", top: "0%" }, // slot 3: 奥中央
  { left: "100%", top: "25%" }, // slot 4: 奥右
  { left: "95%", top: "75%" }, // slot 5: 手前右
];

/** slotIndex -> 実際のposition (1..6) を Hero基準で算出 */
function slotToPosition(slotIndex: number, heroPosition: number): number {
  return ((heroPosition - 1 + slotIndex) % POOL_PEOPLE) + 1;
}

const blindBadge = (position: number) => {
  if (position === 1) return "SB";
  if (position === 2) return "BB";
  return null;
};

export const SixMaxTable = ({
  heroPosition,
  openerPosition,
  coldCallerPositions = [],
  potLabel,
  className,
}: Props) => {
  const coldCallerSet = new Set(coldCallerPositions);
  return (
    <div className={cn("relative mx-auto h-48 w-full max-w-sm", className)}>
      {/* テーブル本体（楕円） */}
      <div className="absolute inset-x-6 inset-y-8 rounded-[50%] border-4 border-emerald-700/40 bg-emerald-900/30 shadow-inner dark:bg-emerald-950/50" />

      {/* 中央のポット表示 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-background/80 px-3 py-1 text-center shadow">
          <div className="text-[10px] text-muted-foreground">POT</div>
          <div className="font-bold font-noto-sans-jp text-sm tabular-nums">
            {potLabel ?? "-"}
          </div>
        </div>
      </div>

      {/* 6席 (slot0がHero, あとは時計回り) */}
      {SLOT_LAYOUT.map(({ left, top }, slotIndex) => {
        const position = slotToPosition(slotIndex, heroPosition);
        const isHero = slotIndex === 0;
        const isOpener = position === openerPosition;
        const isColdCaller = coldCallerSet.has(position);
        const label = getPositionLabel(position, POOL_PEOPLE);
        const subLabel = blindBadge(position);
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={slotIndex}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left, top }}
          >
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-full border-2 font-bold font-noto-sans-jp text-[11px] shadow-sm transition-colors",
                isHero
                  ? "border-red-500 bg-red-100 text-red-700 dark:border-red-500 dark:bg-red-900 dark:text-red-100"
                  : isOpener || isColdCaller
                    ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-gray-300 bg-background text-muted-foreground",
              )}
            >
              {label}
            </div>
            <div className="mt-0.5 flex h-3.5 items-center gap-1">
              {isHero && (
                <span className="rounded-sm bg-red-500 px-1 font-bold text-[9px] text-white">
                  あなた
                </span>
              )}
              {isOpener && !isHero && (
                <span className="rounded-sm bg-amber-500 px-1 font-bold text-[9px] text-white">
                  OPEN
                </span>
              )}
              {isColdCaller && !isHero && !isOpener && (
                <span className="rounded-sm bg-amber-400 px-1 font-bold text-[9px] text-white">
                  CALL
                </span>
              )}
              {subLabel && !isHero && !isOpener && !isColdCaller && (
                <span className="text-[9px] text-muted-foreground">
                  {subLabel}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
