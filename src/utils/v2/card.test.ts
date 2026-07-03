import { describe, expect, it } from "bun:test";
import {
  assertValidCardId,
  cardIdToString,
  parseCardId,
  SUIT,
  SUIT_CHARS,
  suitOfId,
  toCardId,
  VALUE,
  VALUE_CHARS,
  valueOfId,
} from "./card";

const assertCardId = (id: number) => {
  assertValidCardId(id);
  return id;
};

describe("VALUE", () => {
  it("2 から A まで 0 ~ 12 の連番", () => {
    expect(VALUE.TWO).toBe(0);
    expect(VALUE.ACE).toBe(12);
  });
});

describe("VALUE_CHARS", () => {
  it("Value enum と同じ昇順で並んでいる（0='2', 12='A'）", () => {
    expect(VALUE_CHARS[VALUE.TWO]).toBe("2");
    expect(VALUE_CHARS[VALUE.TEN]).toBe("T");
    expect(VALUE_CHARS[VALUE.ACE]).toBe("A");
    expect(VALUE_CHARS.length).toBe(13);
  });
});

describe("SUIT / SUIT_CHARS", () => {
  it("c=0, d=1, h=2, s=3 の順", () => {
    expect(SUIT.CLUB).toBe(0);
    expect(SUIT.SPADE).toBe(3);
    expect(SUIT_CHARS[SUIT.CLUB]).toBe("c");
    expect(SUIT_CHARS[SUIT.SPADE]).toBe("s");
  });
});

describe("assertValidCardId", () => {
  it("0 ~ 51 の整数は通る", () => {
    expect(() => assertValidCardId(0)).not.toThrow();
    expect(() => assertValidCardId(25)).not.toThrow();
    expect(() => assertValidCardId(51)).not.toThrow();
  });

  it("範囲外の整数は RangeError を投げる", () => {
    expect(() => assertValidCardId(-1)).toThrow(RangeError);
    expect(() => assertValidCardId(52)).toThrow(RangeError);
  });

  it("整数でない値は RangeError を投げる", () => {
    expect(() => assertValidCardId(1.5)).toThrow(RangeError);
    expect(() => assertValidCardId(Number.NaN)).toThrow(RangeError);
    expect(() => assertValidCardId(Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });
});

describe("valueOfId / suitOfId", () => {
  it("CardId 0 は 2c（value=0, suit=0）", () => {
    const id = toCardId(VALUE.TWO, SUIT.CLUB);
    expect(valueOfId(id)).toBe(VALUE.TWO);
    expect(suitOfId(id)).toBe(SUIT.CLUB);
  });

  it("CardId 51 は As（value=12, suit=3）", () => {
    const id = toCardId(VALUE.ACE, SUIT.SPADE);
    expect(valueOfId(id)).toBe(VALUE.ACE);
    expect(suitOfId(id)).toBe(SUIT.SPADE);
  });

  it("(value << 2) | suit の関係を満たす", () => {
    for (let id = 0; id <= 51; id++) {
      const cardId = assertCardId(id);
      const v = valueOfId(cardId);
      const s = suitOfId(cardId);
      expect((v << 2) | s).toBe(id);
    }
  });
});

describe("toCardId", () => {
  it("value=0, suit=0 → 0", () => {
    expect(Number(toCardId(VALUE.TWO, SUIT.CLUB))).toBe(0);
  });

  it("value=12, suit=3 → 51", () => {
    expect(Number(toCardId(VALUE.ACE, SUIT.SPADE))).toBe(51);
  });

  it("全 52 通りで一意な CardId を生成する", () => {
    const ids = new Set<number>();
    for (let v = 0; v <= 12; v++) {
      for (let s = 0; s <= 3; s++) {
        // biome-ignore lint/suspicious/noExplicitAny: テスト目的で型を緩める
        ids.add(toCardId(v as any, s as any));
      }
    }
    expect(ids.size).toBe(52);
  });
});

describe("cardIdToString", () => {
  it("0 → '2c'", () => {
    expect(cardIdToString(toCardId(VALUE.TWO, SUIT.CLUB))).toBe("2c");
  });

  it("51 → 'As'", () => {
    expect(cardIdToString(toCardId(VALUE.ACE, SUIT.SPADE))).toBe("As");
  });

  it("中間値: 32 (Tc) → 'Tc'", () => {
    // VALUE.TEN=8, SUIT.CLUB=0 → (8 << 2) | 0 = 32
    expect(cardIdToString(toCardId(VALUE.TEN, SUIT.CLUB))).toBe("Tc");
  });
});

describe("parseCardId", () => {
  it("'2c' → 0", () => {
    expect(Number(parseCardId("2c"))).toBe(0);
  });

  it("'As' → 51", () => {
    expect(Number(parseCardId("As"))).toBe(51);
  });

  it("不正な文字列は RangeError を投げる", () => {
    expect(() => parseCardId("")).toThrow(RangeError);
    expect(() => parseCardId("A")).toThrow(RangeError);
    expect(() => parseCardId("As!")).toThrow(RangeError);
    expect(() => parseCardId("Zs")).toThrow(RangeError);
    expect(() => parseCardId("Ax")).toThrow(RangeError);
    expect(() => parseCardId("as")).toThrow(RangeError); // 小文字 value は受け付けない
  });
});

describe("parseCardId ↔ cardIdToString のラウンドトリップ", () => {
  it("全 52 枚で id → string → id が一致する", () => {
    for (let id = 0; id <= 51; id++) {
      const cardId = assertCardId(id);
      expect(Number(parseCardId(cardIdToString(cardId)))).toBe(id);
    }
  });
});
