import type { CombinedPayload } from "@/lib/wasm/simulation";

const calcScore = ({
  phase,
  action,
  eqData,
}: {
  phase: "flop" | "turn" | "river";
  action: "commit" | "fold";
  eqData: CombinedPayload;
}) => {
  if (action === "fold") return 0;

  const STREET_W = { flop: 0.9, turn: 1.1, river: 1.5 } as const;
  const POT = 100; // ポットサイズ固定
  const BET = 33; // コミット額固定

  const needWinRate = BET / (POT + BET); // 必要勝率
  const ev = eqData.equity * POT - needWinRate * BET; // 期待値
  const score = Math.floor((ev / BET) * 10 * STREET_W[phase]);

  return score;
};
