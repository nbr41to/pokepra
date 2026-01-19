/**
 * analytics.ts
 * 分析に関するutils
 */

/**
 * Hand Rankの命名を省略形に変換する
 */
function getShortRankName(handName: string) {
  switch (handName) {
    case "High Card":
      return "HC";
    case "One Pair":
      return "1P";
    case "Pair":
      return "1P";
    case "Two Pair":
      return "2P";
    case "Three of a Kind":
      return "3K";
    case "Straight":
      return "ST";
    case "Flush":
      return "FL";
    case "Full House":
      return "FH";
    case "Four of a Kind":
      return "4K";
    case "Straight Flush":
      return "SF";
    default:
      return handName;
  }
}

export { getShortRankName };
