use rs_poker::core::{Card, Hand, Suit, Value};
use rs_poker::holdem::{MonteCarloGame, RangeParser, StartingHand, Suitedness};

pub fn run() {
  println!("\n-- holdem: スターティングハンド/レンジ/モンテカルロ --");

  let pocket_aces = StartingHand::default(Value::Ace, Value::Ace, Suitedness::OffSuit);
  let aa_hands = pocket_aces.possible_hands();
  println!("StartingHand::default(AA, offsuit) -> {} 通り", aa_hands.len());

  let ak_suited = StartingHand::default(Value::Ace, Value::King, Suitedness::Suited);
  println!(
    "StartingHand::default(AK, suited) -> {} 通り",
    ak_suited.possible_hands().len()
  );

  let range = RangeParser::parse_one("KQo+").unwrap();
  println!("RangeParser::parse_one(\"KQo+\") -> {} 通り", range.len());
  for (idx, hand) in range.iter().take(3).enumerate() {
    println!("  例{}: {:?}", idx + 1, hand);
  }

  let hero = Hand::new_with_cards(vec![
    Card::new(Value::Jack, Suit::Spade),
    Card::new(Value::Jack, Suit::Heart),
  ]);
  let villain = Hand::new_with_cards(vec![
    Card::new(Value::Ace, Suit::Spade),
    Card::new(Value::King, Suit::Spade),
  ]);
  let mut game = MonteCarloGame::new(vec![hero, villain]).unwrap();

  let (winners, rank) = game.simulate();
  println!("MonteCarloGame::simulate -> 勝者={:?} / 役={rank:?}", winners);
  game.reset();

  let equity = game.estimate_equity(500);
  println!(
    "MonteCarloGame::estimate_equity(500) -> hero={:.3} villain={:.3}",
    equity[0], equity[1]
  );
}
