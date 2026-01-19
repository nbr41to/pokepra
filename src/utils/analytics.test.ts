import { describe, expect, it } from "bun:test";
import { getShortRankName } from "./analytics";

describe("getShortRankName", () => {
  it("役名を省略形に変換する", () => {
    expect(getShortRankName("High Card")).toBe("HC");
    expect(getShortRankName("One Pair")).toBe("1P");
    expect(getShortRankName("Pair")).toBe("1P");
    expect(getShortRankName("Two Pair")).toBe("2P");
    expect(getShortRankName("Three of a Kind")).toBe("3K");
    expect(getShortRankName("Straight")).toBe("ST");
    expect(getShortRankName("Flush")).toBe("FL");
    expect(getShortRankName("Full House")).toBe("FH");
    expect(getShortRankName("Four of a Kind")).toBe("4K");
    expect(getShortRankName("Straight Flush")).toBe("SF");
  });

  it("未知の役名はそのまま返す", () => {
    expect(getShortRankName("Unknown")).toBe("Unknown");
  });
});
