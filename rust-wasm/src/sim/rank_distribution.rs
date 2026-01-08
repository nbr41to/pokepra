use super::deck::{build_deck, shuffle_slice};
use super::eval::best_of;
use super::parse::{parse_board, parse_hands_min1};
use super::rng::Lcg64;
use super::card::Card;

/// Rank distribution for multiple hands given partial board.
/// Returns Vec of [counts for rank 0..8] per hand.
pub fn simulate_rank_distribution(
  hands_str: &str,
  board_str: &str,
  trials: u32,
  seed: u64,
) -> Result<Vec<[u32; 9]>, String> {
  let hands = parse_hands_min1(hands_str).ok_or("failed to parse hands")?;
  let board = parse_board(board_str).ok_or("failed to parse board")?;
  if board.len() < 3 {
    return Err("board must be >=3 cards".into());
  }
  if board.len() > 5 {
    return Err("board must be <=5 cards".into());
  }

  // validate board duplicates
  {
    let mut seen = Vec::new();
    for c in &board {
      if seen.iter().any(|x: &Card| x.rank == c.rank && x.suit == c.suit) {
        return Err("duplicate cards detected in board".into());
      }
      seen.push(*c);
    }
  }

  // validate each hand (no dup within, no overlap with board)
  for h in &hands {
    if h[0].rank == h[1].rank && h[0].suit == h[1].suit {
      return Err("duplicate cards inside a hand".into());
    }
    for c in h {
      if board
        .iter()
        .any(|x| x.rank == c.rank && x.suit == c.suit)
      {
        return Err("hand overlaps board".into());
      }
    }
  }

  let missing_board = 5usize.saturating_sub(board.len());

  let mut rng = Lcg64::new(seed);
  let mut counts = vec![[0u32; 9]; hands.len()];

  for _ in 0..trials.max(1) {
    for (idx, hand) in hands.iter().enumerate() {
      // build deck excluding board + this hand
      let mut exclude = board.clone();
      exclude.push(hand[0]);
      exclude.push(hand[1]);
      let remaining_cards = 52usize.saturating_sub(exclude.len());
      if remaining_cards < missing_board {
        return Err("not enough cards to complete board".into());
      }
      let mut deck = build_deck(&exclude);
      shuffle_slice(&mut deck, &mut rng);

      let mut full_board = board.clone();
      for i in 0..missing_board {
        full_board.push(deck[i]);
      }

      let mut cards = Vec::with_capacity(7);
      cards.extend_from_slice(hand);
      cards.extend_from_slice(&full_board);
      let score = best_of(&cards);
      let r_idx = score.rank as usize;
      if r_idx < 9 {
        counts[idx][r_idx] += 1;
      }
    }
  }

  Ok(counts)
}
