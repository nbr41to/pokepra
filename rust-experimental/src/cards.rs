use rand::Rng;
use rs_poker::core::{Card, Deck, Hand};

/// 文字列表現の 2 枚ハンドを `rs_poker` の `Card` タプルへ変換する責務を持つ。
///
/// 入力は `"AhKh"` と `"Ah Kh"` のどちらにも対応する。
/// 実験用コードでは入力値を固定して扱うため、不正入力時は `panic!` で早期に気付けるようにしている。
pub fn parse_two_cards(input: &str) -> (Card, Card) {
    let cleaned: String = input.chars().filter(|c| !c.is_whitespace()).collect();
    let hand = Hand::new_from_str(&cleaned)
        .unwrap_or_else(|error| panic!("failed to parse hand '{input}': {error:?}"));
    let cards: Vec<Card> = hand.iter().collect();

    if cards.len() != 2 {
        panic!(
            "expected exactly 2 cards from '{input}', got {}",
            cards.len()
        );
    }

    (cards[0], cards[1])
}

/// 指定済みカードを除いたデッキを生成する責務を持つ。
///
/// `rs_poker::core::Deck::default()` は 52 枚の標準デッキを返すため、
/// そこからホールカードや既知ボードを取り除くことで、以降のランダム deal に使う残デッキを作る。
pub(crate) fn deck_without(used: &[Card]) -> Deck {
    let mut deck = Deck::default();

    for card in used {
        deck.remove(card);
    }

    deck
}

/// 52 枚のデッキから 2 人分のホールカードを重複なしで配る責務を持つ。
///
/// 実験ごとに異なるハンドで戦わせるため、各ハンド開始時に新しい `Deck::default()` を作り、
/// `Deck::deal` で 4 枚を順番に取り出す。
pub(crate) fn deal_two_player_hole_cards<R: Rng>(rng: &mut R) -> ((Card, Card), (Card, Card)) {
    let mut deck = Deck::default();
    let player_1 = (
        deck.deal(rng).expect("full deck should deal first card"),
        deck.deal(rng).expect("full deck should deal second card"),
    );
    let player_2 = (
        deck.deal(rng).expect("full deck should deal third card"),
        deck.deal(rng).expect("full deck should deal fourth card"),
    );

    (player_1, player_2)
}

/// 2 枚ハンドを人間が読みやすい文字列へ整形する責務を持つ。
///
/// `rs_poker` の `Hand` は内部順序でカードを返すため、表示順はライブラリの順序に従う。
pub(crate) fn format_hand((a, b): (Card, Card)) -> String {
    format!("{} {}", format_card(a), format_card(b))
}

/// 1 枚のカードを `"Ah"` のような 2 文字表記に変換する責務を持つ。
pub(crate) fn format_card(card: Card) -> String {
    let mut out = String::with_capacity(2);
    out.push(card.value.to_char());
    out.push(card.suit.to_char());
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;

    #[test]
    fn parse_two_cards_accepts_compact_input() {
        let hand = parse_two_cards("AhKh");

        assert_eq!(format_hand(hand), "Kh Ah");
    }

    #[test]
    fn parse_two_cards_accepts_spaced_input() {
        let hand = parse_two_cards("Ah Kh");

        assert_eq!(format_hand(hand), "Kh Ah");
    }

    #[test]
    #[should_panic(expected = "expected exactly 2 cards")]
    fn parse_two_cards_rejects_non_two_card_input() {
        parse_two_cards("AhKhQs");
    }

    #[test]
    fn deck_without_removes_used_cards_from_full_deck() {
        let used = parse_two_cards("AhKh");
        let deck = deck_without(&[used.0, used.1]);

        assert_eq!(deck.len(), 50);
        assert!(!deck.contains(&used.0));
        assert!(!deck.contains(&used.1));
    }

    #[test]
    fn deal_two_player_hole_cards_deals_four_unique_cards() {
        let mut rng = rand_chacha::ChaCha8Rng::seed_from_u64(1);
        let (player_1, player_2) = deal_two_player_hole_cards(&mut rng);
        let cards = [player_1.0, player_1.1, player_2.0, player_2.1];
        let unique_cards: std::collections::HashSet<Card> = cards.into_iter().collect();

        assert_eq!(unique_cards.len(), 4);
    }

    #[test]
    fn format_hand_returns_two_card_display() {
        let hand = parse_two_cards("QsQd");

        assert_eq!(format_hand(hand), "Qs Qd");
    }
}
