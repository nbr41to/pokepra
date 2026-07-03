import { beforeEach, describe, expect, it } from "bun:test";
import { useHoldem } from "./holdem";

const cards = () => {
  const state = useHoldem.getState();
  return [...state.board, ...state.hands.flat()];
};

describe("useHoldem", () => {
  beforeEach(() => {
    useHoldem.getState().reset();
  });

  it("rs-poker Arena の GameState に近い初期状態を作る", () => {
    useHoldem.getState().initialize({
      numPlayers: 3,
      stack: 200,
      bigBlind: 20,
      smallBlind: 10,
      ante: 1,
      dealerIdx: 1,
    });

    const state = useHoldem.getState();
    expect(state.numPlayers).toBe(3);
    expect(state.stacks).toEqual([200, 200, 200]);
    expect(state.startingStacks).toEqual([200, 200, 200]);
    expect(state.bigBlind).toBe(20);
    expect(state.smallBlind).toBe(10);
    expect(state.ante).toBe(1);
    expect(state.dealerIdx).toBe(1);
    expect(state.round).toBe("Starting");
    expect(state.roundData.playerBet).toEqual([0, 0, 0]);
  });

  it("shuffleAndDeal で全プレイヤーに重複しない hand を配り blind を投稿する", () => {
    useHoldem.getState().shuffleAndDeal({ numPlayers: 2 });

    const state = useHoldem.getState();
    expect(state.round).toBe("Preflop");
    expect(state.hands.length).toBe(2);
    expect(new Set(cards()).size).toBe(cards().length);
    expect(state.sbPosted).toBe(true);
    expect(state.bbPosted).toBe(true);
    expect(state.totalPot).toBe(1.5);
    expect(state.stacks).toEqual([99.5, 99]);
    expect(state.roundData.toActIdx).toBe(0);
  });

  it("street の deal trigger で board を 3, 4, 5 枚に進める", () => {
    useHoldem.getState().shuffleAndDeal({ numPlayers: 2 });
    useHoldem.getState().dealFlop();
    expect(useHoldem.getState().board.length).toBe(3);

    useHoldem.getState().dealTurn();
    expect(useHoldem.getState().board.length).toBe(4);

    useHoldem.getState().dealRiver();
    expect(useHoldem.getState().board.length).toBe(5);
    expect(new Set(cards()).size).toBe(cards().length);
  });

  it("bet / call で stack, pot, roundData を更新する", () => {
    useHoldem.getState().shuffleAndDeal({ numPlayers: 2 });
    useHoldem.getState().raiseTo(20, 0);
    useHoldem.getState().call(1);

    const state = useHoldem.getState();
    expect(state.totalPot).toBe(40);
    expect(state.stacks).toEqual([80, 80]);
    expect(state.roundData.bet).toBe(20);
    expect(state.roundData.playerBet).toEqual([20, 20]);
  });

  it("fold で active を落とし、1人だけ残ったら Complete にする", () => {
    useHoldem.getState().shuffleAndDeal({ numPlayers: 2 });
    useHoldem.getState().fold(0);

    const state = useHoldem.getState();
    expect(state.playerActive).toEqual([false, true]);
    expect(state.round).toBe("Complete");
  });
});
