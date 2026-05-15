//! カード表示・デッキ構築のユーティリティ。
//!
//! rs_poker は `Card` を提供するが、JS 側に返すための文字列化や
//! 「指定カードを除いた残りのデッキ」を生成する処理はここに集約する。

use rs_poker::core::{Card, Suit, Value};

/// 52 枚のフルデッキを生成する。順序は (Value, Suit) の昇順で安定。
///
/// rs_poker の `Deck::default()` は内部で `CardBitSet` を使っており、
/// イテレーション順序が暗黙的なため、シミュレーションでサンプリング前提の
/// 配列としては自前で組んだ方が予測しやすい。
pub fn full_deck() -> Vec<Card> {
    const VALUES: [Value; 13] = [
        Value::Two,
        Value::Three,
        Value::Four,
        Value::Five,
        Value::Six,
        Value::Seven,
        Value::Eight,
        Value::Nine,
        Value::Ten,
        Value::Jack,
        Value::Queen,
        Value::King,
        Value::Ace,
    ];
    const SUITS: [Suit; 4] = [Suit::Spade, Suit::Heart, Suit::Diamond, Suit::Club];

    let mut out = Vec::with_capacity(52);
    for v in VALUES {
        for s in SUITS {
            out.push(Card { value: v, suit: s });
        }
    }
    out
}

/// `used` に含まれるカードを除いた残デッキを返す。
///
/// シミュレーションの各試行で、既知のカード（hero/board/opponent）を除いた
/// 山札を作るのに使う。`used` は通常 4–9 枚なので線形探索で十分速い。
pub fn deck_minus(used: &[Card]) -> Vec<Card> {
    full_deck()
        .into_iter()
        .filter(|c| !used.contains(c))
        .collect()
}

/// 単一カードを `"As"` のような 2 文字表記にする。
#[inline]
pub fn card_to_str(c: &Card) -> String {
    let mut s = String::with_capacity(2);
    s.push(c.value.to_char());
    s.push(c.suit.to_char());
    s
}

/// 2 枚のカードを `"As Ks"` 形式に整形する（強い方を先頭に）。
///
/// v1 互換のため、JS 側で `hand.split(" ")` してマッチングできるよう
/// 空白区切りで返す。
pub fn pair_string(a: Card, b: Card) -> String {
    let (high, low) = if (a.value as u8) >= (b.value as u8) {
        (a, b)
    } else {
        (b, a)
    };
    format!("{} {}", card_to_str(&high), card_to_str(&low))
}

/// 2 枚のカードを順序に依存しないキーへ変換する。
///
/// `HashMap` のキーとして使う。同じコンボが異なる順序で来ても
/// 同じバケットに集計したい。
pub fn combo_key(a: Card, b: Card) -> (u8, u8) {
    let ai = card_index(a);
    let bi = card_index(b);
    if ai >= bi { (ai, bi) } else { (bi, ai) }
}

#[inline]
fn card_index(c: Card) -> u8 {
    (c.value as u8) * 4 + (c.suit as u8)
}
