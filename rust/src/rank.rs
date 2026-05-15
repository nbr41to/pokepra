//! `rs_poker::Rank` をアプリ側で扱いやすい形に変換する。

use rs_poker::core::Rank;

/// 役カテゴリの表示名。配列のインデックスが [`rank_index`] と一致するよう保つこと。
pub const RANK_LABELS: [&str; 9] = [
    "High Card",
    "One Pair",
    "Two Pair",
    "Three of a Kind",
    "Straight",
    "Flush",
    "Full House",
    "Four of a Kind",
    "Straight Flush",
];

/// `Rank` をカテゴリ番号 0..=8 にマップする。
///
/// 0 = High Card, 8 = Straight Flush。`Rank` 自体は内部値も含めて Ord 実装が
/// あるが、JS 側では「役の種類だけで集計したい」場面が多いのでここで剥がす。
#[inline]
pub fn rank_index(r: &Rank) -> usize {
    match r {
        Rank::HighCard(_) => 0,
        Rank::OnePair(_) => 1,
        Rank::TwoPair(_) => 2,
        Rank::ThreeOfAKind(_) => 3,
        Rank::Straight(_) => 4,
        Rank::Flush(_) => 5,
        Rank::FullHouse(_) => 6,
        Rank::FourOfAKind(_) => 7,
        Rank::StraightFlush(_) => 8,
    }
}

/// `Rank` の内部値（キッカー含むエンコード済みスコア）を取り出す。
///
/// JS 側で同カテゴリ内の優劣比較に使う。
#[inline]
pub fn rank_encoded(r: &Rank) -> u32 {
    match r {
        Rank::HighCard(v)
        | Rank::OnePair(v)
        | Rank::TwoPair(v)
        | Rank::ThreeOfAKind(v)
        | Rank::Straight(v)
        | Rank::Flush(v)
        | Rank::FullHouse(v)
        | Rank::FourOfAKind(v)
        | Rank::StraightFlush(v) => *v,
    }
}

/// 役カテゴリ別の集計バケット。win/tie/lose × 9 カテゴリ。
///
/// hero 側のランク分布を「勝ったとき」「タイ」「負けたとき」で分けて
/// 数え上げるためのコンテナ。 [`crate::dto::RankOutcomeResults`] に
/// 変換して JS へ返す。
#[derive(Default, Clone)]
pub struct RankBuckets {
    pub win: [u32; 9],
    pub tie: [u32; 9],
    pub lose: [u32; 9],
}
