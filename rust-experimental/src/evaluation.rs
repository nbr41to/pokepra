use rs_poker::core::{Card, Rank, Rankable};

/// ホールカード 2 枚とボードを合わせた最大 7 枚から最強役を評価する責務を持つ。
///
/// `rs_poker::core::Rankable` は `&[Card]` に対して実装されているため、
/// ここではカードを一時配列にまとめてから `rank()` に委譲する。
pub(crate) fn evaluate_seven(board: &[Card], a: Card, b: Card) -> Rank {
    let mut cards = Vec::with_capacity(board.len() + 2);
    cards.extend_from_slice(board);
    cards.push(a);
    cards.push(b);
    cards.as_slice().rank()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cards::parse_two_cards;
    use rs_poker::core::Hand;

    fn parse_cards(input: &str) -> Vec<Card> {
        Hand::new_from_str(input)
            .expect("test cards should parse")
            .iter()
            .collect()
    }

    #[test]
    fn evaluate_seven_ranks_stronger_hand_higher() {
        let board = parse_cards("QhJhTh2c3d");
        let straight_flush = parse_two_cards("AhKh");
        let two_pair = parse_two_cards("QsJd");

        let strong_rank = evaluate_seven(&board, straight_flush.0, straight_flush.1);
        let weak_rank = evaluate_seven(&board, two_pair.0, two_pair.1);

        assert!(strong_rank > weak_rank);
    }

    #[test]
    fn evaluate_seven_ties_when_best_five_cards_are_same() {
        let board = parse_cards("AhKhQhJhTh");
        let player_1 = parse_two_cards("2c3d");
        let player_2 = parse_two_cards("4c5d");

        let player_1_rank = evaluate_seven(&board, player_1.0, player_1.1);
        let player_2_rank = evaluate_seven(&board, player_2.0, player_2.1);

        assert_eq!(player_1_rank, player_2_rank);
    }
}
