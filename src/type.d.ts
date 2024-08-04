// type User = {
//   name: string;
// };

type Records = Record<
  string, // date
  {
    people: number;
    startStack: number | null;
    endStack: number | null;
    hands: Hand[];
  }
>;

type Hand = {
  people: number;
  position: string;
  action: string; // "fold" | "call" | "raise" | "3bet";
  preflop: [number, number, boolean]; // [card1, card2, suited]
  flop: string | null;
  turn: string | null;
  river: string | null;
};
