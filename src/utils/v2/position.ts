/**
 * position.ts
 * Texas Hold'em のポジションに関する定義。
 */

const POSITIONS = ["UTG", "HJ", "CO", "BTN", "SB", "BB"] as const;
type PositionName = (typeof POSITIONS)[number];

const DEFAULT_POSITION: PositionName = "UTG";

function isPositionName(value: unknown): value is PositionName {
  return typeof value === "string" && POSITIONS.includes(value as PositionName);
}

function positionIndex(position: PositionName): number {
  return POSITIONS.indexOf(position);
}

function positionByIndex(index: number): PositionName | null {
  if (!Number.isInteger(index) || index < 0 || index >= POSITIONS.length) {
    return null;
  }
  return POSITIONS[index] ?? null;
}

export {
  DEFAULT_POSITION,
  isPositionName,
  positionByIndex,
  positionIndex,
  POSITIONS,
  type PositionName,
};
