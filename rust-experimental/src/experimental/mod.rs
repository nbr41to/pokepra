pub mod arena;
pub mod core;
pub mod holdem;
pub mod simulated_icm;

pub fn run_all() {
  println!("== rs_poker 実験: モジュール別の機能デモ ==");
  core::run();
  holdem::run();
  arena::run();
  simulated_icm::run();
}
