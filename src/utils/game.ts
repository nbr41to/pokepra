export const positions = ['sb', 'bb', 'utg', 'mp', 'lj', 'hj', 'co', 'btn'];

type Table = {
  games: Game[];
  players: Player[];
};
type Game = {
  deck: string[];
  board: string[];
  pot: number;
};
type Player = {
  id: string;
  position: string;
  stack: number;
  hands: string[];
  bet: number;
  action: string;
};

type RequestGame = {
  playerHands: string[];
  cpuHands: string[];
  board: string[];
  bet: number;
  pot: number;
  action: string;
};
