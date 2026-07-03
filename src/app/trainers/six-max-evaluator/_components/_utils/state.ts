import { create } from "zustand";
import { genHand, getShuffledDeck } from "@/utils/dealer";
import { genPositionNumber } from "@/utils/position";
import { buildEvaluation, evaluateActions } from "./action-evaluator";
import {
  expandRange,
  getOpenRangeForPosition,
  getSixMaxActionOrder,
} from "./six-max-range";
import {
  type ActionChoice,
  type ActionEvaluation,
  BIG_BLIND,
  type HistoryEntry,
  INITIAL_STACK,
  POOL_PEOPLE,
  SMALL_BLIND,
  type Street,
} from "./types";

export type SixMaxState = {
  /** 0なら未初期化 */
  gameId: number;
  street: Street;
  finished: boolean;
  evaluating: boolean;
  /** ヒーローのカード */
  hero: string[];
  /** 場のボード */
  board: string[];
  /** 残デッキ */
  deck: string[];
  /** ヒーローのポジション (1..6) */
  position: number;
  /** ヒーローのスタック (chip) */
  heroStack: number;
  /** 主要なvillainの想定スタック (chip) */
  villainStack: number;
  /** ポット (chip) */
  pot: number;
  /** ヒーローが今コールに必要なchip */
  toCall: number;
  /** villainの想定レンジ (実カードリスト) */
  villainRange: string[][];
  /** ヒーローを除き、現時点でハンドに残っている相手の数 (>= 1) */
  numOpponents: number;
  /** Preflopアクション状況: 既にopen-raiseがあったか */
  preflopState: {
    opener: number | null; // position
    threeBettor: number | null; // position
    /** opener以外でcoldコールしたポジション一覧 */
    coldCallers: number[];
  };
  /** 履歴 */
  history: HistoryEntry[];
  /** 直近の評価結果 (UI表示用) */
  lastEvaluation: ActionEvaluation | null;
  /** 累積スコア */
  totalEvLoss: number;
  /** ラウンド数 */
  roundsPlayed: number;
};

export type SixMaxActions = {
  startNewRound: () => void;
  submitAction: (choice: ActionChoice) => Promise<void>;
  clearAll: () => void;
};

type Store = SixMaxState & SixMaxActions;

const INITIAL: SixMaxState = {
  gameId: 0,
  street: "preflop",
  finished: false,
  evaluating: false,
  hero: [],
  board: [],
  deck: [],
  position: 0,
  heroStack: INITIAL_STACK,
  villainStack: INITIAL_STACK,
  pot: 0,
  toCall: 0,
  villainRange: [],
  numOpponents: 1,
  preflopState: { opener: null, threeBettor: null, coldCallers: [] },
  history: [],
  lastEvaluation: null,
  totalEvLoss: 0,
  roundsPlayed: 0,
};

/** opener以外の各ポジションがcoldコールする確率 (簡易モデル) */
const COLD_CALL_PROBABILITY = 0.15;
/** opener不在時にHeroの後ろがcoldコールする確率 */
const POST_HERO_CALL_PROBABILITY = 0.2;

/**
 * Preflopの初期状態を構築
 * - ランダムにopener (Hero以前のポジションがopenする確率) をシミュレート
 * - opener以外でHero以前のポジションがcold-callする確率を考慮
 * - opener不在時はHeroがopenする想定で、後続ポジション+BBの参加数を推定
 * - Heroのアクション順を計算し、to call/pot/villainRange/numOpponentsを設定
 */
function setupPreflop(
  hero: string[],
  position: number,
): {
  pot: number;
  toCall: number;
  villainRange: string[][];
  preflopState: SixMaxState["preflopState"];
  villainStack: number;
  numOpponents: number;
} {
  const actionOrder = getSixMaxActionOrder();
  const heroIndex = actionOrder.indexOf(position);

  let opener: number | null = null;
  // Heroより前のポジションが順番にopen判定
  for (let i = 0; i < heroIndex; i++) {
    const pos = actionOrder[i];
    // 簡易: そのポジションのopen率 (UTG ~12%, ..., BTN ~45%) からopenするかどうか乱数で判定
    const openRate = expandRange(getOpenRangeForPosition(pos)).length / 1326;
    if (Math.random() < openRate) {
      opener = pos;
      break;
    }
  }

  // opener以外のcold-call判定
  const coldCallers: number[] = [];
  if (opener !== null) {
    const openerIndex = actionOrder.indexOf(opener);
    for (let i = openerIndex + 1; i < heroIndex; i++) {
      if (Math.random() < COLD_CALL_PROBABILITY) {
        coldCallers.push(actionOrder[i]);
      }
    }
  }

  // Blind付与
  let pot = SMALL_BLIND + BIG_BLIND;
  let toCall = 0;
  let villainStack = INITIAL_STACK - BIG_BLIND;

  // Heroのblind負担
  if (position === 1) {
    // SB
    toCall = BIG_BLIND - SMALL_BLIND;
  } else if (position === 2) {
    // BB
    toCall = 0;
  } else {
    toCall = BIG_BLIND;
  }

  // openerがいた場合、open size = 2.5BB
  const openSize = Math.round(BIG_BLIND * 2.5);
  let villainRange: string[][] = [];
  let numOpponents = 1;

  if (opener !== null) {
    // モデル:
    //   SB(50) + BB(100) = 150 (blind)
    //   opener が openSize(250) 投入
    //   coldCallersも同額をcall (potに追加)
    //   -> pot = 150 + openSize * (1 + coldCallers.length)
    pot = SMALL_BLIND + BIG_BLIND + openSize * (1 + coldCallers.length);
    if (position === 1) toCall = openSize - SMALL_BLIND;
    else if (position === 2) toCall = openSize - BIG_BLIND;
    else toCall = openSize;
    villainStack = INITIAL_STACK - openSize;

    // villainレンジ = opener のopenレンジ (主要vsで表示)
    villainRange = expandRange(getOpenRangeForPosition(opener), hero);
    numOpponents = 1 + coldCallers.length;
  } else {
    // Heroが最初のアクター
    // villain想定はBB defense range (もしHeroがopenしたら戦う相手)
    villainRange = expandRange(getOpenRangeForPosition(2), hero);
    villainStack = INITIAL_STACK - BIG_BLIND;
    // BB は基本残る + Hero後ろの各席が低確率でcold-call
    let postHeroCallers = 0;
    for (let i = heroIndex + 1; i < actionOrder.length; i++) {
      const pos = actionOrder[i];
      if (pos === 2) continue; // BBは別カウント
      if (Math.random() < POST_HERO_CALL_PROBABILITY) postHeroCallers += 1;
    }
    // BB(1) + Hero後ろのcold-callers
    numOpponents = 1 + postHeroCallers;
  }

  return {
    pot,
    toCall,
    villainRange,
    preflopState: { opener, threeBettor: null, coldCallers },
    villainStack,
    numOpponents,
  };
}

export const useSixMaxStore = create<Store>((set, get) => ({
  ...INITIAL,

  startNewRound: () => {
    const position = genPositionNumber(POOL_PEOPLE);
    const hero = genHand(0); // 強さ縛りなしでランダム
    const deck = getShuffledDeck(hero);

    const preflopSetup = setupPreflop(hero, position);

    // Hero が既に投入しているchip (Blindのみ)
    const heroPosted =
      position === 1 ? SMALL_BLIND : position === 2 ? BIG_BLIND : 0;

    set({
      gameId: Date.now(),
      street: "preflop",
      finished: false,
      evaluating: false,
      hero,
      board: [],
      deck,
      position,
      heroStack: INITIAL_STACK - heroPosted,
      pot: preflopSetup.pot,
      toCall: preflopSetup.toCall,
      villainRange: preflopSetup.villainRange,
      villainStack: preflopSetup.villainStack,
      numOpponents: preflopSetup.numOpponents,
      preflopState: preflopSetup.preflopState,
      lastEvaluation: null,
    });
  },

  submitAction: async (choice) => {
    const state = get();
    if (state.finished || state.evaluating || state.gameId === 0) return;
    set({ evaluating: true });

    try {
      // board と衝突するhand を除外 (WASM simulator 入力の安全化)
      const blocked = new Set([...state.hero, ...state.board]);
      const filteredVillainRange = state.villainRange.filter(
        (h) => !h.some((c) => blocked.has(c)),
      );

      const evaluated = await evaluateActions({
        hero: state.hero,
        board: state.board,
        villainRange: filteredVillainRange,
        pot: state.pot,
        toCall: state.toCall,
        heroStack: state.heroStack,
        villainStack: state.villainStack,
        numOpponents: state.numOpponents,
      });

      const evaluation = buildEvaluation({
        evaluated,
        pickedChoice: choice,
      });

      // 履歴追加
      const newHistory: HistoryEntry = {
        street: state.street,
        position: state.position,
        hero: state.hero,
        board: [...state.board],
        evaluation,
        timestamp: Date.now(),
      };

      // ストリート進行ロジック (簡易版)
      // - fold/allin はハンド終了
      // - それ以外は次のストリートに進む
      const nextStreet = advanceStreet(state.street, choice.kind);
      const isHandOver =
        nextStreet === "showdown" ||
        choice.kind === "fold" ||
        choice.kind === "allin";

      // ボード進行
      let newBoard = state.board;
      let newDeck = state.deck;
      if (choice.kind === "allin") {
        // オールイン -> 残りのボードを全て公開してショーダウン風に
        const cardsLeft = 5 - state.board.length;
        if (cardsLeft > 0) {
          newBoard = [...state.board, ...newDeck.slice(0, cardsLeft)];
          newDeck = newDeck.slice(cardsLeft);
        }
      } else if (!isHandOver && nextStreet !== state.street) {
        const cardsToReveal =
          nextStreet === "flop"
            ? 3
            : nextStreet === "turn"
              ? 1
              : nextStreet === "river"
                ? 1
                : 0;
        if (cardsToReveal > 0) {
          newBoard = [...state.board, ...newDeck.slice(0, cardsToReveal)];
          newDeck = newDeck.slice(cardsToReveal);
        }
      }

      // potとtoCallの更新 (簡易: 相手はcallしたと仮定)
      let newPot = state.pot;
      let newToCall = 0;
      let newHeroStack = state.heroStack;
      let newVillainStack = state.villainStack;

      if (choice.kind === "call") {
        newPot += choice.amount;
        newHeroStack -= choice.amount;
        // 次のストリートではtoCallは0
        newToCall = 0;
      } else if (
        choice.kind === "bet" ||
        choice.kind === "raise" ||
        choice.kind === "allin"
      ) {
        // 簡略化: 相手がcallしたと仮定
        const heroAdd = choice.amount - state.toCall + state.toCall; // = choice.amount
        const villainAdd = choice.amount - state.toCall;
        newPot += heroAdd + villainAdd;
        newHeroStack -= heroAdd;
        newVillainStack -= villainAdd;
        newToCall = 0;
      } else if (choice.kind === "check") {
        // potそのまま、ストリート進行
        newToCall = 0;
      } else if (choice.kind === "fold") {
        // ハンド終了
      }

      // Preflopから次に進むときvillainレンジを更新 (シンプル化: callレンジ + 3betレンジ統合)
      let newVillainRange = state.villainRange;
      if (
        state.street === "preflop" &&
        nextStreet !== "preflop" &&
        nextStreet !== "showdown" &&
        choice.kind !== "fold"
      ) {
        // postflopではcontinueレンジ (call + 3bet含むカジュアル)
        // 簡易: もとのopenレンジから極端に弱いハンドを除いたものとする
        newVillainRange = state.villainRange.slice(
          0,
          Math.floor(state.villainRange.length * 0.7),
        );
      }

      // 新ボード + heroカードと衝突するハンドを除外
      const newBlocked = new Set([...state.hero, ...newBoard]);
      newVillainRange = newVillainRange.filter(
        (h) => !h.some((c) => newBlocked.has(c)),
      );

      set({
        history: [...state.history, newHistory],
        lastEvaluation: evaluation,
        totalEvLoss: state.totalEvLoss + evaluation.evLoss,
        roundsPlayed: isHandOver ? state.roundsPlayed + 1 : state.roundsPlayed,
        street: nextStreet,
        board: newBoard,
        deck: newDeck,
        pot: newPot,
        toCall: newToCall,
        heroStack: newHeroStack,
        villainStack: newVillainStack,
        villainRange: newVillainRange,
        finished: isHandOver,
      });
    } finally {
      set({ evaluating: false });
    }
  },

  clearAll: () => {
    set(INITIAL);
  },
}));

function advanceStreet(
  current: Street,
  actionKind: ActionChoice["kind"],
): Street {
  // fold / allin はハンド終了 (ショーダウン扱い)
  if (actionKind === "fold") return "showdown";
  if (actionKind === "allin") return "showdown";
  if (current === "preflop") return "flop";
  if (current === "flop") return "turn";
  if (current === "turn") return "river";
  if (current === "river") return "showdown";
  return current;
}
