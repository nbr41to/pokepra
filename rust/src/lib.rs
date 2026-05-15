use std::cmp::Ordering;

use rs_poker::core::{Hand, Rankable};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

fn normalize(cards: &str) -> String {
    cards.split_whitespace().collect::<String>()
}

fn parse_hand(cards: &str) -> Result<Hand, String> {
    Hand::new_from_str(&normalize(cards)).map_err(|e| format!("invalid hand: {:?}", e))
}

fn ensure_min_cards(hand: &Hand, min: usize) -> Result<(), String> {
    let count = hand.count();
    if count < min {
        Err(format!("need at least {} cards, got {}", min, count))
    } else {
        Ok(())
    }
}

/// 5枚以上のカード列から最良の役を評価し、Debug表現を返す。
/// 入力例: "AsKsQsJsTs" もしくは空白区切り "As Ks Qs Js Ts"
#[wasm_bindgen]
pub fn evaluate_hand(cards: &str) -> Result<String, JsValue> {
    let hand = parse_hand(cards).map_err(|e| JsValue::from_str(&e))?;
    ensure_min_cards(&hand, 5).map_err(|e| JsValue::from_str(&e))?;
    Ok(format!("{:?}", hand.rank()))
}

/// 2つのハンドを比較する。
/// 戻り値: 1 = a の勝ち, -1 = b の勝ち, 0 = 引き分け
#[wasm_bindgen]
pub fn compare_hands(a: &str, b: &str) -> Result<i32, JsValue> {
    let ha = parse_hand(a).map_err(|e| JsValue::from_str(&e))?;
    let hb = parse_hand(b).map_err(|e| JsValue::from_str(&e))?;
    ensure_min_cards(&ha, 5).map_err(|e| JsValue::from_str(&e))?;
    ensure_min_cards(&hb, 5).map_err(|e| JsValue::from_str(&e))?;
    Ok(match ha.rank().cmp(&hb.rank()) {
        Ordering::Greater => 1,
        Ordering::Less => -1,
        Ordering::Equal => 0,
    })
}
