use little_sorry::{PcfrPlusRegretMatcher, RegretMinimizer};
use rand::Rng;
use rs_poker::arena::action::AgentAction;
use rs_poker::arena::cfr::{
    ActionIndexMapper, ActionIndexMapperConfig, ActionPicker, NUM_ACTION_INDICES,
};
use rs_poker::arena::GameStateBuilder;
use rs_poker::core::Card;

use crate::cards::deck_without;
use crate::evaluation::evaluate_seven;

/// CFR 戦略が選んだプリフロップアクションを表す責務を持つ。
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum CfrPreflopAction {
    Fold,
    AllIn,
}

/// CFR によるアクション選択の根拠を保持する責務を持つ。
///
/// アプリで後から表示・検証できるよう、選択アクションだけでなく、
/// all-in した場合の推定 equity と EV も残す。
#[derive(Debug, Clone, Copy, PartialEq)]
pub(crate) struct CfrPreflopDecision {
    pub action: CfrPreflopAction,
    pub estimated_all_in_equity: f32,
    pub fold_ev_bb: f32,
    pub all_in_ev_bb: f32,
}

/// Player 1 が fold / all-in のどちらを選ぶかを CFR regret matching で決める責務を持つ。
///
/// 注意: ここで扱うのは本格的な NLHE 全体の Nash 均衡ではなく、
/// 「Player 2 が 100BB all-in しており、Player 1 は fold か call all-in のみ選べる」
/// という実験用の小さなゲームに対する CFR 近似戦略。
/// `rs_poker::arena::cfr::ActionPicker` を使って、学習した regret matcher の最良アクションを選ぶ。
pub(crate) fn decide_preflop_action_with_cfr<R: Rng>(
    player_1_cards: (Card, Card),
    player_2_cards: (Card, Card),
    stack_bb: i32,
    fold_cost_bb: i32,
    equity_samples: usize,
    rng: &mut R,
) -> CfrPreflopDecision {
    let equity = estimate_all_in_equity(player_1_cards, player_2_cards, equity_samples, rng);
    let fold_ev_bb = -(fold_cost_bb as f32);
    let all_in_ev_bb = all_in_ev_bb(equity, stack_bb);

    let game_state = GameStateBuilder::new()
        .num_players_with_stack(2, stack_bb as f32)
        .blinds(1.0, 0.5)
        .build()
        .expect("valid heads-up game state should build");
    let mapper = ActionIndexMapper::new(ActionIndexMapperConfig::new(1.0, stack_bb as f32));
    let actions = [AgentAction::Fold, AgentAction::AllIn];
    let matcher = train_fold_all_in_matcher(&mapper, &game_state, fold_ev_bb, all_in_ev_bb);
    let picker = ActionPicker::new(&mapper, &actions, Some(&matcher), &game_state);

    let action = match picker.pick_best_action() {
        AgentAction::Fold => CfrPreflopAction::Fold,
        AgentAction::AllIn => CfrPreflopAction::AllIn,
        _ => unreachable!("only fold and all-in actions are supplied"),
    };

    CfrPreflopDecision {
        action,
        estimated_all_in_equity: equity,
        fold_ev_bb,
        all_in_ev_bb,
    }
}

/// fold / all-in の EV を CFR の regret matcher に学習させる責務を持つ。
///
/// CFR の action picker は各 action index の重みに従って選択するため、
/// EV が高いアクションほど regret が蓄積するように報酬ベクトルを更新する。
fn train_fold_all_in_matcher(
    mapper: &ActionIndexMapper,
    game_state: &rs_poker::arena::GameState,
    fold_ev_bb: f32,
    all_in_ev_bb: f32,
) -> PcfrPlusRegretMatcher {
    let mut matcher = PcfrPlusRegretMatcher::new(NUM_ACTION_INDICES);
    let mut rewards = vec![0.0f32; NUM_ACTION_INDICES];
    let min_ev = fold_ev_bb.min(all_in_ev_bb);

    rewards[mapper.action_to_idx(&AgentAction::Fold, game_state)] = fold_ev_bb - min_ev;
    rewards[mapper.action_to_idx(&AgentAction::AllIn, game_state)] = all_in_ev_bb - min_ev;

    for _ in 0..32 {
        matcher.update_regret(&rewards);
    }

    matcher
}

/// 指定ハンド同士が all-in した場合の Player 1 equity を Monte Carlo で推定する責務を持つ。
///
/// 既知の 4 枚のホールカードを除外したデッキからボード 5 枚を配り、
/// 勝ちは 1.0、チョップは 0.5、負けは 0.0 として平均する。
fn estimate_all_in_equity<R: Rng>(
    player_1_cards: (Card, Card),
    player_2_cards: (Card, Card),
    samples: usize,
    rng: &mut R,
) -> f32 {
    if samples == 0 {
        return 0.0;
    }

    let used_cards = [
        player_1_cards.0,
        player_1_cards.1,
        player_2_cards.0,
        player_2_cards.1,
    ];
    let mut score = 0.0f32;

    for _ in 0..samples {
        let mut deck = deck_without(&used_cards);
        let board: Vec<Card> = (0..5)
            .map(|_| {
                deck.deal(rng)
                    .expect("deck should have enough cards for equity board")
            })
            .collect();
        let player_1_rank = evaluate_seven(&board, player_1_cards.0, player_1_cards.1);
        let player_2_rank = evaluate_seven(&board, player_2_cards.0, player_2_cards.1);

        score += match player_1_rank.cmp(&player_2_rank) {
            std::cmp::Ordering::Greater => 1.0,
            std::cmp::Ordering::Equal => 0.5,
            std::cmp::Ordering::Less => 0.0,
        };
    }

    score / samples as f32
}

/// all-in した場合の BB 単位 EV を計算する責務を持つ。
///
/// 勝てば相手の 100BB を獲得、負ければ自分の 100BB を失う単純モデルなので、
/// `equity * stack - (1 - equity) * stack` で期待損益を出す。
fn all_in_ev_bb(equity: f32, stack_bb: i32) -> f32 {
    let stack = stack_bb as f32;
    equity * stack - (1.0 - equity) * stack
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cards::parse_two_cards;
    use rand::SeedableRng;
    use rand_chacha::ChaCha8Rng;

    #[test]
    fn all_in_ev_bb_is_positive_above_half_equity() {
        assert!((all_in_ev_bb(0.60, 100) - 20.0).abs() < 0.001);
    }

    #[test]
    fn estimate_all_in_equity_returns_value_between_zero_and_one() {
        let player_1 = parse_two_cards("AhKh");
        let player_2 = parse_two_cards("QsQd");
        let mut rng = ChaCha8Rng::seed_from_u64(1);

        let equity = estimate_all_in_equity(player_1, player_2, 32, &mut rng);

        assert!((0.0..=1.0).contains(&equity));
    }

    #[test]
    fn decide_preflop_action_with_cfr_folds_very_weak_hand_against_aces() {
        let player_1 = parse_two_cards("2c7d");
        let player_2 = parse_two_cards("AsAh");
        let mut rng = ChaCha8Rng::seed_from_u64(1);

        let decision = decide_preflop_action_with_cfr(player_1, player_2, 100, 1, 128, &mut rng);

        assert_eq!(decision.action, CfrPreflopAction::Fold);
    }

    #[test]
    fn decide_preflop_action_with_cfr_calls_with_aces_against_weak_hand() {
        let player_1 = parse_two_cards("AsAh");
        let player_2 = parse_two_cards("2c7d");
        let mut rng = ChaCha8Rng::seed_from_u64(1);

        let decision = decide_preflop_action_with_cfr(player_1, player_2, 100, 1, 128, &mut rng);

        assert_eq!(decision.action, CfrPreflopAction::AllIn);
    }
}
