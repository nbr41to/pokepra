//! `rs_poker` を使った実験コードを WASM 化せずに直接呼び出すための crate。
//!
//! アプリに組み込む前のポーカー機能を、カード操作・役評価・シミュレーションの責務に分けて検証する。

/// カードの parse・deck 生成・表示整形を担当するモジュール。
pub mod cards;
/// `rs_poker` の rank 評価 API を使いやすい関数にまとめるモジュール。
pub mod evaluation;
/// ヘッズアップ実験の実行・CFR 戦略・結果 DTO を担当するモジュール。
pub mod simulation;

pub use simulation::{
    simulate_heads_up_cfr, simulate_heads_up_example, HeadsUpHandResult, HeadsUpSimulationResult,
};
