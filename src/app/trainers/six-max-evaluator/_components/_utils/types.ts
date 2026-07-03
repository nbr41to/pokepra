/**
 * Six Max Evaluator の型定義
 *
 * - 6max固定 / 100BB持ち
 * - 1チップ = 1BBの100分の1 として扱う
 *   - 1BB = 100chips, SB = 50chips, スタック = 10000chips
 */

export const POOL_PEOPLE = 6 as const;
export const INITIAL_STACK = 10000 as const; // 100BB を 10000 chips とする
export const BIG_BLIND = 100 as const;
export const SMALL_BLIND = 50 as const;

export type Street = "preflop" | "flop" | "turn" | "river" | "showdown";

/** 6max のポジション。position 1..6 を SB..BTN にマッピング */
export type SixMaxPositionLabel = "UTG" | "MP" | "CO" | "BTN" | "SB" | "BB";

/**
 * 各アクションの種類
 * - fold: フォールド
 * - check: チェック (toCall === 0 のときに可能)
 * - call: コール
 * - bet: 自発的なベット (toCall === 0 のときに可能)
 * - raise: レイズ (toCall > 0 に対するレイズ)
 * - allin: オールイン
 */
export type ActionKind = "fold" | "check" | "call" | "bet" | "raise" | "allin";

export type ActionChoice = {
  kind: ActionKind;
  /** chip 単位の合計賭け金 (ベット時のサイズ) */
  amount: number;
  label: string;
};

export type ActionEvaluation = {
  /** 選択されたアクション */
  choice: ActionChoice;
  /** ヒーローのpotエクイティ (0..1) — 残り相手数を考慮した multi-way 勝率 */
  heroEquity: number;
  /** 相手側のレンジ (ハンド組数) */
  villainRangeSize: number;
  /** 残り相手の人数 (1 = heads-up) */
  numOpponents: number;
  /** 現在のポット (chips) */
  pot: number;
  /** コールに必要なchip */
  toCall: number;
  /** ポットオッズ (call/(pot+call)) */
  potOdds: number;
  /** MDF (Minimum Defense Frequency) */
  mdf: number;
  /** 必要勝率 (call時) = potOdds */
  requiredEquity: number;
  /** このアクションの推定EV (chips) */
  evChips: number;
  /** 最適アクション */
  bestChoice: ActionChoice;
  /** 最適アクションのEV (chips) */
  bestEvChips: number;
  /** 最適アクションとのEV差 (chips, 小さいほど良い) */
  evLoss: number;
  /** スコア評価 */
  grade: "great" | "good" | "ok" | "bad" | "terrible";
  /** 全候補アクションのEV一覧 */
  allCandidates: {
    choice: ActionChoice;
    evChips: number;
    meta?: ActionEvMeta;
  }[];
};

/** EV計算の内部メタ情報 (Tips/詳細表示用) */
export type ActionEvMeta = {
  foldFraction?: number;
  heroEquityVsCalled?: number;
  callingHandsCount?: number;
  villainPotOdds?: number;
};

export type HistoryEntry = {
  street: Street;
  position: number;
  hero: string[];
  board: string[];
  evaluation: ActionEvaluation;
  timestamp: number;
};

export type RoundResult = {
  /** スタック変動 (chips) */
  delta: number;
  /** 累積スコア (大きいほど良い、0が最適、マイナスはEV損失) */
  totalEvLoss: number;
  /** 1ラウンドのアクション数 */
  actionCount: number;
  /** 平均評価 */
  averageGrade: ActionEvaluation["grade"];
};
