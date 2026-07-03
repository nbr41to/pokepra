/// 1 ハンドごとのシミュレーション結果を保持する責務を持つ DTO。
///
/// 100 回の各ハンドで、配られたカード・CFR が選んだアクション・損益を後から確認できるようにする。
#[derive(Debug, Clone, PartialEq)]
pub struct HeadsUpHandResult {
    pub hand_number: usize,
    pub player_1_hand: String,
    pub player_2_hand: String,
    pub player_1_action: String,
    pub outcome: String,
    pub board: Option<String>,
    pub estimated_all_in_equity: f32,
    pub all_in_ev_bb: f32,
    pub player_1_profit_bb: i32,
    pub player_2_profit_bb: i32,
}

/// ヘッズアップシミュレーションの集計結果を保持する責務を持つ DTO。
///
/// アプリ側で表示・検証しやすいように、勝敗数だけでなく fold 数、all-in 数、
/// BB 単位の損益、1 ハンドあたりの平均終了スタック、各ハンドの詳細も保持する。
#[derive(Debug, Clone, PartialEq)]
pub struct HeadsUpSimulationResult {
    pub trials: usize,
    pub player_1_strategy: String,
    pub player_1_wins: usize,
    pub player_2_wins: usize,
    pub ties: usize,
    pub player_1_folds: usize,
    pub player_1_all_ins: usize,
    pub player_1_total_profit_bb: i32,
    pub player_2_total_profit_bb: i32,
    pub player_1_average_stack_after_hand_bb: f64,
    pub player_2_average_stack_after_hand_bb: f64,
    pub hands: Vec<HeadsUpHandResult>,
}

impl std::fmt::Display for HeadsUpSimulationResult {
    /// CLI で実験結果を確認しやすい複数行テキストへ変換する責務を持つ。
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "Heads-up CFR simulation")?;
        writeln!(f, "trials: {}", self.trials)?;
        writeln!(f, "player 1 strategy: {}", self.player_1_strategy)?;
        writeln!(f, "player 1 wins: {}", self.player_1_wins)?;
        writeln!(f, "player 2 wins: {}", self.player_2_wins)?;
        writeln!(f, "ties: {}", self.ties)?;
        writeln!(f, "player 1 folds: {}", self.player_1_folds)?;
        writeln!(f, "player 1 all-ins: {}", self.player_1_all_ins)?;
        writeln!(
            f,
            "player 1 total profit: {}BB",
            self.player_1_total_profit_bb
        )?;
        writeln!(
            f,
            "player 2 total profit: {}BB",
            self.player_2_total_profit_bb
        )?;
        writeln!(
            f,
            "player 1 average stack after hand: {:.1}BB",
            self.player_1_average_stack_after_hand_bb
        )?;
        writeln!(
            f,
            "player 2 average stack after hand: {:.1}BB",
            self.player_2_average_stack_after_hand_bb
        )?;
        writeln!(f, "hands:")?;

        for hand in &self.hands {
            let board = hand.board.as_deref().unwrap_or("-");
            writeln!(
                f,
                "  #{:03}: P1 {} vs P2 {} | action={} | outcome={} | board={} | equity={:.3} | all-in EV={:.1}BB | P1 profit={}BB",
                hand.hand_number,
                hand.player_1_hand,
                hand.player_2_hand,
                hand.player_1_action,
                hand.outcome,
                board,
                hand.estimated_all_in_equity,
                hand.all_in_ev_bb,
                hand.player_1_profit_bb
            )?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn display_outputs_human_readable_summary_and_hands() {
        let result = HeadsUpSimulationResult {
            trials: 1,
            player_1_strategy: "CFR fold/all-in".to_string(),
            player_1_wins: 0,
            player_2_wins: 1,
            ties: 0,
            player_1_folds: 1,
            player_1_all_ins: 0,
            player_1_total_profit_bb: -1,
            player_2_total_profit_bb: 1,
            player_1_average_stack_after_hand_bb: 99.0,
            player_2_average_stack_after_hand_bb: 101.0,
            hands: vec![HeadsUpHandResult {
                hand_number: 1,
                player_1_hand: "2c 7d".to_string(),
                player_2_hand: "As Ah".to_string(),
                player_1_action: "Fold".to_string(),
                outcome: "Player 1 folded".to_string(),
                board: None,
                estimated_all_in_equity: 0.12,
                all_in_ev_bb: -76.0,
                player_1_profit_bb: -1,
                player_2_profit_bb: 1,
            }],
        };

        let output = result.to_string();

        assert!(output.contains("Heads-up CFR simulation"));
        assert!(output.contains("player 1 folds: 1"));
        assert!(output.contains("#001: P1 2c 7d vs P2 As Ah"));
    }
}
