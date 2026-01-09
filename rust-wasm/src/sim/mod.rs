mod card;
mod deck;
mod eval;
mod parse;
mod rng;
mod simulate_vs_list;

pub(crate) use card::Card;
pub(crate) use deck::{build_deck, decode_hand_pair, shuffle_slice};
pub(crate) use parse::{parse_board, parse_hand_two, parse_hands_min1};
pub(crate) use rng::Lcg64;

pub use simulate_vs_list::{
  simulate_vs_list_with_ranks,
};

#[cfg(test)]
mod tests;
