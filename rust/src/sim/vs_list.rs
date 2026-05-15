//! hero 1 ハンド対「想定相手ハンドのリスト」のヘッズアップ MC シミュレーション。
//!
//! 各相手ごとに独立して `trials` 回ボードを走らせ、勝敗と
//! 「hero がどんな役で勝ったか / 負けたか」を集計する。

use std::cmp::Ordering;
use std::collections::HashSet;

use rand::seq::IndexedRandom;
use rs_poker::core::Card;

use crate::cards::{deck_minus, pair_string};
use crate::dto::{CombinedEntry, CombinedPayload};
use crate::parser::{parse_cards, parse_hands_list, parse_two_cards};
use crate::rank::{RankBuckets, rank_index};
use crate::rng::seeded_rng;
use crate::sim::evaluate_seven;

pub fn run(
    hero: &str,
    board: &str,
    compare: &str,
    trials: u32,
    seed: u64,
) -> Result<CombinedPayload, String> {
    let hero_pair = parse_two_cards(hero)?;
    let board_cards = parse_cards(board)?;
    let opponents = parse_hands_list(compare)?;
    if opponents.is_empty() {
        return Err("No compare hands provided".into());
    }

    // ボードがまだ完成していない場合、足りないカード枚数。
    let community_to_deal = 5usize.saturating_sub(board_cards.len());

    // hero 集計用バケット（全相手分の合算）。
    let mut hero_buckets = RankBuckets::default();
    let mut hero_plays = 0u32;
    let mut hero_wins = 0u32;
    let mut hero_ties = 0u32;

    let mut entries: Vec<CombinedEntry> = Vec::with_capacity(opponents.len());
    let mut rng = seeded_rng(seed);

    for &(va, vb) in &opponents {
        if let Some(entry) = simulate_against_opponent(
            hero_pair,
            (va, vb),
            &board_cards,
            community_to_deal,
            trials,
            &mut rng,
            &mut hero_buckets,
            &mut hero_plays,
            &mut hero_wins,
            &mut hero_ties,
        ) {
            entries.push(entry);
        }
    }

    sort_by_equity_desc(&mut entries);

    // hero の集計エントリは末尾に追加（v1 互換）。
    entries.push(CombinedEntry {
        hand: pair_string(hero_pair.0, hero_pair.1),
        count: hero_plays,
        win: hero_wins,
        tie: hero_ties,
        lose: hero_plays
            .saturating_sub(hero_wins)
            .saturating_sub(hero_ties),
        results: (&hero_buckets).into(),
    });

    let equity = if hero_plays == 0 {
        0.0
    } else {
        (hero_wins as f64 + hero_ties as f64 * 0.5) / hero_plays as f64
    };

    Ok(CombinedPayload {
        hand: pair_string(hero_pair.0, hero_pair.1),
        equity,
        data: entries,
    })
}

/// 1 人の相手に対する MC ループ。hero 集計用の参照も受け取って加算する。
#[allow(clippy::too_many_arguments)]
fn simulate_against_opponent(
    hero: (Card, Card),
    opp: (Card, Card),
    board: &[Card],
    community_to_deal: usize,
    trials: u32,
    rng: &mut impl rand::Rng,
    hero_buckets: &mut RankBuckets,
    hero_plays: &mut u32,
    hero_wins: &mut u32,
    hero_ties: &mut u32,
) -> Option<CombinedEntry> {
    // hero / board / opp で重複があれば、その相手はスキップしてゼロ件で返す。
    let mut used: Vec<Card> = Vec::with_capacity(2 + board.len() + 2);
    used.push(hero.0);
    used.push(hero.1);
    used.extend_from_slice(board);
    used.push(opp.0);
    used.push(opp.1);
    let unique: HashSet<&Card> = used.iter().collect();
    if unique.len() != used.len() {
        return Some(CombinedEntry {
            hand: pair_string(opp.0, opp.1),
            count: 0,
            win: 0,
            tie: 0,
            lose: 0,
            results: (&RankBuckets::default()).into(),
        });
    }

    let deck = deck_minus(&used);
    let mut buckets = RankBuckets::default();
    let mut wins = 0u32;
    let mut ties = 0u32;
    let mut plays = 0u32;

    for _ in 0..trials {
        let extras: Vec<Card> = deck
            .choose_multiple(rng, community_to_deal)
            .copied()
            .collect();
        if extras.len() != community_to_deal {
            // 何らかの理由でサンプリングが失敗した場合は中断。
            break;
        }
        let mut full_board: Vec<Card> = Vec::with_capacity(5);
        full_board.extend_from_slice(board);
        full_board.extend_from_slice(&extras);

        let hero_rank = evaluate_seven(&full_board, hero.0, hero.1);
        let opp_rank = evaluate_seven(&full_board, opp.0, opp.1);
        let hero_idx = rank_index(&hero_rank);

        plays += 1;
        match hero_rank.cmp(&opp_rank) {
            Ordering::Greater => {
                wins += 1;
                buckets.win[hero_idx] += 1;
                hero_buckets.win[hero_idx] += 1;
            }
            Ordering::Equal => {
                ties += 1;
                buckets.tie[hero_idx] += 1;
                hero_buckets.tie[hero_idx] += 1;
            }
            Ordering::Less => {
                buckets.lose[hero_idx] += 1;
                hero_buckets.lose[hero_idx] += 1;
            }
        }
    }

    let opp_wins = plays.saturating_sub(wins).saturating_sub(ties);
    *hero_plays += plays;
    *hero_wins += wins;
    *hero_ties += ties;

    Some(CombinedEntry {
        hand: pair_string(opp.0, opp.1),
        count: plays,
        win: opp_wins,
        tie: ties,
        // 相手目線の lose = hero の win 数。
        lose: wins,
        results: (&buckets).into(),
    })
}

/// equity (= (win + tie / 2) / count) の降順に並べる。
fn sort_by_equity_desc(entries: &mut [CombinedEntry]) {
    entries.sort_by(|a, b| {
        let ea = equity_of(a);
        let eb = equity_of(b);
        eb.partial_cmp(&ea).unwrap_or(Ordering::Equal)
    });
}

#[inline]
fn equity_of(e: &CombinedEntry) -> f64 {
    if e.count == 0 {
        0.0
    } else {
        (e.win as f64 + e.tie as f64 * 0.5) / e.count as f64
    }
}
