use super::card::Card;
use super::rng::Lcg64;

pub(crate) fn build_deck(exclude: &[Card]) -> Vec<Card> {
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

pub(crate) fn shuffle_slice(deck: &mut [Card], rng: &mut Lcg64) {
  for i in (1..deck.len()).rev() {
    let j = (rng.next_u32() as usize) % (i + 1);
    deck.swap(i, j);
  }
}

pub(crate) fn encode_card(c: Card) -> u32 {
  ((c.rank as u32) << 2) | (c.suit as u32)
}

pub(crate) fn decode_hand_pair(hand: &[Card; 2]) -> (u32, u32) {
  (
    core::cmp::min(encode_card(hand[0]), encode_card(hand[1])),
    core::cmp::max(encode_card(hand[0]), encode_card(hand[1])),
  )
}
