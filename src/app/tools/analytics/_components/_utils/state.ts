import { create } from "zustand";
import type {
  CombinedPayload,
  HandRankingEntry,
  RangeVsRangePayload,
} from "@/lib/wasm/simulation";
import {
  genHand,
  getAllCombos,
  getRandomCards,
  shuffleAndDeal,
} from "@/utils/dealer";
import { getRangeStrengthByPosition } from "@/utils/hand-range";
import {
  getHandRankingInRange,
  simHandVsRangeEquityWithRanks,
  simRangeVsRangeEquity,
} from "./monte-carlo";

type Street = "preflop" | "flop" | "turn" | "river";
type CachedStreet = Exclude<Street, "preflop">;
type AnalyticsHistory = {
  ranking: HandRankingEntry[];
  heroEquity: CombinedPayload;
  rangeEquity: RangeVsRangePayload;
};
type AnalysisCacheEntry = {
  key: string;
  result: AnalyticsHistory;
};
type AnalysisCache = [
  AnalysisCacheEntry | null,
  AnalysisCacheEntry | null,
  AnalysisCacheEntry | null,
];
type AnalysisPromiseCacheEntry = {
  key: string;
  promise: Promise<AnalyticsHistory>;
};
type AnalysisPromiseCache = [
  AnalysisPromiseCacheEntry | null,
  AnalysisPromiseCacheEntry | null,
  AnalysisPromiseCacheEntry | null,
];
type AnalysisInput = {
  hero: string[];
  board: string[];
  position: number;
  ranges: string[];
};

type State = {
  initialized: boolean;
  settings: {
    people: number; // 人数
    heroStrengthLimit: number; // 自分のハンドレンジの下限
  };

  // game state
  position: number; // ポジション番号
  street: Street; // ストリート
  hero: string[]; // 自分のハンド
  villains: string[][]; // 相手のハンド候補
  board: string[]; // ボード
  boardHistory: string[]; // ボード履歴

  disableBoardAnimation: boolean;

  // history
  analyticsHistory: AnalyticsHistory[];
  analysisCache: AnalysisCache;
  analysisPromiseCache: AnalysisPromiseCache;
};

type Actions = {
  initialize: (settings: { people: number; heroStrengthLimit: number }) => void;
  shuffleAndDeal: () => void;
  onAdvance: () => void;
  onRetreat: () => void;
  setResult: ({ ranking, heroEquity, rangeEquity }: AnalyticsHistory) => void;
  getAnalysisResult: (
    params: AnalysisInput & { street: Street },
  ) => Promise<AnalyticsHistory>;
  setSituation: (hero: string[], board: string[], position: number) => void;
  clear: () => void;
};

type Store = State & Actions;

const createAnalysisCache = (): AnalysisCache => [null, null, null];
const createAnalysisPromiseCache = (): AnalysisPromiseCache => [
  null,
  null,
  null,
];
const getAnalysisCacheIndex = (street: CachedStreet) =>
  street === "flop" ? 0 : street === "turn" ? 1 : 2;
const createAnalysisKey = (
  hero: string[],
  board: string[],
  position: number,
  ranges: string[],
) => {
  const heroKey = hero.join("-");
  const boardKey = board.join("-");
  const rangesKey = ranges.join("|");
  return `${heroKey}:${boardKey}:${position}:${rangesKey}`;
};
const analyze = ({
  hero,
  board,
  position,
  ranges,
}: AnalysisInput): Promise<AnalyticsHistory> => {
  return Promise.all([
    getHandRankingInRange(getAllCombos(board), board),
    simHandVsRangeEquityWithRanks(hero, ranges[8], board),
    simRangeVsRangeEquity(
      ranges[getRangeStrengthByPosition(position) - 1],
      ranges[8],
      board,
    ),
  ]).then(([ranking, heroEquity, rangeEquity]) => ({
    ranking,
    heroEquity,
    rangeEquity,
  }));
};

const INITIAL_STATE: State = {
  initialized: false,
  settings: {
    people: 0,
    heroStrengthLimit: 0,
  },

  street: "flop",
  position: 1,
  hero: [],
  villains: [],
  board: [],
  boardHistory: [],
  disableBoardAnimation: false,

  analyticsHistory: [],
  analysisCache: createAnalysisCache(),
  analysisPromiseCache: createAnalysisPromiseCache(),
};

const useHoldemStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  /**
   * 初期設定
   */
  initialize: (settings) => {
    const { people, heroStrengthLimit } = settings;

    set({
      initialized: true,
      ...shuffleAndDeal({ people, heroStrength: heroStrengthLimit }),
      settings,
      analysisCache: createAnalysisCache(),
      analysisPromiseCache: createAnalysisPromiseCache(),
    });
  },

  /**
   * ゲームを開始
   */
  shuffleAndDeal: () => {
    const {
      settings: { people, heroStrengthLimit },
    } = get();

    const { position, hero, villains, deck } = shuffleAndDeal({
      people,
      ignorePosition: [2],
      heroStrength: heroStrengthLimit,
    });

    const boardHistory = deck.slice(0, 5);
    const board = boardHistory.slice(0, 3);

    set({
      ...INITIAL_STATE,
      initialized: true,
      position,
      hero,
      villains,
      street: "flop",
      board,
      boardHistory,
      settings: { people, heroStrengthLimit },
      analysisCache: createAnalysisCache(),
      analysisPromiseCache: createAnalysisPromiseCache(),
    });
  },

  /**
   * 次のストリートへ進む
   */
  onAdvance: () => {
    const { street, boardHistory } = get();

    if (street === "river") return;

    let nextStreet: Street;

    if (street === "preflop") {
      nextStreet = "flop";
      set({ board: boardHistory.slice(0, 3) });
    } else if (street === "flop") {
      nextStreet = "turn";
      set({ board: boardHistory.slice(0, 4) });
    } else {
      nextStreet = "river";
      set({ board: boardHistory.slice(0, 5) });
    }

    set({
      street: nextStreet,
      disableBoardAnimation: false,
    });
  },

  /**
   * 前のストリートへ戻る
   */
  onRetreat: () => {
    const { street, board } = get();

    if (street === "preflop") return;

    let prevStreet: Street;
    let newBoard: string[] = [];

    if (street === "river") {
      prevStreet = "turn";
      newBoard = board.slice(0, 4);
    } else if (street === "turn") {
      prevStreet = "flop";
      newBoard = board.slice(0, 3);
    } else {
      prevStreet = "preflop";
      newBoard = [];
    }

    set({
      street: prevStreet,
      board: newBoard,
      disableBoardAnimation: true,
    });
  },

  /**
   *
   */
  setResult: ({ ranking, heroEquity, rangeEquity }) => {
    const { analyticsHistory } = get();

    set({
      analyticsHistory: [
        ...analyticsHistory,
        { ranking, heroEquity, rangeEquity },
      ],
    });
  },

  getAnalysisResult: ({ hero, board, position, ranges, street }) => {
    const analysisKey = createAnalysisKey(hero, board, position, ranges);
    if (street === "preflop") {
      return analyze({ hero, board, position, ranges });
    }

    const cacheIndex = getAnalysisCacheIndex(street);
    const { analysisCache, analysisPromiseCache } = get();
    const cached = analysisCache[cacheIndex];
    if (cached?.key === analysisKey) {
      return Promise.resolve(cached.result);
    }

    const cachedPromise = analysisPromiseCache[cacheIndex];
    if (cachedPromise?.key === analysisKey) {
      return cachedPromise.promise;
    }

    const promise = analyze({ hero, board, position, ranges })
      .then((result) => {
        const { analysisPromiseCache: currentPromiseCache } = get();
        if (currentPromiseCache[cacheIndex]?.key !== analysisKey) {
          return result;
        }

        const { analysisCache: currentCache } = get();
        const nextCache = [...currentCache] as AnalysisCache;
        nextCache[cacheIndex] = { key: analysisKey, result };
        set({ analysisCache: nextCache });
        return result;
      })
      .finally(() => {
        const { analysisPromiseCache: currentPromiseCache } = get();
        if (currentPromiseCache[cacheIndex]?.key !== analysisKey) {
          return;
        }
        const nextPromiseCache = [
          ...currentPromiseCache,
        ] as AnalysisPromiseCache;
        nextPromiseCache[cacheIndex] = null;
        set({ analysisPromiseCache: nextPromiseCache });
      });

    const nextPromiseCache = [...analysisPromiseCache] as AnalysisPromiseCache;
    nextPromiseCache[cacheIndex] = { key: analysisKey, promise };
    set({ analysisPromiseCache: nextPromiseCache });
    return promise;
  },

  /**
   * シチュエーションを変更
   */
  setSituation: (hero, board, position) => {
    const street: Street =
      board.length < 3
        ? "preflop"
        : board.length === 3
          ? "flop"
          : board.length === 4
            ? "turn"
            : "river";
    const villains = genHand(2, [...hero, ...board]);
    const boardHistory = [...board];

    // boardHistoryが5枚になるまでnewCardsから追加
    while (boardHistory.length < 5) {
      const newCards = getRandomCards(5, [
        ...hero,
        ...villains.flat(),
        ...boardHistory,
      ]);
      boardHistory.push(newCards[boardHistory.length]);
    }

    set({
      position,
      hero,
      board,
      boardHistory,
      street,
      villains: [villains],
      analyticsHistory: [],
      analysisCache: createAnalysisCache(),
      analysisPromiseCache: createAnalysisPromiseCache(),
      disableBoardAnimation: true,
    });
  },

  /**
   * 初期化
   */
  clear: () => {
    set({
      ...INITIAL_STATE,
      analysisCache: createAnalysisCache(),
      analysisPromiseCache: createAnalysisPromiseCache(),
    });
  },
}));

export { useHoldemStore };
