use std::cmp::Ordering;

use super::card::Card;
use super::deck::{build_deck, decode_hand_pair, shuffle_slice};
use super::eval::best_of;
use super::parse::{parse_board, parse_hand_two};
use super::rng::Lcg64;

/// Hero vs provided opponent list, returning wins/ties and rank distribution per opponent.
pub fn simulate_vs_list_with_ranks(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9])>, String> {
  simulate_vs_list_with_ranks_inner::<fn(u32)>(
    hero_hand_str,
    board_str,
    compare_list,
    trials,
    seed,
    None,
  )
}

/// Progress-reporting variant for rank distribution.
pub fn simulate_vs_list_with_ranks_with_progress<F: FnMut(u32)>(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
  progress: Option<F>,
) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9])>, String> {
  simulate_vs_list_with_ranks_inner(
    hero_hand_str,
    board_str,
    compare_list,
    trials,
    seed,
    progress,
  )
}

fn simulate_vs_list_with_ranks_inner<F: FnMut(u32)>(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
  mut progress: Option<F>,
) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9])>, String> {
  let hero_hand = parse_hand_two(hero_hand_str).ok_or("hero hand must have 2 cards")?;

  let board = parse_board(board_str).ok_or("failed to parse board")?;
  if board.len() > 5 {
    return Err("board must be <=5 cards".into());
  }

  // parse compare hands (duplicates allowed across hands)
  let mut opponents: Vec<[Card; 2]> = Vec::new();
  for raw in compare_list.split(';') {
    if raw.trim().is_empty() {
      continue;
    }
    let hand = parse_hand_two(raw).ok_or("each compare hand must have 2 cards")?;
    opponents.push(hand);
  }
  if opponents.is_empty() {
    return Err("no compare hands provided".into());
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

  // ensure hero distinct, not overlapping board; each opponent distinct and not overlapping hero/board
  {
    if hero_hand[0].rank == hero_hand[1].rank && hero_hand[0].suit == hero_hand[1].suit {
      return Err("duplicate cards inside hero hand".into());
    }
    for c in &hero_hand {
      if board
        .iter()
        .any(|x| x.rank == c.rank && x.suit == c.suit)
      {
        return Err("hero overlaps board".into());
      }
    }
    for opp in &opponents {
      if opp[0].rank == opp[1].rank && opp[0].suit == opp[1].suit {
        return Err("duplicate cards inside opponent hand".into());
      }
      for c in opp {
        if hero_hand.iter().any(|x| x.rank == c.rank && x.suit == c.suit) {
          return Err("opponent overlaps hero".into());
        }
        if board.iter().any(|x| x.rank == c.rank && x.suit == c.suit) {
          return Err("opponent overlaps board".into());
        }
      }
    }
  }

  let trials = trials.max(1);
  let total_work = (opponents.len() as u64)
    .saturating_mul(trials as u64)
    .saturating_add(trials as u64)
    .max(1);
  let mut completed = 0u64;
  let mut last_progress: Option<u32> = None;
  let mut update_progress = |done: u64| {
    if let Some(cb) = progress.as_mut() {
      let pct = ((done.saturating_mul(100)) / total_work) as u32;
      let clamped = pct.min(100);
      if last_progress != Some(clamped) {
        last_progress = Some(clamped);
        cb(clamped);
      }
    }
  };
  update_progress(0);
  let board_len = board.len();
  let missing_board = 5usize.saturating_sub(board_len);
  let mut board_buf = [Card { rank: 0, suit: 0 }; 5];
  board_buf[..board_len].copy_from_slice(&board);
  let mut rng = Lcg64::new(seed);
  let mut stats: Vec<(u32, u32, u32, u32, u32, [u32; 9])> =
    vec![(0, 0, 0, 0, 0, [0u32; 9]); opponents.len()];
  let mut hero_rank_counts = [0u32; 9];
  let mut hero_wins_total = 0u32;
  let mut hero_ties_total = 0u32;
  let mut hero_plays_total = 0u32;

  let opp_encoded: Vec<(u32, u32)> = opponents.iter().map(|h| decode_hand_pair(h)).collect();

  for (idx, opp) in opponents.iter().enumerate() {
    let mut wins = 0u32;
    let mut ties = 0u32;
    let mut plays = 0u32;
    let mut rank_counts = [0u32; 9];

    // deck per opponent: exclude hero + board + this opponent (built once)
    let mut exclude = Vec::with_capacity(board_len + 4);
    exclude.extend_from_slice(&board);
    exclude.push(hero_hand[0]);
    exclude.push(hero_hand[1]);
    exclude.push(opp[0]);
    exclude.push(opp[1]);
    let remaining_cards = 52usize.saturating_sub(exclude.len());
    if remaining_cards < missing_board {
      return Err("not enough cards to complete board".into());
    }
    let deck_template = build_deck(&exclude);
    let mut deck = deck_template.clone();
    let mut full_board = board_buf;

    for _ in 0..trials {
      deck.clone_from(&deck_template);
      shuffle_slice(&mut deck, &mut rng);

      for i in 0..missing_board {
        full_board[board_len + i] = deck[i];
      }

      let hero_cards = [
        hero_hand[0],
        hero_hand[1],
        full_board[0],
        full_board[1],
        full_board[2],
        full_board[3],
        full_board[4],
      ];
      let hero_score = best_of(&hero_cards);

      let opp_cards = [
        opp[0],
        opp[1],
        full_board[0],
        full_board[1],
        full_board[2],
        full_board[3],
        full_board[4],
      ];
      let opp_score = best_of(&opp_cards);

      plays += 1;
      match hero_score.encoded.cmp(&opp_score.encoded) {
        Ordering::Greater => wins += 1,
        Ordering::Equal => ties += 1,
        Ordering::Less => {}
      }
      let r_idx = opp_score.rank as usize;
      if r_idx < 9 {
        rank_counts[r_idx] += 1;
      }
      completed = completed.saturating_add(1);
      update_progress(completed);
    }

    stats[idx].0 = opp_encoded[idx].0;
    stats[idx].1 = opp_encoded[idx].1;
    stats[idx].2 = wins;
    stats[idx].3 = ties;
    stats[idx].4 = plays;
    stats[idx].5 = rank_counts;

    hero_wins_total = hero_wins_total.saturating_add(wins);
    hero_ties_total = hero_ties_total.saturating_add(ties);
    hero_plays_total = hero_plays_total.saturating_add(plays);
  }

  // hero rank distribution (deck excludes hero + board only)
  let mut exclude = Vec::with_capacity(board_len + 2);
  exclude.extend_from_slice(&board);
  exclude.push(hero_hand[0]);
  exclude.push(hero_hand[1]);
  let remaining_cards = 52usize.saturating_sub(exclude.len());
  if remaining_cards < missing_board {
    return Err("not enough cards to complete board".into());
  }
  let hero_deck_template = build_deck(&exclude);
  let mut hero_deck = hero_deck_template.clone();
  let mut full_board = board_buf;
  for _ in 0..trials {
    hero_deck.clone_from(&hero_deck_template);
    shuffle_slice(&mut hero_deck, &mut rng);

    for i in 0..missing_board {
      full_board[board_len + i] = hero_deck[i];
    }

    let hero_cards = [
      hero_hand[0],
      hero_hand[1],
      full_board[0],
      full_board[1],
      full_board[2],
      full_board[3],
      full_board[4],
    ];
    let hero_score = best_of(&hero_cards);
    let r_idx = hero_score.rank as usize;
    if r_idx < 9 {
      hero_rank_counts[r_idx] += 1;
    }
    completed = completed.saturating_add(1);
    update_progress(completed);
  }

  // scale hero rank counts to match total plays (per opponent)
  let multiplier = opponents.len() as u32;
  if multiplier > 1 {
    for r in &mut hero_rank_counts {
      *r = r.saturating_mul(multiplier);
    }
  }

  // append hero aggregate record with sentinel cards = u32::MAX
  stats.push((
    u32::MAX,
    u32::MAX,
    hero_wins_total,
    hero_ties_total,
    hero_plays_total,
    hero_rank_counts,
  ));

  update_progress(total_work);
  Ok(stats)
}
