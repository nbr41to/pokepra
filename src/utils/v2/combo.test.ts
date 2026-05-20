import { describe, expect, it } from "bun:test";
import { assertValidCardId, SUIT, toCardId, VALUE } from "./card";
import {
  buildComboClassGrid,
  COMBO_CLASS_RANKS,
  type Combo,
  comboClassToIndex,
  comboToRangeIndex,
  createRange,
  expandComboClasses,
  RANGE_DIM,
  RANGE_SIZE,
  toComboClass,
} from "./combo";

const assertCardId = (id: number) => {
  assertValidCardId(id);
  return id;
};

describe("RANGE_DIM / RANGE_SIZE", () => {
  it("13 × 13 = 169", () => {
    expect(RANGE_DIM).toBe(13);
    expect(RANGE_SIZE).toBe(169);
  });
});

describe("createRange", () => {
  it("長さ 169 の Uint16Array を返す", () => {
    const r = createRange();
    expect(r).toBeInstanceOf(Uint16Array);
    expect(r.length).toBe(RANGE_SIZE);
  });

  it("初期値は全て 0", () => {
    const r = createRange();
    for (let i = 0; i < r.length; i++) {
      expect(r[i]).toBe(0);
    }
  });
});

describe("buildComboClassGrid", () => {
  it("Range と同じ 169 セルを返す", () => {
    const grid = buildComboClassGrid();
    expect(grid.length).toBe(RANGE_SIZE);
    expect(grid[0]).toBe("AA");
    expect(grid[1]).toBe("AKs");
    expect(grid[13]).toBe("AKo");
    expect(grid[168]).toBe("22");
  });

  it("ランク順は A から 2 の降順", () => {
    expect(COMBO_CLASS_RANKS).toEqual([
      "A",
      "K",
      "Q",
      "J",
      "T",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
    ]);
  });
});

describe("toComboClass", () => {
  it("AsAh → 'AA'（ペア）", () => {
    const combo: Combo = [
      toCardId(VALUE.ACE, SUIT.SPADE),
      toCardId(VALUE.ACE, SUIT.HEART),
    ];
    expect(toComboClass(combo)).toBe("AA");
  });

  it("AsKs → 'AKs'（スーテッド、高い方が先）", () => {
    const combo: Combo = [
      toCardId(VALUE.ACE, SUIT.SPADE),
      toCardId(VALUE.KING, SUIT.SPADE),
    ];
    expect(toComboClass(combo)).toBe("AKs");
  });

  it("AsKh → 'AKo'（オフスート）", () => {
    const combo: Combo = [
      toCardId(VALUE.ACE, SUIT.SPADE),
      toCardId(VALUE.KING, SUIT.HEART),
    ];
    expect(toComboClass(combo)).toBe("AKo");
  });

  it("低い方を先に渡しても高い方が先の表記になる（3s2s → '32s'）", () => {
    const combo: Combo = [
      toCardId(VALUE.TWO, SUIT.SPADE),
      toCardId(VALUE.THREE, SUIT.SPADE),
    ];
    expect(toComboClass(combo)).toBe("32s");
  });
});

describe("comboClassToIndex", () => {
  it("'AA' は左上 (row 0, col 0) = 0", () => {
    expect(comboClassToIndex("AA")).toBe(0);
  });

  it("'22' は右下 (row 12, col 12) = 168", () => {
    expect(comboClassToIndex("22")).toBe(168);
  });

  it("'AKs' は対角線の右上 (row 0, col 1) = 1", () => {
    expect(comboClassToIndex("AKs")).toBe(1);
  });

  it("'AKo' は対角線の左下 (row 1, col 0) = 13", () => {
    expect(comboClassToIndex("AKo")).toBe(13);
  });

  it("169 種類すべてで 0 ~ 168 の値を返し、重複しない", () => {
    const indices = new Set<number>();
    const chars = [
      "A",
      "K",
      "Q",
      "J",
      "T",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
    ];
    for (const hi of chars) {
      indices.add(comboClassToIndex(`${hi}${hi}` as never)); // ペア
      for (const lo of chars) {
        if (hi === lo) continue;
        // 高い方が先の表記のみ（lo は hi より低い）
        const hiIdx = chars.indexOf(hi);
        const loIdx = chars.indexOf(lo);
        if (hiIdx < loIdx) {
          indices.add(comboClassToIndex(`${hi}${lo}s` as never));
          indices.add(comboClassToIndex(`${hi}${lo}o` as never));
        }
      }
    }
    expect(indices.size).toBe(169);
    for (const i of indices) {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(RANGE_SIZE);
    }
  });
});

describe("comboToRangeIndex", () => {
  it("AsAh → 0（AA セル）", () => {
    const combo: Combo = [
      toCardId(VALUE.ACE, SUIT.SPADE),
      toCardId(VALUE.ACE, SUIT.HEART),
    ];
    expect(comboToRangeIndex(combo)).toBe(0);
  });

  it("AsKs → 1（AKs セル）", () => {
    const combo: Combo = [
      toCardId(VALUE.ACE, SUIT.SPADE),
      toCardId(VALUE.KING, SUIT.SPADE),
    ];
    expect(comboToRangeIndex(combo)).toBe(1);
  });

  it("AsKh → 13（AKo セル）", () => {
    const combo: Combo = [
      toCardId(VALUE.ACE, SUIT.SPADE),
      toCardId(VALUE.KING, SUIT.HEART),
    ];
    expect(comboToRangeIndex(combo)).toBe(13);
  });

  it("2s2h → 168（22 セル）", () => {
    const combo: Combo = [
      toCardId(VALUE.TWO, SUIT.SPADE),
      toCardId(VALUE.TWO, SUIT.HEART),
    ];
    expect(comboToRangeIndex(combo)).toBe(168);
  });
});

describe("expandComboClasses", () => {
  it("plus 記法を展開する", () => {
    expect(expandComboClasses("QQ+")).toEqual(
      ["Q", "K", "A"].map((r) => `${r}${r}`),
    );
    expect(expandComboClasses("A5s+")).toEqual([
      "AKs",
      "AQs",
      "AJs",
      "ATs",
      "A9s",
      "A8s",
      "A7s",
      "A6s",
      "A5s",
    ]);
  });

  it("範囲記法を展開する", () => {
    expect(expandComboClasses("KQs-JTs")).toEqual(["KQs", "QJs", "JTs"]);
    expect(expandComboClasses("99-77")).toEqual(["99", "88", "77"]);
  });
});

describe("toComboClass ∘ comboClassToIndex と comboToRangeIndex の一致", () => {
  it("任意の Combo で 2 経路の結果が一致する", () => {
    // 全 1326 通りの 2 枚組をチェック
    for (let a = 0; a <= 51; a++) {
      for (let b = a + 1; b <= 51; b++) {
        const combo: Combo = [assertCardId(b), assertCardId(a)];
        const viaClass = comboClassToIndex(toComboClass(combo));
        const direct = comboToRangeIndex(combo);
        expect(direct).toBe(viaClass);
      }
    }
  });
});
