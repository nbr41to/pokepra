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
  position: string;
  isJoin: boolean;
  preflop: [string, string];
  flop: string | null;
  turn: string | null;
  river: string | null;
};
