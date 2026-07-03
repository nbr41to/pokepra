import { create } from "zustand";
import type { CardId } from "@/utils/v2/card";
import type { Combo } from "@/utils/v2/combo";
import { generateBoard, generateCombo } from "@/utils/v2/game";

export type HoldemRound =
  | "Starting"
  | "Ante"
  | "DealPreflop"
  | "Preflop"
  | "DealFlop"
  | "Flop"
  | "DealTurn"
  | "Turn"
  | "DealRiver"
  | "River"
  | "Showdown"
  | "Complete";

export type PlayerBitSet = boolean[];

export type RoundData = {
  /** この round 開始時点で hand に残っているプレイヤー。 */
  startingPlayerActive: PlayerBitSet;
  /** まだこの round で action が必要なプレイヤー。 */
  needsAction: PlayerBitSet;
  /** この round で許可される最小 raise 幅。 */
  minRaise: number;
  /** この round の現在の最大ベット額。 */
  bet: number;
  /** この round 内で各プレイヤーが支払った額。 */
  playerBet: number[];
  /** この round 内で発生した bet / call / raise の回数。 */
  totalBetCount: number;
  /** この round 内で発生した raise の回数。 */
  totalRaiseCount: number;
  /** 次に action するプレイヤーの index。 */
  toActIdx: number;
};

/**
 * HoldemGameState
 * rs-poker の GameState に寄せた Texas Hold'em のゲーム状態。
 * UI から扱いやすいように CardId / Combo と camelCase のプロパティで保持する。
 */
export type HoldemGameState = {
  /** hand 開始時のプレイヤー人数。 */
  numPlayers: number;
  /** fold しておらず、hand に残っているプレイヤー。 */
  playerActive: PlayerBitSet;
  /** stack が 0 になり all-in 状態のプレイヤー。 */
  playerAllIn: PlayerBitSet;
  /** 現在 pot に入っている合計額。 */
  totalPot: number;
  /** 各プレイヤーの現在 stack。 */
  stacks: number[];
  /** hand 開始時点の各プレイヤー stack。 */
  startingStacks: number[];
  /** hand 全体で各プレイヤーが pot に支払った額。 */
  playerBet: number[];
  /** 精算で各プレイヤーに払い戻した額。 */
  playerWinnings: number[];
  /** Big blind の額。 */
  bigBlind: number;
  /** Small blind の額。 */
  smallBlind: number;
  /** Ante の額。 */
  ante: number;
  /** 各プレイヤーのホールカード。index はプレイヤー index と一致する。 */
  hands: Combo[];
  /** Dealer button のプレイヤー index。 */
  dealerIdx: number;
  /** 現在の round。 */
  round: HoldemRound;
  /** Complete 直前など、直前の round を保持する。 */
  roundBefore: HoldemRound;
  /** 現在 round 内の action 状態。 */
  roundData: RoundData;
  /** Board に出ている community card。 */
  board: CardId[];
  /** Big blind が投稿済みかどうか。 */
  bbPosted: boolean;
  /** Small blind が投稿済みかどうか。 */
  sbPosted: boolean;
};

export type InitializeOptions = {
  numPlayers?: number;
  stack?: number;
  stacks?: number[];
  bigBlind?: number;
  smallBlind?: number;
  ante?: number;
  dealerIdx?: number;
};

type Store = HoldemGameState & {
  /**
   * 新しいゲーム状態を作る。
   * まだカードは配らず、rs-poker の GameState::new_starting に近い初期状態にする。
   */
  initialize: (options?: InitializeOptions) => void;

  /**
   * デフォルト設定でゲーム状態を初期化する。
   * UI のクリア操作やテストの前処理で使う。
   */
  reset: () => void;

  /**
   * ゲーム状態を初期化し、プリフロップの手札配布とブラインド投稿まで進める。
   */
  shuffleAndDeal: (options?: InitializeOptions) => void;

  /**
   * round を次の状態へ進める。
   * DealPreflop / DealFlop / DealTurn / DealRiver では対応する deal 関数を呼び出す。
   */
  advanceRound: () => void;

  /**
   * 全プレイヤーへ Combo を配り、SB / BB を投稿して Preflop に進める。
   */
  dealPreflop: () => void;

  /**
   * 未使用カードからフロップ 3 枚を生成し、Flop に進める。
   */
  dealFlop: () => void;

  /**
   * 未使用カードからターン 1 枚を追加し、Turn に進める。
   */
  dealTurn: () => void;

  /**
   * 未使用カードからリバー 1 枚を追加し、River に進める。
   */
  dealRiver: () => void;

  /**
   * プレイヤーを fold させ、active から除外する。
   * playerIdx を省略した場合は roundData.toActIdx のプレイヤーを対象にする。
   */
  fold: (playerIdx?: number) => void;

  /**
   * 現在の bet に対して追加支払いなしでアクションを完了する。
   * コールすべき差額がある場合は RangeError を投げる。
   */
  check: (playerIdx?: number) => void;

  /**
   * 現在の bet に追いつくために必要な差額を支払う。
   */
  call: (playerIdx?: number) => void;

  /**
   * 指定した追加額を支払う。
   * amount は最終ベット額ではなく、この action で支払うチップ量。
   */
  bet: (amount: number, playerIdx?: number) => void;

  /**
   * ラウンド内の累計ベット額が amount になるように支払う。
   */
  raiseTo: (amount: number, playerIdx?: number) => void;

  /**
   * 対象プレイヤーの残り stack 全額を支払う。
   */
  allIn: (playerIdx?: number) => void;

  /**
   * 指定プレイヤーへ pot の払い戻しや勝利額を加算する。
   * hand 完了後の精算処理で使う。
   */
  award: (playerIdx: number, amount: number) => void;

  /**
   * 現在の round を roundBefore に保存し、ゲームを Complete にする。
   */
  complete: () => void;
};

const DEFAULT_NUM_PLAYERS = 6;
const DEFAULT_STACK = 100;
const DEFAULT_BIG_BLIND = 1;
const DEFAULT_SMALL_BLIND = 0.5;

const ROUND_ORDER: HoldemRound[] = [
  "Starting",
  "Ante",
  "DealPreflop",
  "Preflop",
  "DealFlop",
  "Flop",
  "DealTurn",
  "Turn",
  "DealRiver",
  "River",
  "Showdown",
  "Complete",
];

const nextRound = (round: HoldemRound): HoldemRound =>
  ROUND_ORDER[Math.min(ROUND_ORDER.indexOf(round) + 1, ROUND_ORDER.length - 1)];

const createBitSet = (length: number, value: boolean) =>
  Array.from({ length }, () => value);

const normalizeOptions = (options: InitializeOptions = {}) => {
  const numPlayers =
    options.stacks?.length ?? options.numPlayers ?? DEFAULT_NUM_PLAYERS;
  if (!Number.isInteger(numPlayers) || numPlayers < 2 || numPlayers > 9) {
    throw new RangeError(
      `numPlayers must be an integer in [2, 9], got ${numPlayers}`,
    );
  }

  const stacks =
    options.stacks ??
    Array.from({ length: numPlayers }, () => options.stack ?? DEFAULT_STACK);
  if (stacks.length !== numPlayers || stacks.some((stack) => stack < 0)) {
    throw new RangeError(
      "stacks must contain one non-negative value per player",
    );
  }

  return {
    numPlayers,
    stacks,
    bigBlind: options.bigBlind ?? DEFAULT_BIG_BLIND,
    smallBlind: options.smallBlind ?? DEFAULT_SMALL_BLIND,
    ante: options.ante ?? 0,
    dealerIdx: options.dealerIdx ?? 0,
  };
};

const nextActiveAfter = (active: PlayerBitSet, idx: number) => {
  for (let i = 1; i <= active.length; i++) {
    const next = (idx + i) % active.length;
    if (active[next]) return next;
  }
  return idx;
};

const countTrue = (values: PlayerBitSet) => values.filter(Boolean).length;

const blindIndexes = (active: PlayerBitSet, dealerIdx: number) => {
  if (countTrue(active) === 2) {
    const bbIdx = nextActiveAfter(active, dealerIdx);
    return { sbIdx: dealerIdx, bbIdx };
  }
  const sbIdx = nextActiveAfter(active, dealerIdx);
  return { sbIdx, bbIdx: nextActiveAfter(active, sbIdx) };
};

const createRoundData = (
  numPlayers: number,
  minRaise: number,
  active: PlayerBitSet,
  toActIdx: number,
): RoundData => ({
  startingPlayerActive: [...active],
  needsAction: [...active],
  minRaise: minRaise,
  bet: 0,
  playerBet: Array.from({ length: numPlayers }, () => 0),
  totalBetCount: 0,
  totalRaiseCount: 0,
  toActIdx: toActIdx,
});

const createInitialState = (options?: InitializeOptions): HoldemGameState => {
  const { numPlayers, stacks, bigBlind, smallBlind, ante, dealerIdx } =
    normalizeOptions(options);
  const active = createBitSet(numPlayers, true);

  return {
    numPlayers: numPlayers,
    playerActive: active,
    playerAllIn: createBitSet(numPlayers, false),
    totalPot: 0,
    stacks: [...stacks],
    startingStacks: [...stacks],
    playerBet: Array.from({ length: numPlayers }, () => 0),
    playerWinnings: Array.from({ length: numPlayers }, () => 0),
    bigBlind: bigBlind,
    smallBlind: smallBlind,
    ante,
    hands: [],
    dealerIdx: dealerIdx,
    round: "Starting",
    roundBefore: "Starting",
    roundData: createRoundData(numPlayers, bigBlind, active, dealerIdx),
    board: [],
    bbPosted: false,
    sbPosted: false,
  };
};

const usedCards = (state: HoldemGameState) => [
  ...state.board,
  ...state.hands.flat(),
];

const postForcedBet = (
  state: HoldemGameState,
  playerIdx: number,
  amount: number,
): HoldemGameState => {
  const paid = Math.min(amount, state.stacks[playerIdx]);
  const stacks = [...state.stacks];
  const playerBet = [...state.playerBet];
  const roundPlayerBet = [...state.roundData.playerBet];
  const playerAllIn = [...state.playerAllIn];

  stacks[playerIdx] -= paid;
  playerBet[playerIdx] += paid;
  roundPlayerBet[playerIdx] += paid;
  playerAllIn[playerIdx] = stacks[playerIdx] === 0;

  return {
    ...state,
    stacks,
    playerBet: playerBet,
    playerAllIn: playerAllIn,
    totalPot: state.totalPot + paid,
    roundData: {
      ...state.roundData,
      bet: Math.max(state.roundData.bet, roundPlayerBet[playerIdx]),
      playerBet: roundPlayerBet,
      totalBetCount: state.roundData.totalBetCount + 1,
    },
  };
};

const applyBet = (
  state: HoldemGameState,
  playerIdx: number,
  amount: number,
): HoldemGameState => {
  if (!state.playerActive[playerIdx] || state.playerAllIn[playerIdx])
    return state;
  if (amount < 0)
    throw new RangeError(`Bet amount must be non-negative, got ${amount}`);

  const paid = Math.min(amount, state.stacks[playerIdx]);
  const stacks = [...state.stacks];
  const playerBet = [...state.playerBet];
  const roundPlayerBet = [...state.roundData.playerBet];
  const playerAllIn = [...state.playerAllIn];
  const needsAction = [...state.roundData.needsAction];
  const previousBet = state.roundData.bet;

  stacks[playerIdx] -= paid;
  playerBet[playerIdx] += paid;
  roundPlayerBet[playerIdx] += paid;
  playerAllIn[playerIdx] = stacks[playerIdx] === 0;

  const nextBet = Math.max(previousBet, roundPlayerBet[playerIdx]);
  if (nextBet > previousBet) {
    for (let i = 0; i < needsAction.length; i++) {
      needsAction[i] =
        state.playerActive[i] && !playerAllIn[i] && i !== playerIdx;
    }
  } else {
    needsAction[playerIdx] = false;
  }

  return {
    ...state,
    stacks,
    playerBet: playerBet,
    playerAllIn: playerAllIn,
    totalPot: state.totalPot + paid,
    roundData: {
      ...state.roundData,
      bet: nextBet,
      minRaise:
        nextBet > previousBet
          ? Math.max(state.roundData.minRaise, nextBet - previousBet)
          : state.roundData.minRaise,
      needsAction: needsAction,
      playerBet: roundPlayerBet,
      totalBetCount: state.roundData.totalBetCount + (paid > 0 ? 1 : 0),
      totalRaiseCount:
        state.roundData.totalRaiseCount + (nextBet > previousBet ? 1 : 0),
      toActIdx: nextActiveAfter(needsAction, playerIdx),
    },
  };
};

const currentPlayer = (state: HoldemGameState) => state.roundData.toActIdx;

export const useHoldem = create<Store>((set, get) => ({
  ...createInitialState(),

  /** 新しいゲーム状態を作る。 */
  initialize: (options) => set(createInitialState(options)),

  /** デフォルト設定でゲーム状態を初期化する。 */
  reset: () => set(createInitialState()),

  /** 初期化してプリフロップの配牌とブラインド投稿まで進める。 */
  shuffleAndDeal: (options) => {
    set(createInitialState(options));
    get().dealPreflop();
  },

  /** round を次の状態へ進め、Deal 系 round ではカードを配る。 */
  advanceRound: () => {
    const { round } = get();
    if (round === "DealPreflop") return get().dealPreflop();
    if (round === "DealFlop") return get().dealFlop();
    if (round === "DealTurn") return get().dealTurn();
    if (round === "DealRiver") return get().dealRiver();
    set({ roundBefore: round, round: nextRound(round) });
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

    const { sbIdx, bbIdx } = blindIndexes(state.playerActive, state.dealerIdx);
    const toActIdx = nextActiveAfter(state.playerActive, bbIdx);
    const roundData = createRoundData(
      state.numPlayers,
      state.bigBlind,
      state.playerActive,
      toActIdx,
    );
    roundData.needsAction[sbIdx] = true;
    roundData.needsAction[bbIdx] = false;

    const withHands = {
      ...state,
      hands,
      round: "Preflop" as const,
      roundBefore: state.round,
      roundData: roundData,
    };
    const withSmallBlind = postForcedBet(withHands, sbIdx, state.smallBlind);
    const withBigBlind = postForcedBet(withSmallBlind, bbIdx, state.bigBlind);

    set({
      ...withBigBlind,
      sbPosted: true,
      bbPosted: true,
      roundData: {
        ...withBigBlind.roundData,
        needsAction: roundData.needsAction,
        toActIdx: toActIdx,
      },
    });
  },

  /** フロップ 3 枚を生成して Flop に進める。 */
  dealFlop: () => {
    const state = get();
    const board = generateBoard({ count: 3, ignore: usedCards(state) });
    const toActIdx = nextActiveAfter(state.playerActive, state.dealerIdx);
    set({
      board,
      round: "Flop",
      roundBefore: state.round,
      roundData: createRoundData(
        state.numPlayers,
        state.bigBlind,
        state.playerActive,
        toActIdx,
      ),
    });
  },

  /** ターン 1 枚を追加して Turn に進める。 */
  dealTurn: () => {
    const state = get();
    const [turn] = generateBoard({ count: 1, ignore: usedCards(state) });
    const toActIdx = nextActiveAfter(state.playerActive, state.dealerIdx);
    set({
      board: [...state.board, turn],
      round: "Turn",
      roundBefore: state.round,
      roundData: createRoundData(
        state.numPlayers,
        state.bigBlind,
        state.playerActive,
        toActIdx,
      ),
    });
  },

  /** リバー 1 枚を追加して River に進める。 */
  dealRiver: () => {
    const state = get();
    const [river] = generateBoard({ count: 1, ignore: usedCards(state) });
    const toActIdx = nextActiveAfter(state.playerActive, state.dealerIdx);
    set({
      board: [...state.board, river],
      round: "River",
      roundBefore: state.round,
      roundData: createRoundData(
        state.numPlayers,
        state.bigBlind,
        state.playerActive,
        toActIdx,
      ),
    });
  },

  /** 対象プレイヤーを active から除外する。 */
  fold: (playerIdx = currentPlayer(get())) => {
    const state = get();
    const playerActive = [...state.playerActive];
    const needsAction = [...state.roundData.needsAction];
    playerActive[playerIdx] = false;
    needsAction[playerIdx] = false;
    const round = countTrue(playerActive) <= 1 ? "Complete" : state.round;
    set({
      playerActive: playerActive,
      round,
      roundBefore: round === "Complete" ? state.round : state.roundBefore,
      roundData: {
        ...state.roundData,
        needsAction: needsAction,
        toActIdx: nextActiveAfter(needsAction, playerIdx),
      },
    });
  },

  /** 追加支払いなしでアクションを完了する。 */
  check: (playerIdx = currentPlayer(get())) => {
    const state = get();
    const currentBet = state.roundData.playerBet[playerIdx];
    if (currentBet !== state.roundData.bet) {
      throw new RangeError("Cannot check while facing a bet");
    }
    set(applyBet(state, playerIdx, 0));
  },

  /** 現在の bet に追いつく差額を支払う。 */
  call: (playerIdx = currentPlayer(get())) => {
    const state = get();
    const amount = Math.max(
      0,
      state.roundData.bet - state.roundData.playerBet[playerIdx],
    );
    set(applyBet(state, playerIdx, amount));
  },

  /** 指定した追加額を支払う。 */
  bet: (amount, playerIdx = currentPlayer(get())) => {
    set(applyBet(get(), playerIdx, amount));
  },

  /** ラウンド内の累計ベット額が amount になるように支払う。 */
  raiseTo: (amount, playerIdx = currentPlayer(get())) => {
    const state = get();
    const currentBet = state.roundData.playerBet[playerIdx];
    set(applyBet(state, playerIdx, Math.max(0, amount - currentBet)));
  },

  /** 残り stack 全額を支払う。 */
  allIn: (playerIdx = currentPlayer(get())) => {
    const state = get();
    set(applyBet(state, playerIdx, state.stacks[playerIdx]));
  },

  /** 指定プレイヤーへ勝利額を加算する。 */
  award: (playerIdx, amount) => {
    const state = get();
    const stacks = [...state.stacks];
    const playerWinnings = [...state.playerWinnings];
    stacks[playerIdx] += amount;
    playerWinnings[playerIdx] += amount;
    set({ stacks, playerWinnings: playerWinnings });
  },

  /** ゲームを Complete にする。 */
  complete: () => {
    const state = get();
    set({ round: "Complete", roundBefore: state.round });
  },
}));
