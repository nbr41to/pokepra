import { describe, expect, it } from "bun:test";
import { shuffleAndDeal } from "./dealer";
import {
  getRangeStrengthByHand,
  getRangeStrengthByPosition,
  judgeInRange,
} from "./hand-range";

const TRIALS = 100;

describe("utils integration", () => {
  it("shuffleAndDeal -> preflop action correctness matches range judgement", () => {
    for (let i = 0; i < TRIALS; i += 1) {
      const { position, hero } = shuffleAndDeal({
        people: 9,
        heroStrength: 0,
      });
      const positionStrength = getRangeStrengthByPosition(position, 9);
      const heroStrength = getRangeStrengthByHand(hero);
      const inRangeByStrength =
        heroStrength >= 0 &&
        positionStrength >= 0 &&
        heroStrength < positionStrength;
      const inRangeByTable = judgeInRange(hero, position, 9);

      expect(inRangeByStrength).toBe(inRangeByTable);
      expect(inRangeByTable ? "open-raise" : "fold").toBe(
        inRangeByStrength ? "open-raise" : "fold",
      );
    }
  });
});
