use std::cmp::Ordering;

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
struct Card {
  rank: u8, // 0 = 2, ..., 12 = A
  suit: u8, // 0 = s, 1 = h, 2 = d, 3 = c
}

fn rank_from_char(ch: u8) -> Option<u8> {
  match ch {
    b'2' => Some(0),
    b'3' => Some(1),
    b'4' => Some(2),
    b'5' => Some(3),
    b'6' => Some(4),
    b'7' => Some(5),
    b'8' => Some(6),
    b'9' => Some(7),
    b'T' | b't' => Some(8),
    b'J' | b'j' => Some(9),
    b'Q' | b'q' => Some(10),
    b'K' | b'k' => Some(11),
    b'A' | b'a' => Some(12),
    _ => None,
  }
}

fn suit_from_char(ch: u8) -> Option<u8> {
  match ch {
    b's' | b'S' => Some(0),
    b'h' | b'H' => Some(1),
    b'd' | b'D' => Some(2),
    b'c' | b'C' => Some(3),
    _ => None,
  }
}

fn parse_card(token: &str) -> Option<Card> {
  let bytes = token.as_bytes();
  if bytes.len() != 2 {
    return None;
  }
  let rank = rank_from_char(bytes[0])?;
  let suit = suit_from_char(bytes[1])?;
  Some(Card { rank, suit })
}

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
enum HandRank {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  ThreeOfKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfKind = 7,
  StraightFlush = 8,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
struct HandScore {
  rank: HandRank,
  kickers: [u8; 5], // descending
  encoded: u32,
}

fn straight_high(mask: u16) -> Option<u8> {
  for high in (4..=12).rev() {
    let window = ((1u16 << 5) - 1) << (high - 4);
    if mask & window == window {
      return Some(high as u8);
    }
  }
  let wheel = (1 << 12) | 0b1_111;
  if mask & wheel == wheel {
    return Some(3);
  }
  None
}

fn encode_score(rank: HandRank, kickers: &[u8; 5]) -> u32 {
  let mut value = (rank as u32) << 28;
  for (i, k) in kickers.iter().enumerate() {
    value |= (*k as u32) << (24 - (i as u32 * 4));
  }
  value
}

fn evaluate_five(cards: &[Card]) -> HandScore {
  let mut rank_counts = [0u8; 13];
  let mut suit_counts = [0u8; 4];
  let mut mask: u16 = 0;
  for c in cards {
    rank_counts[c.rank as usize] += 1;
    suit_counts[c.suit as usize] += 1;
    mask |= 1 << c.rank;
  }

  let is_flush = suit_counts.iter().any(|&c| c == 5);
  let straight_high_rank = straight_high(mask);

  let mut by_count: Vec<(u8, u8)> = (0u8..13)
    .filter_map(|r| {
      let c = rank_counts[r as usize];
      if c > 0 {
        Some((c, r))
      } else {
        None
      }
    })
    .collect();
  by_count.sort_by(|a, b| b.cmp(a));

  let mut kickers = [0u8; 5];
  let mut fill = 0usize;

  let rank = if is_flush && straight_high_rank.is_some() {
    kickers[0] = straight_high_rank.unwrap();
    HandRank::StraightFlush
  } else if by_count[0].0 == 4 {
    kickers[0] = by_count[0].1;
    kickers[1] = by_count[1].1;
    HandRank::FourOfKind
  } else if by_count[0].0 == 3 && by_count[1].0 == 2 {
    kickers[0] = by_count[0].1;
    kickers[1] = by_count[1].1;
    HandRank::FullHouse
  } else if is_flush {
    for (_, r) in by_count.iter() {
      kickers[fill] = *r;
      fill += 1;
    }
    HandRank::Flush
  } else if let Some(high) = straight_high_rank {
    kickers[0] = high;
    HandRank::Straight
  } else if by_count[0].0 == 3 {
    kickers[0] = by_count[0].1;
    for (_, r) in by_count.iter().skip(1) {
      kickers[fill] = *r;
      fill += 1;
    }
    HandRank::ThreeOfKind
  } else if by_count[0].0 == 2 && by_count[1].0 == 2 {
    kickers[0] = by_count[0].1;
    kickers[1] = by_count[1].1;
    kickers[2] = by_count[2].1;
    HandRank::TwoPair
  } else if by_count[0].0 == 2 {
    kickers[0] = by_count[0].1;
    for (_, r) in by_count.iter().skip(1) {
      kickers[fill] = *r;
      fill += 1;
    }
    HandRank::OnePair
  } else {
    for (_, r) in by_count.iter() {
      kickers[fill] = *r;
      fill += 1;
    }
    HandRank::HighCard
  };

  let encoded = encode_score(rank, &kickers);
  HandScore { rank, kickers, encoded }
}

fn best_of(cards: &[Card]) -> HandScore {
  assert!(cards.len() >= 5 && cards.len() <= 7);
  let n = cards.len();
  let mut best = evaluate_five(&cards[0..5]);
  for i in 0..n - 4 {
    for j in i + 1..n - 3 {
      for k in j + 1..n - 2 {
        for l in k + 1..n - 1 {
          for m in l + 1..n {
            let subset = [cards[i], cards[j], cards[k], cards[l], cards[m]];
            let score = evaluate_five(&subset);
            if score.encoded > best.encoded {
              best = score;
            }
          }
        }
      }
    }
  }
  best
}

#[derive(Clone, Debug)]
struct Lcg64 {
  state: u64,
}

impl Lcg64 {
  fn new(seed: u64) -> Self {
    Self { state: seed | 1 } // avoid zero
  }
  fn next_u32(&mut self) -> u32 {
    self.state = self.state.wrapping_mul(6364136223846793005).wrapping_add(1);
    (self.state >> 32) as u32
  }
}

/// Parse multiple hands separated by ';', each hand uses space or no-space
/// between its 2 hole cards. Example: "AsKs;QhQd;JhTh"
fn parse_hands(input: &str) -> Option<Vec<[Card; 2]>> {
  let mut hands = Vec::new();
  for raw in input.split(';') {
    if raw.trim().is_empty() {
      continue;
    }
    let tokens: Vec<String> = if raw.contains(' ') {
      raw.split_whitespace().map(|s| s.to_string()).collect()
    } else {
      raw.as_bytes().chunks(2).map(|c| String::from_utf8_lossy(c).to_string()).collect()
    };
    if tokens.len() != 2 {
      return None;
    }
    let c1 = parse_card(&tokens[0])?;
    let c2 = parse_card(&tokens[1])?;
    hands.push([c1, c2]);
  }
  if hands.len() < 2 || hands.len() > 8 {
    return None;
  }
  Some(hands)
}

fn parse_hands_min1(input: &str) -> Option<Vec<[Card; 2]>> {
  let mut hands = Vec::new();
  for raw in input.split(';') {
    if raw.trim().is_empty() {
      continue;
    }
    let tokens: Vec<String> = if raw.contains(' ') {
      raw.split_whitespace().map(|s| s.to_string()).collect()
    } else {
      raw.as_bytes()
        .chunks(2)
        .map(|c| String::from_utf8_lossy(c).to_string())
        .collect()
    };
    if tokens.len() != 2 {
      return None;
    }
    let c1 = parse_card(&tokens[0])?;
    let c2 = parse_card(&tokens[1])?;
    hands.push([c1, c2]);
  }
  if hands.is_empty() {
    return None;
  }
  Some(hands)
}

fn parse_board(input: &str) -> Option<Vec<Card>> {
  let mut cards = Vec::new();
  if input.trim().is_empty() {
    return Some(cards);
  }
  let tokens: Vec<String> = if input.contains(' ') {
    input.split_whitespace().map(|s| s.to_string()).collect()
  } else {
    input.as_bytes().chunks(2).map(|c| String::from_utf8_lossy(c).to_string()).collect()
  };
  if tokens.len() > 5 {
    return None;
  }
  for t in tokens {
    cards.push(parse_card(&t)?);
  }
  Some(cards)
}

fn build_deck(exclude: &[Card]) -> Vec<Card> {
  let mut deck = Vec::with_capacity(52 - exclude.len());
  for r in 0..13 {
    for s in 0..4 {
      let c = Card { rank: r, suit: s };
      if !exclude.iter().any(|e| e.rank == c.rank && e.suit == c.suit) {
        deck.push(c);
      }
    }
  }
  deck
}

fn shuffle_slice(deck: &mut [Card], rng: &mut Lcg64) {
  for i in (1..deck.len()).rev() {
    let j = (rng.next_u32() as usize) % (i + 1);
    deck.swap(i, j);
  }
}

fn encode_card(c: Card) -> u32 {
  ((c.rank as u32) << 2) | (c.suit as u32)
}

fn decode_hand_pair(hand: &[Card; 2]) -> (u32, u32) {
  (
    core::cmp::min(encode_card(hand[0]), encode_card(hand[1])),
    core::cmp::max(encode_card(hand[0]), encode_card(hand[1])),
  )
}

/// Hero vs provided opponent list, returning wins/ties and rank distribution per opponent.
pub fn simulate_vs_list_with_ranks(
  hero_hand_str: &str,
  board_str: &str,
  compare_list: &str,
  trials: u32,
  seed: u64,
) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9])>, String> {
  let hero_tokens: Vec<String> = if hero_hand_str.contains(' ') {
    hero_hand_str
      .split_whitespace()
      .map(|s| s.to_string())
      .collect()
  } else {
    hero_hand_str
      .as_bytes()
      .chunks(2)
      .map(|c| String::from_utf8_lossy(c).to_string())
      .collect()
  };
  if hero_tokens.len() != 2 {
    return Err("hero hand must have 2 cards".into());
  }
  let hero_hand = [
    parse_card(&hero_tokens[0]).ok_or("failed to parse hero card1")?,
    parse_card(&hero_tokens[1]).ok_or("failed to parse hero card2")?,
  ];

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
    let tokens: Vec<String> = if raw.contains(' ') {
      raw.split_whitespace().map(|s| s.to_string()).collect()
    } else {
      raw.as_bytes()
        .chunks(2)
        .map(|c| String::from_utf8_lossy(c).to_string())
        .collect()
    };
    if tokens.len() != 2 {
      return Err("each compare hand must have 2 cards".into());
    }
    let c1 = parse_card(&tokens[0]).ok_or("failed to parse compare card1")?;
    let c2 = parse_card(&tokens[1]).ok_or("failed to parse compare card2")?;
    opponents.push([c1, c2]);
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

  let missing_board = 5usize.saturating_sub(board.len());
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

    for _ in 0..trials.max(1) {
      // deck per opponent: exclude hero + board + this opponent
      let mut exclude = board.clone();
      exclude.push(hero_hand[0]);
      exclude.push(hero_hand[1]);
      exclude.push(opp[0]);
      exclude.push(opp[1]);
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

      let mut hero_cards = Vec::with_capacity(7);
      hero_cards.extend_from_slice(&hero_hand);
      hero_cards.extend_from_slice(&full_board);
      let hero_score = best_of(&hero_cards);

      let mut opp_cards = Vec::with_capacity(7);
      opp_cards.extend_from_slice(opp);
      opp_cards.extend_from_slice(&full_board);
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
  for _ in 0..trials.max(1) {
    let mut exclude = board.clone();
    exclude.push(hero_hand[0]);
    exclude.push(hero_hand[1]);
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

    let mut hero_cards = Vec::with_capacity(7);
    hero_cards.extend_from_slice(&hero_hand);
    hero_cards.extend_from_slice(&full_board);
    let hero_score = best_of(&hero_cards);
    let r_idx = hero_score.rank as usize;
    if r_idx < 9 {
      hero_rank_counts[r_idx] += 1;
    }
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

  Ok(stats)
}
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
use std::collections::HashMap;
