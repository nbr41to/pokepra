//! JS から来る文字列入力を rs_poker の型に変換する層。
//!
//! 受け取る文字列のフォーマットは v1 互換で次のとおり。
//!
//! - カード列: `"As Ks Qd"` または `"AsKsQd"`（空白の有無は不問）
//! - ハンドのリスト: `"AsKs; QdJd"` のようにセミコロン区切り
//! - レンジ式: `"AKs+,QQ+"` または展開済み `"AsKs,KdQd"`（カンマ区切り）
//!
//! ここで一旦 `String` から `Vec<Card>` / `Vec<(Card, Card)>` に正規化することで
//! シミュレーション本体側は文字列を意識しなくて済む。

use rs_poker::core::{Card, Hand};
use rs_poker::holdem::RangeParser;

/// 連結カード文字列 (`"AsKsQd"`) を `Vec<Card>` に変換する。
///
/// rs_poker の `Hand::new_from_str` は空白を許容しないので、空白文字を
/// 取り除いてから渡す。
pub fn parse_cards(s: &str) -> Result<Vec<Card>, String> {
    let cleaned: String = s.chars().filter(|c| !c.is_whitespace()).collect();
    if cleaned.is_empty() {
        return Ok(Vec::new());
    }
    let hand = Hand::new_from_str(&cleaned).map_err(|e| format!("parse error '{}': {:?}", s, e))?;
    Ok(hand.iter().collect())
}

/// 「ちょうど 2 枚のカード」をパースする。スターティングハンド用。
pub fn parse_two_cards(s: &str) -> Result<(Card, Card), String> {
    let cards = parse_cards(s)?;
    if cards.len() != 2 {
        return Err(format!(
            "expected 2 cards, got {} from '{}'",
            cards.len(),
            s
        ));
    }
    Ok((cards[0], cards[1]))
}

/// セミコロン区切りで複数のハンドをパースする。
pub fn parse_hands_list(s: &str) -> Result<Vec<(Card, Card)>, String> {
    s.split(';')
        .map(str::trim)
        .filter(|p| !p.is_empty())
        .map(parse_two_cards)
        .collect()
}

/// レンジ式（`"AKs+,QQ+"` 等）を全コンボに展開する。
///
/// rs_poker の `RangeParser::parse_many` を薄くラップしているだけだが、
/// 戻り値の `FlatHand` から `(Card, Card)` タプルへ変換する役目もある。
pub fn parse_range(input: &str) -> Result<Vec<(Card, Card)>, String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Ok(Vec::new());
    }
    let hands = RangeParser::parse_many(trimmed)
        .map_err(|e| format!("range parse error '{}': {:?}", input, e))?;
    Ok(hands
        .into_iter()
        .filter_map(|h| {
            let cards: Vec<Card> = h.iter().copied().collect();
            if cards.len() == 2 {
                Some((cards[0], cards[1]))
            } else {
                None
            }
        })
        .collect())
}
