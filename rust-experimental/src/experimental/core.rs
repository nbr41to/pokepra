use rs_poker::core::{
  Card,
  CardBitSet,
  Deck,
  FlatHand,
  Hand,
  PlayerBitSet,
  Rankable,
  Suit,
  Value,
};

pub fn run() {
  println!("\n-- core: カード/デッキ/ハンド/ランク評価/ビットセット --");

  let value = Value::from_char('A').unwrap();
  let suit = Suit::from_char('s').unwrap();
  println!("Value::from_char('A') -> {value:?}");
  println!("Suit::from_char('s') -> {suit:?}");
  println!("Value::gap(K, A) -> {}", Value::King.gap(Value::Ace));

  let card = Card::new(value, suit);
  println!(
    "Card::new(A, s) -> {card:?} / to_char -> {}{}",
    value.to_char(),
    suit.to_char()
  );

  let mut hand = Hand::new_with_cards(vec![
    card,
    Card::new(Value::King, Suit::Heart),
  ]);
  println!("Hand::new_with_cards -> count={}", hand.count());
  hand.insert(Card::new(Value::Queen, Suit::Diamond));
  println!("Hand::insert -> count={}", hand.count());

  let parsed = Hand::new_from_str("AhKhQd").unwrap();
  println!("Hand::new_from_str(\"AhKhQd\") -> count={}", parsed.count());

  let mut flat = FlatHand::new_from_str("AhKhQhJhTh").unwrap();
  println!("FlatHand::new_from_str -> len={}", flat.len());
  println!("FlatHand::rank (7枚までOK) -> {:?}", flat.rank());
  flat.truncate(5);
  println!("FlatHand::rank_five (5枚固定) -> {:?}", flat.rank_five());

  let mut deck = Deck::default();
  println!("Deck::default -> len={}", deck.len());
  let ace_spade = Card::new(Value::Ace, Suit::Spade);
  deck.remove(&ace_spade);
  println!("Deck::remove(A♠) -> contains? {}", deck.contains(&ace_spade));
  println!("Deck::iter 先頭3枚:");
  for (idx, c) in deck.iter().take(3).enumerate() {
    println!("  {}: {:?}", idx + 1, c);
  }

  let mut set = CardBitSet::new();
  set.insert(Card::new(Value::Ace, Suit::Club));
  set.insert(Card::new(Value::Ten, Suit::Heart));
  println!(
    "CardBitSet -> count={} contains A♣? {}",
    set.count(),
    set.contains(Card::new(Value::Ace, Suit::Club))
  );

  let mut players = PlayerBitSet::new(6);
  players.disable(3);
  players.disable(5);
  let active: Vec<usize> = players.ones().collect();
  println!(
    "PlayerBitSet -> active={active:?} count={}",
    players.count()
  );
}
