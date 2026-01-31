function calcExpectedValue(params: {
  pot: number; // current pot size
  fe: number; // fold equity
  ce: number; // continue equity
  bet: number; // bet size
}) {
  const { pot, fe, ce, bet } = params;

  // debug用の計算式出力
  // console.log("相手の平均勝率:", 1 - fe);
  // console.log("続けた場合のあなたの勝率:", ce);
  // console.log(
  //   `EV = ${pot} * ${fe} + (1 - ${fe}) * ${ce} * (${pot} + ${bet} * 2) - ${bet}`,
  // );

  return pot * fe + (1 - fe) * ce * (pot + bet * 2) - bet;
}

export { calcExpectedValue };
