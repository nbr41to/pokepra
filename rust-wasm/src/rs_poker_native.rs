//! rs_poker-based helpers for Monte Carlo simulations.

use rs_poker::core::{Card, Hand, Rank, Suit, Value};
use rs_poker::holdem::MonteCarloGame;

use crate::sim::{decode_hand_pair, parse_board, parse_hand_two, Card as SimCard};

/// Hero vs provided opponent list, returning wins/ties/plays per opponent and hero aggregate.
pub fn simulate_vs_list_equity(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
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

  Ok(stats)
}

/// Hero vs provided opponent list, returning wins/ties and winner rank distribution via MonteCarloGame.
pub fn simulate_vs_list_with_ranks_monte_carlo(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9])>, String> {
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
  let board_rs: Vec<Card> = board.iter().map(to_rs_card).collect();

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
      if hero_win && opp_win {
        ties += 1;
      } else if hero_win {
        wins += 1;
      }
      if hero_win {
        let idx = rank_index(&rank);
        if idx < 9 {
          rank_counts[idx] += 1;
          hero_rank_counts[idx] = hero_rank_counts[idx].saturating_add(1);
        }
      }
      game.reset();
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

  stats.push((
    u32::MAX,
    u32::MAX,
    hero_wins_total,
    hero_ties_total,
    hero_plays_total,
    hero_rank_counts,
  ));

  Ok(stats)
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
