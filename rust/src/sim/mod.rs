//! Monte Carlo シミュレーションのモジュール群。
//!
//! 1 シミュレーション = 1 ファイルの方針で分割している。共通の小さな
//! ヘルパー（7 枚評価など）はこのモジュール直下に置く。

use rs_poker::core::{Card, Rank, Rankable};

pub mod evaluate;
pub mod parse_range;
pub mod range_vs_range;
pub mod vs_list;
pub mod vs_list_equity;

/// ボード + 手札 2 枚を結合し、最良 5 枚の役を評価する。
///
/// rs_poker の `Rankable` は `&[Card]` に対しても実装されているので、
/// 5〜7 枚いずれでもそのまま渡せる。
pub(super) fn evaluate_seven(board: &[Card], a: Card, b: Card) -> Rank {
    let mut v: Vec<Card> = Vec::with_capacity(board.len() + 2);
    v.extend_from_slice(board);
    v.push(a);
    v.push(b);
    let slice: &[Card] = &v;
    slice.rank()
}
