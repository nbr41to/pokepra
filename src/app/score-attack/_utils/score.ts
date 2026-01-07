import type { CombinedPayload } from "@/lib/wasm/simulation";

const calcScore = ({
  phase,
  action,
  eqData,
}: {
  phase: "flop" | "turn" | "river";
  action: any;
  eqData: CombinedPayload;
}) => {
  const STREET_W = { flop: 0.9, turn: 1.1, river: 1.5 } as const;
  const POT = 100; // ポットサイズ固定
  const BET = 33; // コミット額固定
  // 必要勝率
  const needWinRate = BET / (POT + BET);
  const ev = eqData.equity * POT - needWinRate * BET;
  const score = Math.floor((ev / BET) * 10 * STREET_W[phase]);

  return score;
};
