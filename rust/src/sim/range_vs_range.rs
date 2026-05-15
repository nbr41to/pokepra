//! hero レンジ vs villain レンジの MC シミュレーション。
//!
//! 各 trial で「hero コンボを 1 つサンプル」「villain コンボを 1 つサンプル
//! （hero と衝突しないもの）」「残りボードをサンプル」して勝敗を記録する。
//! 結果はコンボ単位の equity（その combo が出現したときの平均勝率）として返す。

use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};

use rand::seq::IndexedRandom;
use rs_poker::core::Card;

use crate::cards::{combo_key, deck_minus, pair_string};
use crate::dto::{RangeEquityEntry, RangeVsRangePayload};
use crate::parser::{parse_cards, parse_range};
use crate::rng::seeded_rng;
use crate::sim::evaluate_seven;

/// villain サンプリングのリトライ上限。
/// hero とカード衝突しない combo を引くまで試行する。
const VILLAIN_SAMPLE_RETRIES: u32 = 20;

/// コンボ別の集計バッファ。
/// (得点合計, 試行回数, 代表 Card ペア) を保持する。
type ComboStats = HashMap<(u8, u8), (f64, u32, (Card, Card))>;

pub fn run(
    hero_range: &str,
    villain_range: &str,
    board: &str,
    trials: u32,
    seed: u64,
) -> Result<RangeVsRangePayload, String> {
    let hero_combos = parse_range(hero_range)?;
    let villain_combos = parse_range(villain_range)?;
    let board_cards = parse_cards(board)?;

    if hero_combos.is_empty() || villain_combos.is_empty() {
        return Ok(empty_payload());
    }

    // ボードと衝突するコンボは最初に弾いておく。
    let board_set: HashSet<Card> = board_cards.iter().copied().collect();
    let hero_combos = filter_non_conflicting(hero_combos, &board_set);
    let villain_combos = filter_non_conflicting(villain_combos, &board_set);
    if hero_combos.is_empty() || villain_combos.is_empty() {
        return Ok(empty_payload());
    }

    let mut rng = seeded_rng(seed);
    let community_to_deal = 5usize.saturating_sub(board_cards.len());

    let mut hero_stats: ComboStats = HashMap::new();
    let mut villain_stats: ComboStats = HashMap::new();

    for _ in 0..trials {
        let Some(sample) = sample_match(
            &hero_combos,
            &villain_combos,
            &board_cards,
            community_to_deal,
            &mut rng,
        ) else {
            continue;
        };

        accumulate(&mut hero_stats, sample.hero_combo, sample.hero_score);
        accumulate(&mut villain_stats, sample.villain_combo, sample.villain_score);
    }

    let mut payload = RangeVsRangePayload {
        hero: collect_entries(hero_stats),
        villain: collect_entries(villain_stats),
    };

    sort_desc(&mut payload.hero);
    sort_desc(&mut payload.villain);

    Ok(payload)
}

#[inline]
fn empty_payload() -> RangeVsRangePayload {
    RangeVsRangePayload {
        hero: Vec::new(),
        villain: Vec::new(),
    }
}

fn filter_non_conflicting(
    combos: Vec<(Card, Card)>,
    board_set: &HashSet<Card>,
) -> Vec<(Card, Card)> {
    combos
        .into_iter()
        .filter(|(a, b)| !board_set.contains(a) && !board_set.contains(b))
        .collect()
}

/// 1 試行ぶんのサンプル結果。
struct TrialSample {
    hero_combo: (Card, Card),
    villain_combo: (Card, Card),
    hero_score: f64,
    villain_score: f64,
}

/// hero/villain/board のサンプリング → 評価まで。
/// hero と villain のカード衝突や、ボード残り枚数不足のときは `None` を返す。
fn sample_match(
    hero_combos: &[(Card, Card)],
    villain_combos: &[(Card, Card)],
    board: &[Card],
    community_to_deal: usize,
    rng: &mut impl rand::Rng,
) -> Option<TrialSample> {
    let hero = *hero_combos.choose(rng)?;
    let villain = pick_villain_without_conflict(villain_combos, hero, rng)?;

    let used = [hero.0, hero.1, villain.0, villain.1];
    let mut all_used: Vec<Card> = board.to_vec();
    all_used.extend_from_slice(&used);
    let deck = deck_minus(&all_used);

    let extras: Vec<Card> = deck.choose_multiple(rng, community_to_deal).copied().collect();
    if extras.len() != community_to_deal {
        return None;
    }

    let mut full_board: Vec<Card> = Vec::with_capacity(5);
    full_board.extend_from_slice(board);
    full_board.extend_from_slice(&extras);

    let hero_rank = evaluate_seven(&full_board, hero.0, hero.1);
    let villain_rank = evaluate_seven(&full_board, villain.0, villain.1);

    let (hero_score, villain_score) = match hero_rank.cmp(&villain_rank) {
        Ordering::Greater => (1.0, 0.0),
        Ordering::Less => (0.0, 1.0),
        Ordering::Equal => (0.5, 0.5),
    };

    Some(TrialSample {
        hero_combo: hero,
        villain_combo: villain,
        hero_score,
        villain_score,
    })
}

/// hero とカード衝突しない villain コンボを引く。一定回数失敗したら諦める。
fn pick_villain_without_conflict(
    villain_combos: &[(Card, Card)],
    hero: (Card, Card),
    rng: &mut impl rand::Rng,
) -> Option<(Card, Card)> {
    for _ in 0..VILLAIN_SAMPLE_RETRIES {
        let v = *villain_combos.choose(rng)?;
        if v.0 != hero.0 && v.0 != hero.1 && v.1 != hero.0 && v.1 != hero.1 {
            return Some(v);
        }
    }
    None
}

fn accumulate(stats: &mut ComboStats, combo: (Card, Card), score: f64) {
    let key = combo_key(combo.0, combo.1);
    let entry = stats.entry(key).or_insert((0.0, 0, combo));
    entry.0 += score;
    entry.1 += 1;
}

fn collect_entries(stats: ComboStats) -> Vec<RangeEquityEntry> {
    stats
        .into_values()
        .map(|(wins, plays, (a, b))| RangeEquityEntry {
            hand: pair_string(a, b),
            equity: if plays == 0 {
                0.0
            } else {
                wins / plays as f64
            },
        })
        .collect()
}

fn sort_desc(entries: &mut [RangeEquityEntry]) {
    entries.sort_by(|a, b| b.equity.partial_cmp(&a.equity).unwrap_or(Ordering::Equal));
}
