//! 既知のボードに対する複数ハンドの役判定。
//!
//! Monte Carlo ではなく、確定したカードだけを使って評価する。
//! 「フロップ後にどの手が一番強いか」を一覧表示するのに使う。

use rs_poker::core::Rank;

use crate::cards::pair_string;
use crate::dto::HandRankingEntry;
use crate::parser::{parse_cards, parse_hands_list};
use crate::rank::{rank_encoded, rank_index, RANK_LABELS};
use crate::sim::evaluate_seven;

pub fn run(hands: &str, board: &str) -> Result<Vec<HandRankingEntry>, String> {
    let hands_list = parse_hands_list(hands)?;
    let board_cards = parse_cards(board)?;

    // ボードが 0 枚、あるいはハンドが空のときは何も評価できない。
    if hands_list.is_empty() || board_cards.is_empty() {
        return Ok(Vec::new());
    }

    // (Rank, Entry) の組で持つことで、後段の Rank ベース降順ソートが楽になる。
    let mut tagged: Vec<(Rank, HandRankingEntry)> = hands_list
        .into_iter()
        .map(|(a, b)| {
            let r = evaluate_seven(&board_cards, a, b);
            let idx = rank_index(&r);
            (
                r.clone(),
                HandRankingEntry {
                    hand: pair_string(a, b),
                    rank_index: idx,
                    rank_name: RANK_LABELS[idx].to_string(),
                    encoded: rank_encoded(&r),
                    kickers: Vec::new(),
                },
            )
        })
        .collect();

    // 強い役が先頭になるように降順ソート。
    tagged.sort_by(|a, b| b.0.cmp(&a.0));

    Ok(tagged.into_iter().map(|(_, e)| e).collect())
}
