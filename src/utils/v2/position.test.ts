import { describe, expect, it } from "bun:test";
import {
  DEFAULT_POSITION,
  isPositionName,
  POSITIONS,
  positionByIndex,
  positionIndex,
} from "./position";

describe("POSITIONS", () => {
  it("6max のポジションを UTG から BB の順で持つ", () => {
    expect(POSITIONS).toEqual(["UTG", "HJ", "CO", "BTN", "SB", "BB"]);
  });

  it("デフォルトは UTG", () => {
    expect(DEFAULT_POSITION).toBe("UTG");
  });
});

describe("isPositionName", () => {
  it("有効なポジションを true にする", () => {
    expect(isPositionName("BTN")).toBe(true);
    expect(isPositionName("BB")).toBe(true);
  });

  it("無効な値を false にする", () => {
    expect(isPositionName("MP")).toBe(false);
    expect(isPositionName(0)).toBe(false);
  });
});

describe("positionIndex / positionByIndex", () => {
  it("ポジションと index を相互変換できる", () => {
    expect(positionIndex("UTG")).toBe(0);
    expect(positionIndex("BB")).toBe(5);
    expect(positionByIndex(0)).toBe("UTG");
    expect(positionByIndex(5)).toBe("BB");
  });

  it("範囲外 index は null", () => {
    expect(positionByIndex(-1)).toBeNull();
    expect(positionByIndex(6)).toBeNull();
    expect(positionByIndex(1.5)).toBeNull();
  });
});
