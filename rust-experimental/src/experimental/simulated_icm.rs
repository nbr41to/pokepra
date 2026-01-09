use rs_poker::simulated_icm::simulate_icm_tournament;

pub fn run() {
  println!("\n-- simulated_icm: トーナメントEVの簡易シミュレーション --");

  let stacks = vec![1500, 1200, 900, 600];
  let payouts = vec![100, 60, 40, 20];
  let result = simulate_icm_tournament(&stacks, &payouts);
  println!("simulate_icm_tournament -> 入力スタック={stacks:?}");
  println!("simulate_icm_tournament -> 出力賞金={result:?}");
}
