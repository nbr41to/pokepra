//! レンジ式（`"AKs+,QQ+"` 等）を全コンボに展開する WASM エクスポート用ロジック。
//!
//! 単純に [`crate::parser::parse_range`] を呼んでカード文字列の 2 次元配列に
//! 整形し直すだけ。除外カードを指定すれば、それを含むコンボはフィルタする。

use std::collections::HashSet;

use rs_poker::core::Card;

use crate::cards::card_to_str;
use crate::parser::{parse_cards, parse_range};

pub fn run(range: &str, excluded: &str) -> Result<Vec<[String; 2]>, String> {
    let combos = parse_range(range)?;
    let excluded_cards: HashSet<Card> = parse_cards(excluded)?.into_iter().collect();

    Ok(combos
        .into_iter()
        .filter(|(a, b)| !excluded_cards.contains(a) && !excluded_cards.contains(b))
        .map(|(a, b)| {
            // 表示順は値の高い方を先頭に揃える。v1 互換。
            let (high, low) = if (a.value as u8) >= (b.value as u8) {
                (a, b)
            } else {
                (b, a)
            };
            [card_to_str(&high), card_to_str(&low)]
        })
        .collect())
}
