import { describe, expect, it } from "bun:test";
import { assertValidCardId, SUIT, toCardId, VALUE } from "./card";
import { comboClassToIndex, createRange, toComboClass } from "./combo";
import { generateBoard, generateCombo, RANK } from "./game";

const assertCardId = (id: number) => {
  assertValidCardId(id);
  return id;
};

describe("RANK", () => {
  it("rs-poker の Rank enum と同じ順序で 0 ~ 8 の連番", () => {
    expect(RANK.HIGH_CARD).toBe(0);
    expect(RANK.ONE_PAIR).toBe(1);
    expect(RANK.TWO_PAIR).toBe(2);
    expect(RANK.THREE_OF_A_KIND).toBe(3);
    expect(RANK.STRAIGHT).toBe(4);
    expect(RANK.FLUSH).toBe(5);
    expect(RANK.FULL_HOUSE).toBe(6);
    expect(RANK.FOUR_OF_A_KIND).toBe(7);
    expect(RANK.STRAIGHT_FLUSH).toBe(8);
  });

  it("値が大きいほど強い役（HIGH_CARD < STRAIGHT_FLUSH）", () => {
    expect(RANK.HIGH_CARD).toBeLessThan(RANK.STRAIGHT_FLUSH);
  });
});

describe("generateCombo", () => {
  it("range がない場合は 52 枚から 2 枚の Combo を生成する", () => {
    const combo = generateCombo();
    expect(combo[0]).toBeGreaterThan(combo[1]);
    expect(combo[1]).toBeGreaterThanOrEqual(0);
    expect(combo[0]).toBeLessThanOrEqual(51);
  });

  it("range がある場合は頻度がある ComboClass から生成する", () => {
    const range = createRange();
    range[comboClassToIndex("AA")] = 1000;
    expect(toComboClass(generateCombo({ range }))).toBe("AA");
  });

  it("ignore に含まれるカードを使わない", () => {
    const ignored = toCardId(VALUE.ACE, SUIT.SPADE);
    const combo = generateCombo({ ignore: ignored });
    expect(combo).not.toContain(ignored);
  });

  it("生成できる Combo がない場合は RangeError を投げる", () => {
    const range = createRange();
    expect(() => generateCombo({ range })).toThrow(RangeError);
  });
});

describe("generateBoard", () => {
  it("デフォルトでは 5 枚の重複しない board を生成する", () => {
    const board = generateBoard();
    expect(board.length).toBe(5);
    expect(new Set(board).size).toBe(5);
    for (const card of board) {
      expect(card).toBeGreaterThanOrEqual(0);
      expect(card).toBeLessThanOrEqual(51);
    }
  });

  it("count で指定した枚数を生成する", () => {
    expect(generateBoard({ count: 3 }).length).toBe(3);
    expect(generateBoard({ count: 4 }).length).toBe(4);
  });

  it("ignore に含まれるカードを使わない", () => {
    const ignored = [
      toCardId(VALUE.ACE, SUIT.SPADE),
      toCardId(VALUE.KING, SUIT.SPADE),
    ];
    const board = generateBoard({ count: 5, ignore: ignored });
    for (const card of ignored) {
      expect(board).not.toContain(card);
    }
  });

  it("count が 0 ~ 5 の整数でない場合は RangeError を投げる", () => {
    expect(() => generateBoard({ count: -1 })).toThrow(RangeError);
    expect(() => generateBoard({ count: 6 })).toThrow(RangeError);
    expect(() => generateBoard({ count: 1.5 })).toThrow(RangeError);
  });

  it("候補カードが足りない場合は RangeError を投げる", () => {
    const ignored = Array.from({ length: 48 }, (_, i) => assertCardId(i + 4));
    expect(() => generateBoard({ count: 5, ignore: ignored })).toThrow(
      RangeError,
    );
  });
});
