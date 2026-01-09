pub mod core;
pub mod holdem;
pub mod simulated_icm;
#[cfg(feature = "arena")]
pub mod arena;

pub fn run_all() {
  println!("== rs_poker 実験: モジュール別の機能デモ ==");
  core::run();
  holdem::run();
  simulated_icm::run();
  #[cfg(feature = "arena")]
  arena::run();
}
