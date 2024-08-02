// type User = {
//   name: string;
// };

type Record = Record<
  string, // date
  {
    startStack: number | null;
    endStack: number | null;
    hands: Hand[];
  }
>;

type Hand = {
  position: string;
  preflop: [string, string];
  flop: string | null;
  turn: string | null;
  river: string | null;
};
