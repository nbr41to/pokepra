//! WASM 境界で JS に返す DTO (Data Transfer Object) を定義する。
//!
//! v1 (`src/lib/wasm-v1/types.ts`) と同じ shape を再現することで、
//! v1 を使っているコンポーネントをそのまま v2 に差し替えられるようにしている。
//! フィールド名のスネーク↔キャメル変換は serde の `rename` で対応する。

use serde::Serialize;

use crate::rank::RankBuckets;

// ─────────────────────────────────────────────
// 役判定の結果
// ─────────────────────────────────────────────

#[derive(Serialize)]
pub struct HandRankingEntry {
    pub hand: String,
    #[serde(rename = "rankIndex")]
    pub rank_index: usize,
    #[serde(rename = "rankName")]
    pub rank_name: String,
    pub encoded: u32,
    /// v1 互換のため残しているが、rs_poker の `Rank` は内部値に
    /// キッカーをエンコード済みなので、ここでは空配列を返す。
    pub kickers: Vec<u32>,
}

// ─────────────────────────────────────────────
// シミュレーション (hero vs list) の結果
// ─────────────────────────────────────────────

#[derive(Serialize)]
pub struct RankOutcome {
    pub win: u32,
    pub tie: u32,
    pub lose: u32,
}

/// 9 カテゴリ分の勝ち/引き分け/負け回数。
///
/// JS 側ではキーが英語の役名でアクセスされるので、`serde(rename)` で
/// スネークケースのフィールドを表示名に寄せている。
#[derive(Serialize)]
pub struct RankOutcomeResults {
    #[serde(rename = "High Card")]
    pub high_card: RankOutcome,
    #[serde(rename = "One Pair")]
    pub one_pair: RankOutcome,
    #[serde(rename = "Two Pair")]
    pub two_pair: RankOutcome,
    #[serde(rename = "Three of a Kind")]
    pub three_of_a_kind: RankOutcome,
    #[serde(rename = "Straight")]
    pub straight: RankOutcome,
    #[serde(rename = "Flush")]
    pub flush: RankOutcome,
    #[serde(rename = "Full House")]
    pub full_house: RankOutcome,
    #[serde(rename = "Four of a Kind")]
    pub four_of_a_kind: RankOutcome,
    #[serde(rename = "Straight Flush")]
    pub straight_flush: RankOutcome,
}

impl From<&RankBuckets> for RankOutcomeResults {
    fn from(b: &RankBuckets) -> Self {
        let make = |i: usize| RankOutcome {
            win: b.win[i],
            tie: b.tie[i],
            lose: b.lose[i],
        };
        Self {
            high_card: make(0),
            one_pair: make(1),
            two_pair: make(2),
            three_of_a_kind: make(3),
            straight: make(4),
            flush: make(5),
            full_house: make(6),
            four_of_a_kind: make(7),
            straight_flush: make(8),
        }
    }
}

#[derive(Serialize)]
pub struct CombinedEntry {
    pub hand: String,
    pub count: u32,
    pub win: u32,
    pub tie: u32,
    pub lose: u32,
    pub results: RankOutcomeResults,
}

#[derive(Serialize)]
pub struct CombinedPayload {
    pub hand: String,
    pub equity: f64,
    pub data: Vec<CombinedEntry>,
}

// ─────────────────────────────────────────────
// シミュレーション (range vs range) の結果
// ─────────────────────────────────────────────

#[derive(Serialize)]
pub struct EquityEntry {
    pub hand: String,
    pub equity: f64,
}

#[derive(Serialize)]
pub struct EquityPayload {
    pub hand: String,
    pub equity: f64,
    pub data: Vec<EquityEntry>,
}

#[derive(Serialize)]
pub struct RangeEquityEntry {
    pub hand: String,
    pub equity: f64,
}

#[derive(Serialize)]
pub struct RangeVsRangePayload {
    pub hero: Vec<RangeEquityEntry>,
    pub villain: Vec<RangeEquityEntry>,
}
