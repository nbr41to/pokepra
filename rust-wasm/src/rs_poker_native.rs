//! Thin wrapper around `rs_poker` to rank 5-card hands and compare them.

use rs_poker::core::{Card, Hand, Rank, Rankable, Suit, Value};
use std::cmp::Ordering;

fn parse_card(token: &str) -> Option<Card> {
  if token.len() != 2 {
    return None;
  }
  let mut chars = token.chars();
  let value = Value::from_char(chars.next()?)?;
  let suit = Suit::from_char(chars.next()?)?;
  Some(Card { value, suit })
}

fn parse_hand_5(hand: &str) -> Option<Hand> {
  let tokens: Vec<String> = if hand.contains(' ') {
    hand.split_whitespace().map(|s| s.to_string()).collect()
  } else {
    hand
      .as_bytes()
      .chunks(2)
      .map(|c| String::from_utf8_lossy(c).to_string())
      .collect()
  };
  if tokens.len() != 5 {
    return None;
  }
  let mut cards = Vec::with_capacity(5);
  for t in tokens {
    cards.push(parse_card(&t)?);
  }
  Some(Hand::new_with_cards(cards))
}

#[repr(u32)]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum HandCategory {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
}

fn category_from_rank(rank: &Rank) -> HandCategory {
  match rank {
    Rank::StraightFlush(_) => HandCategory::StraightFlush,
    Rank::FourOfAKind(_) => HandCategory::FourOfAKind,
    Rank::FullHouse(_) => HandCategory::FullHouse,
    Rank::Flush(_) => HandCategory::Flush,
    Rank::Straight(_) => HandCategory::Straight,
    Rank::ThreeOfAKind(_) => HandCategory::ThreeOfAKind,
    Rank::TwoPair(_) => HandCategory::TwoPair,
    Rank::OnePair(_) => HandCategory::OnePair,
    Rank::HighCard(_) => HandCategory::HighCard,
  }
}

pub fn evaluate_hand_rs(hand: &str) -> Result<HandCategory, String> {
  let parsed = parse_hand_5(hand).ok_or("failed to parse hand")?;
  Ok(category_from_rank(&parsed.rank()))
}

pub fn compare_hands_rs(a: &str, b: &str) -> Result<Ordering, String> {
  let h1 = parse_hand_5(a).ok_or("failed to parse hand a")?;
  let h2 = parse_hand_5(b).ok_or("failed to parse hand b")?;
  Ok(h1.rank().cmp(&h2.rank()))
}
