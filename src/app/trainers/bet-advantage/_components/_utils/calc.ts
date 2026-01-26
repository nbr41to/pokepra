function calcExpectedValue(params: {
  pot: number; // current pot size
  fe: number; // fold equity
  ce: number; // continue equity
  bet: number; // bet size
}) {
  const { pot, fe, ce, bet } = params;

  return pot * fe + (1 - fe) * ce * (pot + bet * 2) - bet;
}

export { calcExpectedValue };
