import { create } from "zustand";
import {
  evaluateHandsRanking,
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

export type Street = "flop" | "turn" | "river";
export type BetActionLabelType = "size" | "equity";
export type HeroAction = "check" | "fold" | "bet" | null;

export type Villain = {
  id: number;
  hand: string[];
  heroEquity: number;
  villainEquity: number;
  active: boolean;
  reaction: "call" | "fold" | null;
};

type State = {
  initialized: boolean;
  finished: boolean;
  confirmedHand: boolean;
  processing: boolean;
  betActionLabelType: BetActionLabelType;
  street: Street;

  hero: string[];
  villains: Villain[];
  board: string[];
  deck: string[];

  pot: number;
  stack: number;
  delta: number;

  action: HeroAction;
  selectedBetRate: number | null;
  selectedBetSize: number;
  requiredEquity: number;
  showdownEquity: number;
  resultText: string;
  heroWinner: boolean;
  winnerVillainIds: number[];
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

const STREET_LABEL: Record<Street, string> = {
  flop: "Flop",
  turn: "Turn",
  river: "River",
};

const INITIAL_STATE: State = {
  initialized: false,
  finished: false,
  confirmedHand: false,
  processing: false,
  betActionLabelType: "size",
  street: "flop",

  hero: [],
  villains: [],
  board: [],
  deck: [],

  pot: DEFAULT_POT,
  stack: 0,
  delta: 0,

  action: null,
  selectedBetRate: null,
  selectedBetSize: 0,
  requiredEquity: 0,
  showdownEquity: 0,
  resultText: "",
  heroWinner: false,
  winnerVillainIds: [],
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
const toHandKey = (hand: string[]) => [...hand].sort().join(" ");

const buildNextStreet = ({
  street,
  board,
  deck,
}: {
  street: Street;
  board: string[];
  deck: string[];
}) => {
  const nextDeck = [...deck];

  if (street === "flop") {
    return {
      nextStreet: "turn" as const,
      nextBoard: [...board, ...nextDeck.splice(0, 1)],
      nextDeck,
      showdown: false,
    };
  }

  if (street === "turn") {
    return {
      nextStreet: "river" as const,
      nextBoard: [...board, ...nextDeck.splice(0, 1)],
      nextDeck,
      showdown: false,
    };
  }

  return {
    nextStreet: "river" as const,
    nextBoard: [...board],
    nextDeck,
    showdown: true,
  };
};

const updateVillainEquities = async ({
  hero,
  villains,
  board,
}: {
  hero: string[];
  villains: Villain[];
  board: string[];
}) => {
  return Promise.all(
    villains.map(async (villain) => {
      const payload = await simulateVsListEquity({
        hero,
        board,
        compare: [villain.hand],
        trials: 1200,
      });

      return {
        ...villain,
        heroEquity: payload.equity,
        villainEquity: 1 - payload.equity,
      };
    }),
  );
};

const applyVillainReactions = ({
  villains,
  callerIds,
}: {
  villains: Villain[];
  callerIds: Set<number>;
}) => {
  return villains.map((villain): Villain => {
    if (!villain.active) {
      return villain;
    }

    const called = callerIds.has(villain.id);
    return {
      ...villain,
      active: called,
      reaction: called ? ("call" as const) : ("fold" as const),
    };
  });
};

const useOffenseStore = create<Store>((set, get) => {
  const resolveHeroAction = async (
    action:
      | { type: "check" }
      | { type: "bet"; rate: (typeof BET_SIZE_RATES)[number] },
  ) => {
    const {
      finished,
      hero,
      villains,
      pot,
      stack,
      processing,
      street,
      board,
      deck,
    } = get();
    const activeVillains = villains.filter((villain) => villain.active);

    if (
      finished ||
      processing ||
      hero.length !== 2 ||
      activeVillains.length === 0
    )
      return;

    const requiredEquity =
      action.type === "bet" ? calcRequiredEquity(action.rate) : 0;
    const selectedBetRate = action.type === "bet" ? action.rate : null;
    const selectedBetSize =
      action.type === "bet" && selectedBetRate !== null
        ? pot * selectedBetRate
        : 0;

    set(() => ({ processing: true }));

    try {
      const callers = activeVillains.filter(
        (villain) => villain.villainEquity >= requiredEquity,
      );
      const callerIds = new Set(callers.map((villain) => villain.id));
      const reactedVillains = applyVillainReactions({
        villains,
        callerIds,
      });

      if (callers.length === 0) {
        const delta = withRoundedDelta(pot);
        const riverResolved = street === "river";

        set(() => ({
          processing: false,
          finished: true,
          action: action.type,
          villains: reactedVillains,
          selectedBetRate,
          selectedBetSize,
          requiredEquity,
          showdownEquity: 1,
          delta,
          stack: stack + delta,
          resultText: `${STREET_LABEL[street]}: 全員Fold`,
          heroWinner: riverResolved,
          winnerVillainIds: [],
        }));

        return;
      }

      const { nextStreet, nextBoard, nextDeck, showdown } = buildNextStreet({
        street,
        board,
        deck,
      });
      const refreshedCallers = await updateVillainEquities({
        hero,
        villains: callers,
        board: nextBoard,
      });
      const refreshedById = new Map(
        refreshedCallers.map((villain) => [villain.id, villain]),
      );
      const nextVillains = reactedVillains.map((villain) => {
        const refreshed = refreshedById.get(villain.id);
        return refreshed ?? villain;
      });
      const survivingCount = refreshedCallers.length;
      const nextPot =
        action.type === "bet"
          ? pot + selectedBetSize * (1 + survivingCount)
          : pot;

      if (!showdown) {
        set(() => ({
          processing: false,
          finished: false,
          street: nextStreet,
          board: nextBoard,
          deck: nextDeck,
          villains: nextVillains,
          pot: nextPot,
          action: action.type,
          selectedBetRate,
          selectedBetSize,
          requiredEquity,
          showdownEquity: 0,
          delta: 0,
          resultText: `${STREET_LABEL[street]}: ${survivingCount}人が継続`,
          heroWinner: false,
          winnerVillainIds: [],
        }));

        return;
      }

      const payload = await simulateMultiHandEquity({
        hands: [hero, ...refreshedCallers.map((villain) => villain.hand)],
        board: nextBoard,
        trials: 1500,
      });
      const heroEquity = pickHeroEquityFromPayload(payload, hero);
      const expectedValue =
        action.type === "bet"
          ? heroEquity * nextPot - selectedBetSize
          : heroEquity * nextPot;
      const delta = withRoundedDelta(expectedValue);
      const ranking = await evaluateHandsRanking({
        hands: [hero, ...refreshedCallers.map((villain) => villain.hand)],
        board: nextBoard,
      });
      const maxEncoded = ranking.reduce(
        (max, entry) => (entry.encoded > max ? entry.encoded : max),
        Number.MIN_SAFE_INTEGER,
      );
      const winnerHandKeys = new Set(
        ranking
          .filter((entry) => entry.encoded === maxEncoded)
          .map((entry) => toHandKey(entry.hand.split(" "))),
      );
      const heroWinner = winnerHandKeys.has(toHandKey(hero));
      const winnerVillainIds = refreshedCallers
        .filter((villain) => winnerHandKeys.has(toHandKey(villain.hand)))
        .map((villain) => villain.id);

      set(() => ({
        processing: false,
        finished: true,
        street: nextStreet,
        board: nextBoard,
        deck: nextDeck,
        villains: nextVillains,
        pot: nextPot,
        action: action.type,
        selectedBetRate,
        selectedBetSize,
        requiredEquity,
        showdownEquity: heroEquity,
        delta,
        stack: stack + delta,
        resultText: `${STREET_LABEL[street]}: ${survivingCount}人でショーダウン`,
        heroWinner,
        winnerVillainIds,
      }));
    } catch (_error) {
      set(() => ({ processing: false }));
    }
  };

  return {
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
      const villainHands = Array.from({ length: villainCount }, () => {
        const first = deck.shift() ?? "";
        const second = deck.shift() ?? "";
        return sortCardsByRankAndSuit([first, second]);
      });
      const board = deck.splice(0, 3);

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
            active: true,
            reaction: null,
          };
        });

        set(() => ({
          ...INITIAL_STATE,
          initialized: true,
          processing: false,
          stack,
          hero,
          villains,
          board,
          deck,
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
      await resolveHeroAction({ type: "check" });
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
        heroWinner: false,
        winnerVillainIds: [],
      }));
    },

    heroBet: async (rate) => {
      await resolveHeroAction({ type: "bet", rate });
    },
  };
});

export { BET_SIZE_RATES, STREET_LABEL, useOffenseStore };
