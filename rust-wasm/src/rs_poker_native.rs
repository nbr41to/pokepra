//! rs_poker-based helpers for Monte Carlo simulations.

use rs_poker::core::{Card, Hand, Rank, Rankable, Suit, Value};
use rs_poker::holdem::MonteCarloGame;

use crate::sim::{
  decode_hand_pair,
  parse_board,
  parse_hand_two,
  parse_hands_min1,
  Card as SimCard,
};
use crate::sim::{build_deck, shuffle_slice, Lcg64};

/// Hero vs provided opponent list, returning wins/ties/plays per opponent and hero aggregate.
pub fn simulate_vs_list_equity(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
) -> Result<Vec<(u32, u32, u32, u32, u32)>, String> {
  simulate_vs_list_equity_inner::<fn(u32)>(
    hero_hand_str,
    board_str,
    compare_list,
    trials,
    seed,
    None,
  )
}

pub fn simulate_vs_list_equity_with_progress<F: FnMut(u32)>(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
  progress: Option<F>,
) -> Result<Vec<(u32, u32, u32, u32, u32)>, String> {
  simulate_vs_list_equity_inner(
    hero_hand_str,
    board_str,
    compare_list,
    trials,
    seed,
    progress,
  )
}

fn simulate_vs_list_equity_inner<F: FnMut(u32)>(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
  mut progress: Option<F>,
) -> Result<Vec<(u32, u32, u32, u32, u32)>, String> {
  let _ = seed;
  let hero_hand = parse_hand_two(hero_hand_str).ok_or("hero hand must have 2 cards")?;

  let board = parse_board(board_str).ok_or("failed to parse board")?;
  if board.len() > 5 {
    return Err("board must be <=5 cards".into());
  }

  let mut opponents: Vec<[SimCard; 2]> = Vec::new();
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

  validate_inputs(&hero_hand, &board, &opponents)?;

  let trials = trials.max(1);
  let total_work = (opponents.len() as u64).saturating_mul(trials as u64).max(1);
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

  let board_rs: Vec<Card> = board.iter().map(to_rs_card).collect();

  let mut stats: Vec<(u32, u32, u32, u32, u32)> =
    vec![(0, 0, 0, 0, 0); opponents.len()];
  let mut hero_wins_total = 0u32;
  let mut hero_ties_total = 0u32;
  let mut hero_plays_total = 0u32;

  let opp_encoded: Vec<(u32, u32)> = opponents.iter().map(|h| decode_hand_pair(h)).collect();

  for (idx, opp) in opponents.iter().enumerate() {
    let mut wins = 0u32;
    let mut ties = 0u32;
    let mut plays = 0u32;

    let mut hero_rs = to_rs_hand(&hero_hand);
    let mut opp_rs = to_rs_hand(opp);
    for c in &board_rs {
      hero_rs.insert(*c);
      opp_rs.insert(*c);
    }

    let mut game =
      MonteCarloGame::new(vec![hero_rs, opp_rs]).map_err(|e| format!("{e:?}"))?;

    for _ in 0..trials {
      let (winners, _) = game.simulate();
      plays += 1;
      let hero_win = winners.get(0);
      let opp_win = winners.get(1);
      if hero_win && opp_win {
        ties += 1;
      } else if hero_win {
        wins += 1;
      }
      game.reset();
      completed = completed.saturating_add(1);
      update_progress(completed);
    }

    stats[idx].0 = opp_encoded[idx].0;
    stats[idx].1 = opp_encoded[idx].1;
    stats[idx].2 = wins;
    stats[idx].3 = ties;
    stats[idx].4 = plays;

    hero_wins_total = hero_wins_total.saturating_add(wins);
    hero_ties_total = hero_ties_total.saturating_add(ties);
    hero_plays_total = hero_plays_total.saturating_add(plays);
  }

  stats.push((
    u32::MAX,
    u32::MAX,
    hero_wins_total,
    hero_ties_total,
    hero_plays_total,
  ));

  update_progress(total_work);
  Ok(stats)
}

/// Hero vs provided opponent list, returning wins/ties and winner rank distribution via MonteCarloGame.
pub fn simulate_vs_list_with_ranks_monte_carlo(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9], [u32; 9], [u32; 9])>, String> {
  simulate_vs_list_with_ranks_monte_carlo_inner::<fn(u32)>(
    hero_hand_str,
    board_str,
    compare_list,
    trials,
    seed,
    None,
  )
}

pub fn simulate_vs_list_with_ranks_with_progress<F: FnMut(u32)>(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
  progress: Option<F>,
) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9], [u32; 9], [u32; 9])>, String> {
  simulate_vs_list_with_ranks_monte_carlo_inner(
    hero_hand_str,
    board_str,
    compare_list,
    trials,
    seed,
    progress,
  )
}

fn simulate_vs_list_with_ranks_monte_carlo_inner<F: FnMut(u32)>(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
  mut progress: Option<F>,
) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9], [u32; 9], [u32; 9])>, String> {
  let _ = seed;
  let hero_hand = parse_hand_two(hero_hand_str).ok_or("hero hand must have 2 cards")?;

  let board = parse_board(board_str).ok_or("failed to parse board")?;
  if board.len() > 5 {
    return Err("board must be <=5 cards".into());
  }

  let mut opponents: Vec<[SimCard; 2]> = Vec::new();
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

  validate_inputs(&hero_hand, &board, &opponents)?;

  let trials = trials.max(1);
  let total_work = (opponents.len() as u64).saturating_mul(trials as u64).max(1);
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

  let board_rs: Vec<Card> = board.iter().map(to_rs_card).collect();

  let mut stats: Vec<(u32, u32, u32, u32, u32, [u32; 9], [u32; 9], [u32; 9])> = vec![
    (0, 0, 0, 0, 0, [0u32; 9], [0u32; 9], [0u32; 9]);
    opponents.len()
  ];
  let mut hero_rank_wins = [0u32; 9];
  let mut hero_rank_ties = [0u32; 9];
  let mut hero_rank_lose_counts = [0u32; 9];
  let mut hero_wins_total = 0u32;
  let mut hero_ties_total = 0u32;
  let mut hero_plays_total = 0u32;

  let opp_encoded: Vec<(u32, u32)> = opponents.iter().map(|h| decode_hand_pair(h)).collect();

  for (idx, opp) in opponents.iter().enumerate() {
    let mut wins = 0u32;
    let mut ties = 0u32;
    let mut plays = 0u32;
    let mut rank_wins = [0u32; 9];
    let mut rank_ties = [0u32; 9];
    let mut rank_lose_counts = [0u32; 9];

    let mut hero_rs = to_rs_hand(&hero_hand);
    let mut opp_rs = to_rs_hand(opp);
    for c in &board_rs {
      hero_rs.insert(*c);
      opp_rs.insert(*c);
    }

    let mut game =
      MonteCarloGame::new(vec![hero_rs, opp_rs]).map_err(|e| format!("{e:?}"))?;

    for _ in 0..trials {
      let (winners, rank) = game.simulate();
      plays += 1;
      let hero_win = winners.get(0);
      let opp_win = winners.get(1);
      let idx = rank_index(&rank);
      if hero_win && opp_win {
        ties += 1;
        if idx < 9 {
          rank_ties[idx] = rank_ties[idx].saturating_add(1);
          hero_rank_ties[idx] = hero_rank_ties[idx].saturating_add(1);
        }
      } else if hero_win {
        wins += 1;
        if idx < 9 {
          rank_lose_counts[idx] = rank_lose_counts[idx].saturating_add(1);
          hero_rank_wins[idx] = hero_rank_wins[idx].saturating_add(1);
        }
      } else if opp_win {
        if idx < 9 {
          rank_wins[idx] = rank_wins[idx].saturating_add(1);
          hero_rank_lose_counts[idx] = hero_rank_lose_counts[idx].saturating_add(1);
        }
      }
      game.reset();
      completed = completed.saturating_add(1);
      update_progress(completed);
    }

    stats[idx].0 = opp_encoded[idx].0;
    stats[idx].1 = opp_encoded[idx].1;
    stats[idx].2 = wins;
    stats[idx].3 = ties;
    stats[idx].4 = plays;
    stats[idx].5 = rank_wins;
    stats[idx].6 = rank_ties;
    stats[idx].7 = rank_lose_counts;

    hero_wins_total = hero_wins_total.saturating_add(wins);
    hero_ties_total = hero_ties_total.saturating_add(ties);
    hero_plays_total = hero_plays_total.saturating_add(plays);
  }

  stats.push((
    u32::MAX,
    u32::MAX,
    hero_wins_total,
    hero_ties_total,
    hero_plays_total,
    hero_rank_wins,
    hero_rank_ties,
    hero_rank_lose_counts,
  ));

  update_progress(total_work);
  Ok(stats)
}

/// Rank distribution for multiple hands given partial board using rs_poker evaluation.
pub fn simulate_rank_distribution(
  hands_str: &str,
  board_str: &str,
  trials: u32,
  seed: u64,
) -> Result<Vec<[u32; 9]>, String> {
  simulate_rank_distribution_inner::<fn(u32)>(hands_str, board_str, trials, seed, None)
}

pub fn simulate_rank_distribution_with_progress<F: FnMut(u32)>(
  hands_str: &str,
  board_str: &str,
  trials: u32,
  seed: u64,
  progress: Option<F>,
) -> Result<Vec<[u32; 9]>, String> {
  simulate_rank_distribution_inner(hands_str, board_str, trials, seed, progress)
}

fn simulate_rank_distribution_inner<F: FnMut(u32)>(
  hands_str: &str,
  board_str: &str,
  trials: u32,
  seed: u64,
  mut progress: Option<F>,
) -> Result<Vec<[u32; 9]>, String> {
  let hands = parse_hands_min1(hands_str).ok_or("failed to parse hands")?;
  let board = parse_board(board_str).ok_or("failed to parse board")?;
  if board.len() < 3 {
    return Err("board must be >=3 cards".into());
  }
  if board.len() > 5 {
    return Err("board must be <=5 cards".into());
  }

  {
    let mut seen = Vec::new();
    for c in &board {
      if seen.iter().any(|x: &SimCard| x.rank == c.rank && x.suit == c.suit) {
        return Err("duplicate cards detected in board".into());
      }
      seen.push(*c);
    }
  }

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

  let trials = trials.max(1);
  let total_work = (trials as u64).saturating_mul(hands.len() as u64).max(1);
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

  for _ in 0..trials {
    for (idx, hand) in hands.iter().enumerate() {
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

      let mut rs_hand = to_rs_hand(hand);
      for c in &full_board {
        rs_hand.insert(to_rs_card(c));
      }
      let rank = rs_hand.rank();
      let r_idx = rank_index(&rank);
      if r_idx < 9 {
        counts[idx][r_idx] += 1;
      }

      completed = completed.saturating_add(1);
      update_progress(completed);
    }
  }

  update_progress(total_work);
  Ok(counts)
}

fn validate_inputs(
  hero_hand: &[SimCard; 2],
  board: &[SimCard],
  opponents: &[[SimCard; 2]],
) -> Result<(), String> {
  {
    let mut seen = Vec::new();
    for c in board {
      if seen.iter().any(|x: &SimCard| x.rank == c.rank && x.suit == c.suit) {
        return Err("duplicate cards detected in board".into());
      }
      seen.push(*c);
    }
  }

  if hero_hand[0].rank == hero_hand[1].rank && hero_hand[0].suit == hero_hand[1].suit {
    return Err("duplicate cards inside hero hand".into());
  }
  for c in hero_hand {
    if board.iter().any(|x| x.rank == c.rank && x.suit == c.suit) {
      return Err("hero overlaps board".into());
    }
  }
  for opp in opponents {
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
  Ok(())
}

fn to_rs_card(card: &SimCard) -> Card {
  let value = Value::from(card.rank);
  let suit = match card.suit {
    0 => Suit::Spade,
    1 => Suit::Heart,
    2 => Suit::Diamond,
    3 => Suit::Club,
    _ => Suit::Spade,
  };
  Card::new(value, suit)
}

fn to_rs_hand(hand: &[SimCard; 2]) -> Hand {
  let cards = vec![to_rs_card(&hand[0]), to_rs_card(&hand[1])];
  Hand::new_with_cards(cards)
}

fn rank_index(rank: &Rank) -> usize {
  match rank {
    Rank::HighCard(_) => 0,
    Rank::OnePair(_) => 1,
    Rank::TwoPair(_) => 2,
    Rank::ThreeOfAKind(_) => 3,
    Rank::Straight(_) => 4,
    Rank::Flush(_) => 5,
    Rank::FullHouse(_) => 6,
    Rank::FourOfAKind(_) => 7,
    Rank::StraightFlush(_) => 8,
  }
}
