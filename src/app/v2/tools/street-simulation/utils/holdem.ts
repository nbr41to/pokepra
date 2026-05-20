import { create } from "zustand";
import type { CardId } from "@/utils/v2/card";
import type { Combo } from "@/utils/v2/combo";
import { generateBoard, generateCombo } from "@/utils/v2/game";

const ROUND = {
  INITIAL: 0,
  PREFLOP: 1,
  FLOP: 2,
  TURN: 3,
  RIVER: 4,
} as const;
type Round = (typeof ROUND)[keyof typeof ROUND];

type State = {
  numPlayers: number;
  round: Round;
  hands: Combo[];
  board: CardId[];
  openedBoard: CardId[];
  stack: number;
  heroIndex: number;
  villainIndex: number;
  buttonIndex: number;
};
type Action = {
  initialize: () => void;
  shuffleAndDeal: () => void;
  dealPreflop: () => void;
  dealFlop: () => void;
  dealTurn: () => void;
  dealRiver: () => void;
};

const DEFAULT_NUM_PLAYERS = 6;
const DEFAULT_STACK = 100;

function createInitialState(numPlayers = DEFAULT_NUM_PLAYERS): State {
  const hands: Combo[] = [];
  let ignore: CardId[] = [];
  for (let i = 0; i < numPlayers; i++) {
    const hand = generateCombo({ ignore });
    hands.push(hand);
    ignore = [...ignore, ...hand];
  }
  const board = generateBoard({ count: 5, ignore: hands.flat() });

  return {
    numPlayers,
    round: ROUND.FLOP,
    hands,
    board,
    openedBoard: board.slice(0, 3),
    stack: DEFAULT_STACK,
    heroIndex: 0,
    villainIndex: 1,
    buttonIndex: 0,
  };
}

export const useHoldem = create<State & Action>((set, get) => ({
  ...createInitialState(),

  /** 新しいゲーム状態を作る。 */
  initialize: () => set(createInitialState()),

  /** デフォルト設定でゲーム状態を初期化する。 */
  reset: () => set(createInitialState()),

  /** 初期化してプリフロップの配牌とブラインド投稿まで進める。 */
  shuffleAndDeal: () => {
    set(createInitialState());
    get().dealFlop();
  },

  /** 全プレイヤーへ Combo を配り、SB / BB を投稿して Preflop に進める。 */
  dealPreflop: () => {
    const state = get();
    const hands: Combo[] = [];
    let ignore: CardId[] = [];
    for (let i = 0; i < state.numPlayers; i++) {
      const hand = generateCombo({ ignore });
      hands.push(hand);
      ignore = [...ignore, ...hand];
    }
    const board = generateBoard({ count: 5, ignore: state.hands.flat() });
    set({
      hands,
      board,
      openedBoard: [],
      round: ROUND.PREFLOP,
    });
  },

  /** フロップ 3 枚を生成して Flop に進める。 */
  dealFlop: () => {
    const { board } = get();
    set({
      openedBoard: board.slice(0, 3),
      round: ROUND.FLOP,
    });
  },

  /** ターン 1 枚を追加して Turn に進める。 */
  dealTurn: () => {
    const { board } = get();
    set({
      openedBoard: board.slice(0, 4),
      round: ROUND.TURN,
    });
  },

  /** リバー 1 枚を追加して River に進める。 */
  dealRiver: () => {
    const { board } = get();
    set({
      openedBoard: board.slice(0, 5),
      round: ROUND.RIVER,
    });
  },
}));
