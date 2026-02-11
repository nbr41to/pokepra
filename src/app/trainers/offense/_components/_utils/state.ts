import { create } from "zustand";
import {
  simulateMultiHandEquity,
  simulateVsListEquity,
} from "@/lib/wasm-v1/simulation";
import {
  genHand,
  getShuffledDeck,
  sortCardsByRankAndSuit,
} from "@/utils/dealer";
import { genRandomInt } from "@/utils/general";

const DEFAULT_POT = 10;
const BET_SIZE_RATES = [0.33, 0.5, 0.67, 1.0, 1.25, 1.5, 2.0] as const;

export type BetActionLabelType = "size" | "equity";
export type HeroAction = "check" | "fold" | "bet" | null;
export type VillainDecision = "call" | "fold" | null;

export type Villain = {
  id: number;
  hand: string[];
  heroEquity: number;
  villainEquity: number;
  decision: VillainDecision;
};

type State = {
  initialized: boolean;
  finished: boolean;
  confirmedHand: boolean;
  processing: boolean;
  betActionLabelType: BetActionLabelType;

  hero: string[];
  villains: Villain[];

  pot: number;
  stack: number;
  delta: number;

  action: HeroAction;
  selectedBetRate: number | null;
  selectedBetSize: number;
  requiredEquity: number;
  showdownEquity: number;
  resultText: string;
};

type Actions = {
  reset: () => void;
  shuffleAndDeal: () => Promise<void>;
  confirmHand: () => void;
  toggleBetActionLabelType: () => void;
  heroCheck: () => Promise<void>;
  heroFold: () => void;
  heroBet: (rate: (typeof BET_SIZE_RATES)[number]) => Promise<void>;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
  finished: false,
  confirmedHand: false,
  processing: false,
  betActionLabelType: "size",

  hero: [],
  villains: [],

  pot: DEFAULT_POT,
  stack: 0,
  delta: 0,

  action: null,
  selectedBetRate: null,
  selectedBetSize: 0,
  requiredEquity: 0,
  showdownEquity: 0,
  resultText: "",
};

const calcRequiredEquity = (rate: number) => rate / (1 + rate * 2);

const pickHeroEquityFromPayload = (
  payload: { data: { hand: string; equity: number }[] },
  hero: string[],
) => {
  const key = hero.join(" ");
  const hit = payload.data.find((entry) => entry.hand === key);

  return hit?.equity ?? payload.data[0]?.equity ?? 0;
};

const withRoundedDelta = (value: number) => Math.round(value);

const useOffenseStore = create<Store>((set, get) => ({
  ...INITIAL_STATE,

  reset: () => {
    set((state) => ({
      ...INITIAL_STATE,
      stack: state.stack,
      betActionLabelType: state.betActionLabelType,
    }));
  },

  shuffleAndDeal: async () => {
    const { stack, betActionLabelType } = get();
    if (get().processing) return;
    set(() => ({ processing: true }));
    const hero = genHand();
    const villainCount = 2 + genRandomInt(3);
    const deck = getShuffledDeck(hero);
    const villainHands = Array.from({ length: villainCount }, (_, index) => {
      const first = deck[index * 2] ?? "";
      const second = deck[index * 2 + 1] ?? "";
      return sortCardsByRankAndSuit([first, second]);
    });

    try {
      const heroEquities = await Promise.all(
        villainHands.map(async (hand) => {
          const payload = await simulateVsListEquity({
            hero,
            board: [],
            compare: [hand],
            trials: 1200,
          });

          return payload.equity;
        }),
      );

      const villains: Villain[] = villainHands.map((hand, index) => {
        const heroEquity = heroEquities[index] ?? 0;
        return {
          id: index + 1,
          hand,
          heroEquity,
          villainEquity: 1 - heroEquity,
          decision: null,
        };
      });

      set(() => ({
        ...INITIAL_STATE,
        initialized: true,
        processing: false,
        stack,
        hero,
        villains,
        betActionLabelType,
      }));
    } catch (_error) {
      set(() => ({ processing: false }));
    }
  },

  confirmHand: () => {
    set(() => ({ confirmedHand: true }));
  },

  toggleBetActionLabelType: () => {
    set((state) => ({
      betActionLabelType:
        state.betActionLabelType === "size" ? "equity" : "size",
    }));
  },

  heroCheck: async () => {
    const { finished, hero, villains, pot, stack, processing } = get();
    if (finished || processing || hero.length !== 2 || villains.length === 0)
      return;
    set(() => ({ processing: true }));

    try {
      const payload = await simulateMultiHandEquity({
        hands: [hero, ...villains.map((villain) => villain.hand)],
        board: [],
        trials: 1500,
      });
      const heroEquity = pickHeroEquityFromPayload(payload, hero);
      const expectedValue = heroEquity * pot;
      const delta = withRoundedDelta(expectedValue);

      set(() => ({
        processing: false,
        finished: true,
        action: "check",
        villains: villains.map((villain) => ({ ...villain, decision: "call" })),
        showdownEquity: heroEquity,
        delta,
        stack: stack + delta,
        resultText: `Check: ${villains.length}人でショーダウン`,
        selectedBetRate: null,
        selectedBetSize: 0,
        requiredEquity: 0,
      }));
    } catch (_error) {
      set(() => ({ processing: false }));
    }
  },

  heroFold: () => {
    const { finished } = get();
    if (finished) return;

    set(() => ({
      finished: true,
      action: "fold",
      delta: 0,
      showdownEquity: 0,
      resultText: "Fold",
      selectedBetRate: null,
      selectedBetSize: 0,
      requiredEquity: 0,
    }));
  },

  heroBet: async (rate) => {
    const { finished, hero, villains, pot, stack, processing } = get();
    if (finished || processing || hero.length !== 2 || villains.length === 0)
      return;
    set(() => ({ processing: true }));

    try {
      const requiredEquity = calcRequiredEquity(rate);
      const callers = villains.filter(
        (villain) => villain.villainEquity >= requiredEquity,
      );
      const villainsWithDecision: Villain[] = villains.map((villain) => ({
        ...villain,
        decision: callers.some((caller) => caller.id === villain.id)
          ? "call"
          : "fold",
      }));

      const betSize = pot * rate;

      if (callers.length === 0) {
        const delta = withRoundedDelta(pot);

        set(() => ({
          processing: false,
          finished: true,
          action: "bet",
          villains: villainsWithDecision,
          selectedBetRate: rate,
          selectedBetSize: betSize,
          requiredEquity,
          showdownEquity: 1,
          delta,
          stack: stack + delta,
          resultText: "Bet: 全員Fold",
        }));
        return;
      }

      const payload = await simulateMultiHandEquity({
        hands: [hero, ...callers.map((caller) => caller.hand)],
        board: [],
        trials: 1500,
      });
      const heroEquity = pickHeroEquityFromPayload(payload, hero);
      const finalPot = pot + betSize * (1 + callers.length);
      const expectedValue = heroEquity * finalPot - betSize;
      const delta = withRoundedDelta(expectedValue);

      set(() => ({
        processing: false,
        finished: true,
        action: "bet",
        villains: villainsWithDecision,
        selectedBetRate: rate,
        selectedBetSize: betSize,
        requiredEquity,
        showdownEquity: heroEquity,
        delta,
        stack: stack + delta,
        resultText: `Bet: ${callers.length}/${villains.length}人がCall`,
      }));
    } catch (_error) {
      set(() => ({ processing: false }));
    }
  },
}));

export { BET_SIZE_RATES, useOffenseStore };
