use super::card::{parse_card, Card};

pub(crate) fn parse_hand_two(input: &str) -> Option<[Card; 2]> {
  let tokens: Vec<String> = if input.contains(' ') {
    input.split_whitespace().map(|s| s.to_string()).collect()
  } else {
    input
      .as_bytes()
      .chunks(2)
      .map(|c| String::from_utf8_lossy(c).to_string())
      .collect()
  };
  if tokens.len() != 2 {
    return None;
  }
  let c1 = parse_card(&tokens[0])?;
  let c2 = parse_card(&tokens[1])?;
  Some([c1, c2])
}

/// Parse multiple hands separated by ';', each hand uses space or no-space
/// between its 2 hole cards. Example: "AsKs;QhQd;JhTh"
pub(crate) fn parse_hands(input: &str) -> Option<Vec<[Card; 2]>> {
  let mut hands = Vec::new();
  for raw in input.split(';') {
    if raw.trim().is_empty() {
      continue;
    }
    let hand = parse_hand_two(raw)?;
    hands.push(hand);
  }
  if hands.len() < 2 || hands.len() > 8 {
    return None;
  }
  Some(hands)
}

pub(crate) fn parse_hands_min1(input: &str) -> Option<Vec<[Card; 2]>> {
  let mut hands = Vec::new();
  for raw in input.split(';') {
    if raw.trim().is_empty() {
      continue;
    }
    let hand = parse_hand_two(raw)?;
    hands.push(hand);
  }
  if hands.is_empty() {
    return None;
  }
  Some(hands)
}

pub(crate) fn parse_board(input: &str) -> Option<Vec<Card>> {
  let mut cards = Vec::new();
  if input.trim().is_empty() {
    return Some(cards);
  }
  let tokens: Vec<String> = if input.contains(' ') {
    input.split_whitespace().map(|s| s.to_string()).collect()
  } else {
    input
      .as_bytes()
      .chunks(2)
      .map(|c| String::from_utf8_lossy(c).to_string())
      .collect()
  };
  if tokens.len() > 5 {
    return None;
  }
  for t in tokens {
    cards.push(parse_card(&t)?);
  }
  Some(cards)
}
