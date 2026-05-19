//! hero レンジ vs villain レンジの MC シミュレーション。
//!
//! v1 互換のアルゴリズム: hero × villain の「全コンボペア」を列挙し、
//! 衝突しないペアごとに `trials` 回の独立したボード完成を行って勝敗を集計する。
//!
//! 1 コンボあたりのサンプル数は `n_villain × trials`（hero 側）/
//! `n_hero × trials`（villain 側）になるため、`trials` が小さくても
//! per-combo equity は十分に滑らかになる。
//!
//! 注意: 計算量は `n_hero × n_villain × trials × 2`（rank 評価回数）。
//! レンジが極端に大きい場合（数百コンボずつ × trials=1000 など）は重くなる。

use std::cmp::Ordering;

use rand::seq::IndexedRandom;
use rs_poker::core::Card;

use crate::cards::{deck_minus, pair_string};
use crate::dto::{RangeEquityEntry, RangeVsRangePayload};
use crate::parser::{parse_cards, parse_range};
use crate::rng::seeded_rng;
use crate::sim::evaluate_seven;

/// コンボ別の (wins, ties, plays) 集計。wins/ties は累積カウンタ。
#[derive(Default, Clone, Copy)]
struct ComboStats {
    wins: u64,
    ties: u64,
    plays: u64,
}

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
    if board_cards.len() > 5 {
        return Err("board must be <=5 cards".into());
    }
    if hero_combos.is_empty() || villain_combos.is_empty() {
        return Ok(empty_payload());
    }

    // ボードと衝突するコンボは事前に弾く。
    let hero_combos = filter_board_overlap(hero_combos, &board_cards);
    let villain_combos = filter_board_overlap(villain_combos, &board_cards);
    if hero_combos.is_empty() || villain_combos.is_empty() {
        return Ok(empty_payload());
    }

    let community_to_deal = 5usize.saturating_sub(board_cards.len());
    let trials = trials.max(1);

    let mut hero_stats = vec![ComboStats::default(); hero_combos.len()];
    let mut villain_stats = vec![ComboStats::default(); villain_combos.len()];

    let mut rng = seeded_rng(seed);

    // すべての (hero_combo × villain_combo) ペアを列挙。
    // hands_overlap は単純な 4 枚比較なので、ホットループでも問題ない速度。
    for (h_idx, &hero) in hero_combos.iter().enumerate() {
        for (v_idx, &villain) in villain_combos.iter().enumerate() {
            if hands_overlap(hero, villain) {
                continue;
            }

            // この (hero, villain) ペア用の残デッキ。ボード完成カードのみここから引く。
            let used = [hero.0, hero.1, villain.0, villain.1];
            let mut all_used: Vec<Card> = board_cards.clone();
            all_used.extend_from_slice(&used);
            let deck = deck_minus(&all_used);

            for _ in 0..trials {
                let extras: Vec<Card> = deck
                    .choose_multiple(&mut rng, community_to_deal)
                    .copied()
                    .collect();
                if extras.len() != community_to_deal {
                    break;
                }
                let mut full_board: Vec<Card> = Vec::with_capacity(5);
                full_board.extend_from_slice(&board_cards);
                full_board.extend_from_slice(&extras);

                let hero_rank = evaluate_seven(&full_board, hero.0, hero.1);
                let villain_rank = evaluate_seven(&full_board, villain.0, villain.1);

                hero_stats[h_idx].plays += 1;
                villain_stats[v_idx].plays += 1;
                match hero_rank.cmp(&villain_rank) {
                    Ordering::Greater => hero_stats[h_idx].wins += 1,
                    Ordering::Less => villain_stats[v_idx].wins += 1,
                    Ordering::Equal => {
                        hero_stats[h_idx].ties += 1;
                        villain_stats[v_idx].ties += 1;
                    }
                }
            }
        }
    }

    let mut payload = RangeVsRangePayload {
        hero: build_entries(&hero_combos, &hero_stats),
        villain: build_entries(&villain_combos, &villain_stats),
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

fn filter_board_overlap(combos: Vec<(Card, Card)>, board: &[Card]) -> Vec<(Card, Card)> {
    combos
        .into_iter()
        .filter(|(a, b)| !board.contains(a) && !board.contains(b))
        .collect()
}

#[inline]
fn hands_overlap(a: (Card, Card), b: (Card, Card)) -> bool {
    a.0 == b.0 || a.0 == b.1 || a.1 == b.0 || a.1 == b.1
}

fn build_entries(combos: &[(Card, Card)], stats: &[ComboStats]) -> Vec<RangeEquityEntry> {
    combos
        .iter()
        .zip(stats.iter())
        .map(|(&(a, b), s)| RangeEquityEntry {
            hand: pair_string(a, b),
            equity: if s.plays == 0 {
                0.0
            } else {
                (s.wins as f64 + s.ties as f64 * 0.5) / s.plays as f64
            },
        })
        .collect()
}

fn sort_desc(entries: &mut [RangeEquityEntry]) {
    entries.sort_by(|a, b| b.equity.partial_cmp(&a.equity).unwrap_or(Ordering::Equal));
}
