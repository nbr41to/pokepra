//! pokepra_wasm: rs_poker をバックエンドにしたポーカー処理の WASM バインディング。
//!
//! このファイルは JS から呼ばれるエクスポート関数の定義のみを担う。
//! 各関数は対応する `sim::*::run` を呼び、結果を `serde-wasm-bindgen` で
//! JS 値に変換するだけの薄いラッパ。
//!
//! ロジックは以下のモジュールへ分割している:
//!
//! - [`parser`]  : 入力文字列のパース
//! - [`cards`]   : Card 表示・デッキ生成
//! - [`rank`]    : `Rank` のカテゴリ/エンコード値抽出と集計バケット
//! - [`rng`]     : シード付き RNG
//! - [`dto`]     : JS 境界の Serialize 構造体
//! - [`sim`]     : 各シミュレーション本体

mod cards;
mod dto;
mod parser;
mod rank;
mod rng;
mod sim;

use serde::Serialize;
use wasm_bindgen::prelude::*;

/// Result を JsValue に変換する共通ヘルパ。
///
/// 成功時は serde で JS 値にシリアライズし、失敗時は文字列を JS の Error にする。
fn to_js<T: Serialize>(result: Result<T, String>) -> Result<JsValue, JsValue> {
    match result {
        Ok(v) => serde_wasm_bindgen::to_value(&v).map_err(|e| JsValue::from_str(&e.to_string())),
        Err(e) => Err(JsValue::from_str(&e)),
    }
}

/// クレートのバージョン文字列。動作確認用。
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// ボードが確定している前提で、複数ハンドの役を評価し強い順に並べる。
#[wasm_bindgen]
pub fn evaluate_hands_ranking(hands: &str, board: &str) -> Result<JsValue, JsValue> {
    to_js(sim::evaluate::run(hands, board))
}

/// hero 1 ハンド vs 相手ハンドリストのヘッズアップ MC シミュレーション。
#[wasm_bindgen]
pub fn simulate_vs_list_with_ranks(
    hero: &str,
    board: &str,
    compare: &str,
    trials: u32,
    seed: u64,
) -> Result<JsValue, JsValue> {
    to_js(sim::vs_list::run(hero, board, compare, trials, seed))
}

/// hero レンジ vs villain レンジの MC シミュレーション。
#[wasm_bindgen]
pub fn simulate_range_vs_range_equity(
    hero_range: &str,
    villain_range: &str,
    board: &str,
    trials: u32,
    seed: u64,
) -> Result<JsValue, JsValue> {
    to_js(sim::range_vs_range::run(
        hero_range,
        villain_range,
        board,
        trials,
        seed,
    ))
}

/// hero vs 相手リストの MC シミュレーション（役分布なし、equity のみ）。
#[wasm_bindgen]
pub fn simulate_vs_list_equity(
    hero: &str,
    board: &str,
    compare: &str,
    trials: u32,
    seed: u64,
    include_data: bool,
) -> Result<JsValue, JsValue> {
    to_js(sim::vs_list_equity::run(
        hero,
        board,
        compare,
        trials,
        seed,
        include_data,
    ))
}

/// レンジ式を全コンボに展開する。`excluded` に含まれるカードを使うコンボは弾く。
#[wasm_bindgen]
pub fn parse_range_to_hands(range: &str, excluded: &str) -> Result<JsValue, JsValue> {
    to_js(sim::parse_range::run(range, excluded))
}
