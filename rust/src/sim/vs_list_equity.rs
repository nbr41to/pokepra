//! hero 1 ハンド vs 相手ハンドリストのヘッズアップ MC。役分布は集計せず、
//! 各相手とのエクイティ（勝率）だけを返す軽量版。
//!
//! [`crate::sim::vs_list`] のサブセット。役カテゴリのバケット集計が不要な
//! 用途（単純な勝率一覧）で使う。

use std::cmp::Ordering;
use std::collections::HashSet;

use rand::seq::IndexedRandom;
use rs_poker::core::Card;

use crate::cards::{deck_minus, pair_string};
use crate::dto::{EquityEntry, EquityPayload};
use crate::parser::{parse_cards, parse_hands_list, parse_two_cards};
use crate::rng::seeded_rng;
use crate::sim::evaluate_seven;

pub fn run(
    hero: &str,
    board: &str,
    compare: &str,
    trials: u32,
    seed: u64,
    include_data: bool,
) -> Result<EquityPayload, String> {
    let hero_pair = parse_two_cards(hero)?;
    let board_cards = parse_cards(board)?;
    let opponents = parse_hands_list(compare)?;
    if opponents.is_empty() {
        return Err("No compare hands provided".into());
    }

    let community_to_deal = 5usize.saturating_sub(board_cards.len());
    let mut rng = seeded_rng(seed);

    let mut hero_plays = 0u32;
    let mut hero_wins = 0u32;
    let mut hero_ties = 0u32;
    let mut data: Vec<EquityEntry> = if include_data {
        Vec::with_capacity(opponents.len())
    } else {
        Vec::new()
    };

    for &(va, vb) in &opponents {
        let summary = run_against_opponent(
            hero_pair,
            (va, vb),
            &board_cards,
            community_to_deal,
            trials,
            &mut rng,
        );
        hero_plays += summary.plays;
        hero_wins += summary.hero_wins;
        hero_ties += summary.ties;

        if include_data {
            let opp_wins = summary
                .plays
                .saturating_sub(summary.hero_wins)
                .saturating_sub(summary.ties);
            let equity = if summary.plays == 0 {
                0.0
            } else {
                (opp_wins as f64 + summary.ties as f64 * 0.5) / summary.plays as f64
            };
            data.push(EquityEntry {
                hand: pair_string(va, vb),
                equity,
            });
        }
    }

    if include_data {
        data.sort_by(|a, b| b.equity.partial_cmp(&a.equity).unwrap_or(Ordering::Equal));
    }

    let equity = if hero_plays == 0 {
        0.0
    } else {
        (hero_wins as f64 + hero_ties as f64 * 0.5) / hero_plays as f64
    };

    Ok(EquityPayload {
        hand: pair_string(hero_pair.0, hero_pair.1),
        equity,
        data,
    })
}

/// 1 人の相手とのヘッズアップ MC 結果。
struct OpponentSummary {
    plays: u32,
    hero_wins: u32,
    ties: u32,
}

fn run_against_opponent(
    hero: (Card, Card),
    opp: (Card, Card),
    board: &[Card],
    community_to_deal: usize,
    trials: u32,
    rng: &mut impl rand::Rng,
) -> OpponentSummary {
    // hero / board / opp で重複があれば、何も走らせない。
    let mut used: Vec<Card> = Vec::with_capacity(2 + board.len() + 2);
    used.push(hero.0);
    used.push(hero.1);
    used.extend_from_slice(board);
    used.push(opp.0);
    used.push(opp.1);
    let unique: HashSet<&Card> = used.iter().collect();
    if unique.len() != used.len() {
        return OpponentSummary {
            plays: 0,
            hero_wins: 0,
            ties: 0,
        };
    }

    let deck = deck_minus(&used);
    let mut plays = 0u32;
    let mut hero_wins = 0u32;
    let mut ties = 0u32;

    for _ in 0..trials {
        let extras: Vec<Card> = deck
            .choose_multiple(rng, community_to_deal)
            .copied()
            .collect();
        if extras.len() != community_to_deal {
            break;
        }
        let mut full_board: Vec<Card> = Vec::with_capacity(5);
        full_board.extend_from_slice(board);
        full_board.extend_from_slice(&extras);

        let hero_rank = evaluate_seven(&full_board, hero.0, hero.1);
        let opp_rank = evaluate_seven(&full_board, opp.0, opp.1);

        plays += 1;
        match hero_rank.cmp(&opp_rank) {
            Ordering::Greater => hero_wins += 1,
            Ordering::Equal => ties += 1,
            Ordering::Less => {}
        }
    }

    OpponentSummary {
        plays,
        hero_wins,
        ties,
    }
}
