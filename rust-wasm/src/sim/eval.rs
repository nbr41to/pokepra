use super::card::Card;

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub(crate) enum HandRank {
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
pub(crate) struct HandScore {
  pub(crate) rank: HandRank,
  pub(crate) kickers: [u8; 5], // descending
  pub(crate) encoded: u32,
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
    fill = 1;
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
    fill = 1;
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
  HandScore {
    rank,
    kickers,
    encoded,
  }
}

pub(crate) fn best_of(cards: &[Card]) -> HandScore {
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
