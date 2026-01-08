mod card;
mod deck;
mod eval;
mod parse;
mod rank_distribution;
mod rng;
mod simulate_vs_list;

pub use rank_distribution::simulate_rank_distribution;
pub use simulate_vs_list::{
  simulate_vs_list_equity,
  simulate_vs_list_with_ranks_monte_carlo,
  simulate_vs_list_with_ranks,
  simulate_vs_list_with_ranks_with_progress,
};

#[cfg(test)]
mod tests;
