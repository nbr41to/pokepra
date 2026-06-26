use std::cmp::Ordering;
use std::collections::HashSet;

use rand::SeedableRng;
use rand_chacha::ChaCha8Rng;
use rs_poker::core::Card;

use crate::cards::{deal_two_player_hole_cards, deck_without, format_card, format_hand};
use crate::evaluation::evaluate_seven;

use super::cfr_strategy::{decide_preflop_action_with_cfr, CfrPreflopAction};
use super::result::{HeadsUpHandResult, HeadsUpSimulationResult};

const INITIAL_STACK_BB: i32 = 100;
const TRIALS: usize = 100;
const SEED: u64 = 20260624;
const FOLD_COST_BB: i32 = 1;
const CFR_EQUITY_SAMPLES: usize = 96;

/// アプリに組み込む前の実験用サンプル設定を実行する責務を持つ。
///
/// 100 回すべて異なるランダムなホールカードを配り、Player 2 は毎回 100BB all-in、
/// Player 1 は CFR の fold/all-in 戦略でアクションを選ぶ。
pub fn simulate_heads_up_example() -> HeadsUpSimulationResult {
    simulate_heads_up_cfr(TRIALS, SEED)
}

/// 100BB ヘッズアップを複数回シミュレーションする責務を持つ。
///
/// 各試行では新しいホールカードを配り、同じ 2 人分の配牌組み合わせが再利用されないようにする。
/// Player 1 は簡略化した CFR 戦略で `Fold` または `AllIn` を選び、Player 2 は常に all-in する。
pub fn simulate_heads_up_cfr(trials: usize, seed: u64) -> HeadsUpSimulationResult {
    let mut rng = ChaCha8Rng::seed_from_u64(seed);
    let mut seen_matchups = HashSet::with_capacity(trials);
    let mut hands = Vec::with_capacity(trials);

    let mut player_1_wins = 0;
    let mut player_2_wins = 0;
    let mut ties = 0;
    let mut player_1_folds = 0;
    let mut player_1_all_ins = 0;
    let mut player_1_total_profit_bb = 0;
    let mut player_2_total_profit_bb = 0;

    for hand_number in 1..=trials {
        let (player_1_cards, player_2_cards) = deal_unique_hole_cards(&mut rng, &mut seen_matchups);
        let decision = decide_preflop_action_with_cfr(
            player_1_cards,
            player_2_cards,
            INITIAL_STACK_BB,
            FOLD_COST_BB,
            CFR_EQUITY_SAMPLES,
            &mut rng,
        );

        let hand_result = match decision.action {
            CfrPreflopAction::Fold => {
                player_1_folds += 1;
                player_2_wins += 1;
                player_1_total_profit_bb -= FOLD_COST_BB;
                player_2_total_profit_bb += FOLD_COST_BB;

                HeadsUpHandResult {
                    hand_number,
                    player_1_hand: format_hand(player_1_cards),
                    player_2_hand: format_hand(player_2_cards),
                    player_1_action: "Fold".to_string(),
                    outcome: "Player 1 folded".to_string(),
                    board: None,
                    estimated_all_in_equity: decision.estimated_all_in_equity,
                    all_in_ev_bb: decision.all_in_ev_bb,
                    player_1_profit_bb: -FOLD_COST_BB,
                    player_2_profit_bb: FOLD_COST_BB,
                }
            }
            CfrPreflopAction::AllIn => {
                player_1_all_ins += 1;
                let board = deal_board(player_1_cards, player_2_cards, &mut rng);
                let player_1_rank = evaluate_seven(&board, player_1_cards.0, player_1_cards.1);
                let player_2_rank = evaluate_seven(&board, player_2_cards.0, player_2_cards.1);

                let (outcome, player_1_profit_bb, player_2_profit_bb) =
                    match player_1_rank.cmp(&player_2_rank) {
                        Ordering::Greater => {
                            player_1_wins += 1;
                            (
                                "Player 1 won all-in".to_string(),
                                INITIAL_STACK_BB,
                                -INITIAL_STACK_BB,
                            )
                        }
                        Ordering::Less => {
                            player_2_wins += 1;
                            (
                                "Player 2 won all-in".to_string(),
                                -INITIAL_STACK_BB,
                                INITIAL_STACK_BB,
                            )
                        }
                        Ordering::Equal => {
                            ties += 1;
                            ("Split pot".to_string(), 0, 0)
                        }
                    };

                player_1_total_profit_bb += player_1_profit_bb;
                player_2_total_profit_bb += player_2_profit_bb;

                HeadsUpHandResult {
                    hand_number,
                    player_1_hand: format_hand(player_1_cards),
                    player_2_hand: format_hand(player_2_cards),
                    player_1_action: "AllIn".to_string(),
                    outcome,
                    board: Some(format_board(&board)),
                    estimated_all_in_equity: decision.estimated_all_in_equity,
                    all_in_ev_bb: decision.all_in_ev_bb,
                    player_1_profit_bb,
                    player_2_profit_bb,
                }
            }
        };

        hands.push(hand_result);
    }

    HeadsUpSimulationResult {
        trials,
        player_1_strategy: "CFR fold/all-in response to Player 2 100BB shove".to_string(),
        player_1_wins,
        player_2_wins,
        ties,
        player_1_folds,
        player_1_all_ins,
        player_1_total_profit_bb,
        player_2_total_profit_bb,
        player_1_average_stack_after_hand_bb: average_stack_after_hand(
            INITIAL_STACK_BB,
            player_1_total_profit_bb,
            trials,
        ),
        player_2_average_stack_after_hand_bb: average_stack_after_hand(
            INITIAL_STACK_BB,
            player_2_total_profit_bb,
            trials,
        ),
        hands,
    }
}

/// 2 人分のホールカードを、過去ハンドと重複しない組み合わせとして配る責務を持つ。
///
/// 「100 回毎回異なるハンド」を保証するため、Player 1 / Player 2 の表示文字列をキーにして、
/// 同じ組み合わせが出た場合は配り直す。
fn deal_unique_hole_cards(
    rng: &mut ChaCha8Rng,
    seen_matchups: &mut HashSet<String>,
) -> ((Card, Card), (Card, Card)) {
    loop {
        let (player_1_cards, player_2_cards) = deal_two_player_hole_cards(rng);
        let key = format!(
            "{}|{}",
            format_hand(player_1_cards),
            format_hand(player_2_cards)
        );

        if seen_matchups.insert(key) {
            return (player_1_cards, player_2_cards);
        }
    }
}

/// 2 人のホールカードを除いたデッキから、ボード 5 枚を配る責務を持つ。
///
/// `Deck::deal` は deal したカードをデッキから取り除くため、同一ボード内でカードは重複しない。
fn deal_board(
    player_1_cards: (Card, Card),
    player_2_cards: (Card, Card),
    rng: &mut ChaCha8Rng,
) -> Vec<Card> {
    let used_cards = [
        player_1_cards.0,
        player_1_cards.1,
        player_2_cards.0,
        player_2_cards.1,
    ];
    let mut deck = deck_without(&used_cards);

    (0..5)
        .map(|_| {
            deck.deal(rng)
                .expect("deck should have enough cards for board")
        })
        .collect()
}

/// ボードカード一覧を表示用文字列へ変換する責務を持つ。
fn format_board(board: &[Card]) -> String {
    board
        .iter()
        .map(|card| format_card(*card))
        .collect::<Vec<_>>()
        .join(" ")
}

/// 合計損益から 1 ハンドあたりの平均終了スタックを計算する責務を持つ。
///
/// 試行回数が 0 の場合は、ハンドが行われていないため初期スタックをそのまま返す。
fn average_stack_after_hand(initial_stack_bb: i32, total_profit_bb: i32, trials: usize) -> f64 {
    if trials == 0 {
        return initial_stack_bb as f64;
    }

    initial_stack_bb as f64 + total_profit_bb as f64 / trials as f64
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cards::parse_two_cards;
    use std::collections::HashSet;

    #[test]
    fn simulate_heads_up_example_runs_one_hundred_unique_random_matchups() {
        let result = simulate_heads_up_example();
        let unique_matchups: HashSet<String> = result
            .hands
            .iter()
            .map(|hand| format!("{}|{}", hand.player_1_hand, hand.player_2_hand))
            .collect();

        assert_eq!(result.trials, 100);
        assert_eq!(result.hands.len(), 100);
        assert_eq!(unique_matchups.len(), 100);
        assert_eq!(
            result.player_1_wins + result.player_2_wins + result.ties,
            100
        );
        assert_eq!(result.player_1_folds + result.player_1_all_ins, 100);
        assert_eq!(
            result.player_1_total_profit_bb + result.player_2_total_profit_bb,
            0
        );
    }

    #[test]
    fn simulate_heads_up_cfr_is_reproducible_with_same_seed() {
        let first = simulate_heads_up_cfr(10, 42);
        let second = simulate_heads_up_cfr(10, 42);

        assert_eq!(first, second);
    }

    #[test]
    fn simulate_heads_up_cfr_returns_initial_average_stack_when_trials_is_zero() {
        let result = simulate_heads_up_cfr(0, 42);

        assert_eq!(result.trials, 0);
        assert_eq!(result.player_1_wins, 0);
        assert_eq!(result.player_2_wins, 0);
        assert_eq!(result.ties, 0);
        assert_eq!(result.player_1_average_stack_after_hand_bb, 100.0);
        assert_eq!(result.player_2_average_stack_after_hand_bb, 100.0);
        assert!(result.hands.is_empty());
    }

    #[test]
    fn deal_unique_hole_cards_never_returns_seen_matchup() {
        let mut rng = ChaCha8Rng::seed_from_u64(1);
        let mut seen = HashSet::new();
        let first = deal_unique_hole_cards(&mut rng, &mut seen);
        let first_key = format!("{}|{}", format_hand(first.0), format_hand(first.1));

        assert!(seen.contains(&first_key));

        let second = deal_unique_hole_cards(&mut rng, &mut seen);
        let second_key = format!("{}|{}", format_hand(second.0), format_hand(second.1));

        assert_ne!(first_key, second_key);
    }

    #[test]
    fn deal_board_deals_five_unique_cards_excluding_hole_cards() {
        let player_1 = parse_two_cards("AhKh");
        let player_2 = parse_two_cards("QsQd");
        let mut rng = ChaCha8Rng::seed_from_u64(1);

        let board = deal_board(player_1, player_2, &mut rng);
        let unique_cards: HashSet<Card> = board.iter().copied().collect();

        assert_eq!(board.len(), 5);
        assert_eq!(unique_cards.len(), 5);
        assert!(!board.contains(&player_1.0));
        assert!(!board.contains(&player_1.1));
        assert!(!board.contains(&player_2.0));
        assert!(!board.contains(&player_2.1));
    }

    #[test]
    fn average_stack_after_hand_adds_average_profit_to_initial_stack() {
        let average = average_stack_after_hand(100, -1200, 100);

        assert_eq!(average, 88.0);
    }
}
