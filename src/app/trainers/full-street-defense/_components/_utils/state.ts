import { create } from "zustand";
import { simulateVsListEquity } from "@/lib/wasm-v1/simulation";
import { genHand, getShuffledDeck } from "@/utils/dealer";
import { genRandomInt } from "@/utils/general";
import {
  getHandsByStrength,
  getRangeStrengthByPosition,
} from "@/utils/hand-range";

const PEOPLE = 9;
const BB_POSITION = 2;
const SB = 0.5;
const BB = 1;
const BB_ANTE = 1;
const RAKE = 0.05;
const MIN_OPEN_RAISE = 2;
const MAX_OPEN_RAISE = 10;
const OPEN_RAISE_STEP = 0.5;

type Street = "preflop" | "flop" | "turn" | "river";
type HeroAction = "call" | "fold";

type State = {
  initialized: boolean;
  finished: boolean;
  confirmedHand: boolean;

  street: Street;
  stack: number;
  delta: number;
  expectedValue: number;

  hero: string[];
  deck: string[];
  board: string[];
  villainPosition: number;

  openRaise: number;
  pot: number;
  callAmount: number;
  rakeAmount: number;
  requiredEquity: number;
  heroEquity: number;

  action: HeroAction | null;
  equityHidden: boolean;
};

type Actions = {
  reset: () => void;
  retry: () => Promise<void>;
  shuffleAndDeal: () => Promise<void>;
  confirmHand: () => void;
  toggleEquityHidden: () => void;
  heroAction: (action: HeroAction) => Promise<void>;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
  finished: false,
  confirmedHand: false,

  street: "preflop",
  stack: 100,
  delta: 0,
  expectedValue: 0,

  hero: [],
  deck: [],
  board: [],
  villainPosition: 0,

  openRaise: 0,
  pot: 0,
  callAmount: 0,
  rakeAmount: 0,
  requiredEquity: 0,
  heroEquity: 0,

  action: null,
  equityHidden: true,
};

const getRandomOpenRaise = () => {
  const steps =
    Math.round((MAX_OPEN_RAISE - MIN_OPEN_RAISE) / OPEN_RAISE_STEP) + 1;
  return MIN_OPEN_RAISE + genRandomInt(steps) * OPEN_RAISE_STEP;
};

const getVillainPosition = () => {
  const positions = Array.from(
    { length: PEOPLE },
    (_, index) => index + 1,
  ).filter((position) => position !== BB_POSITION);
  return positions[genRandomInt(positions.length)] ?? 1;
};

const calcStreetMeta = (pot: number, callAmount: number) => {
  const rakeAmount = pot * RAKE;
  const effectivePot = Math.max(pot - rakeAmount, 0);
  const requiredEquity = effectivePot > 0 ? callAmount / effectivePot : 1;

  return { rakeAmount, requiredEquity };
};

const pickBetRate = (
  heroEquity: number,
  street: Exclude<Street, "preflop">,
) => {
  const villainEdge = Math.max(1 - heroEquity, 0);
  if (street === "flop") {
    if (villainEdge > 0.7) return 0.75;
    if (villainEdge > 0.55) return 0.5;
    return 0.33;
  }

  if (street === "turn") {
    if (villainEdge > 0.7) return 1.0;
    if (villainEdge > 0.55) return 0.66;
    return 0.5;
  }

  if (villainEdge > 0.7) return 1.2;
  if (villainEdge > 0.55) return 0.75;
  return 0.5;
};

const pickVillainBet = ({
  pot,
  heroEquity,
  street,
}: {
  pot: number;
  heroEquity: number;
  street: Exclude<Street, "preflop">;
}) => {
  const rate = pickBetRate(heroEquity, street);
  return Math.max(1, Math.round(pot * rate));
};

const simulateEquity = async ({
  hero,
  villainPosition,
  board,
}: {
  hero: string[];
  villainPosition: number;
  board: string[];
}) => {
  const result = await simulateVsListEquity({
    hero,
    board,
    compare: getHandsByStrength(getRangeStrengthByPosition(villainPosition), [
      ...hero,
      ...board,
    ]),
    trials: 1000,
  });

  return result.equity;
};

const setupNextStreet = async ({
  street,
  deck,
  board,
  hero,
  villainPosition,
  potAfterCall,
}: {
  street: Street;
  deck: string[];
  board: string[];
  hero: string[];
  villainPosition: number;
  potAfterCall: number;
}) => {
  if (street === "river") {
    return {
      street,
      deck,
      board,
      callAmount: 0,
      pot: potAfterCall,
      rakeAmount: 0,
      requiredEquity: 0,
      heroEquity: 0,
    };
  }

  const nextStreet: Exclude<Street, "preflop"> =
    street === "preflop" ? "flop" : street === "flop" ? "turn" : "river";
  const nextBoard = [...board];

  if (street === "preflop") {
    nextBoard.push(...deck.splice(0, 3));
  } else {
    nextBoard.push(...deck.splice(0, 1));
  }

  const heroEquity = await simulateEquity({
    hero,
    villainPosition,
    board: nextBoard,
  });
  const villainBet = pickVillainBet({
    pot: potAfterCall,
    heroEquity,
    street: nextStreet,
  });
  const nextPot = potAfterCall + villainBet;
  const { rakeAmount, requiredEquity } = calcStreetMeta(nextPot, villainBet);

  return {
    street: nextStreet,
    deck,
    board: nextBoard,
    callAmount: villainBet,
    pot: nextPot,
    rakeAmount,
    requiredEquity,
    heroEquity,
  };
};

const useFullStreetDefenseStore = create<Store>((set, get) => ({
  ...INITIAL_STATE,

  reset: () => {
    set(() => ({ ...INITIAL_STATE }));
  },

  retry: async () => {
    set(() => ({ ...INITIAL_STATE, stack: 100 }));
    await get().shuffleAndDeal();
  },

  shuffleAndDeal: async () => {
    const { stack, equityHidden } = get();
    const hero = genHand();
    const villainPosition = getVillainPosition();
    const openRaise = getRandomOpenRaise();
    const deck = getShuffledDeck([...hero]);
    const callAmount = Math.max(openRaise - BB, 0);
    const potBeforeCall = SB + BB + BB_ANTE + openRaise;
    const { rakeAmount, requiredEquity } = calcStreetMeta(
      potBeforeCall,
      callAmount,
    );
    const heroEquity = await simulateEquity({
      hero,
      villainPosition,
      board: [],
    });

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      stack: Math.max(0, stack - BB - BB_ANTE),
      delta: -(BB + BB_ANTE),
      hero,
      deck,
      villainPosition,
      openRaise,
      pot: potBeforeCall,
      callAmount,
      rakeAmount,
      requiredEquity,
      heroEquity,
      equityHidden,
    }));
  },

  confirmHand: () => {
    set(() => ({ confirmedHand: true }));
  },

  toggleEquityHidden: () => {
    set((state) => ({ equityHidden: !state.equityHidden }));
  },

  heroAction: async (action) => {
    const {
      finished,
      street,
      stack,
      pot,
      callAmount,
      rakeAmount,
      heroEquity,
      hero,
      board,
      deck,
      villainPosition,
    } = get();

    if (finished) return;

    if (action === "fold") {
      set(() => ({
        action,
        finished: true,
        expectedValue: 0,
        delta: 0,
      }));
      return;
    }

    const expectedValue = (pot - rakeAmount) * heroEquity - callAmount;
    const delta = Math.round(expectedValue);
    const nextStack = Math.max(0, stack + delta);
    const potAfterCall = pot + callAmount;

    const next = await setupNextStreet({
      street,
      deck: [...deck],
      board: [...board],
      hero,
      villainPosition,
      potAfterCall,
    });

    const handFinished = street === "river";

    set(() => ({
      action,
      expectedValue,
      delta,
      stack: nextStack,
      finished: handFinished,
      ...next,
    }));
  },
}));

export { useFullStreetDefenseStore };
