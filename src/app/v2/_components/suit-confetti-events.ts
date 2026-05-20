export const SUIT_MATCH_EVENT = "suit-match-change";

export type SuitMatchEventDetail = {
  suit: "s" | "h" | "d" | "c";
  isCorrect: boolean;
};
