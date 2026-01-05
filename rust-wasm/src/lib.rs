//! WASM-friendly FFI that wraps `rs-poker` to evaluate hands and compare
//! winners. Returns simple integers so JavaScript/TypeScript can consume
//! without extra decoding.

mod rs_poker_native;
mod sim;

use rs_poker_native::{compare_hands_rs, evaluate_hand_rs};
use sim::{
  simulate_equity as simulate_equity_internal,
  simulate_vs_random_opponents as simulate_vs_random_opponents_internal,
  simulate_vs_list as simulate_vs_list_internal,
  simulate_vs_list_with_ranks as simulate_vs_list_with_ranks_internal,
  simulate_rank_distribution as simulate_rank_distribution_internal,
};
use std::cmp::Ordering;

#[no_mangle]
pub extern "C" fn evaluate_hand(ptr: *const u8, len: usize) -> u32 {
  if ptr.is_null() || len == 0 {
    return u32::MAX;
  }

  let slice = unsafe { std::slice::from_raw_parts(ptr, len) };
  let hand_str = match std::str::from_utf8(slice) {
    Ok(s) => s,
    Err(_) => return u32::MAX,
  };

  match evaluate_hand_rs(hand_str) {
    Ok(cat) => cat as u32,
    Err(_) => u32::MAX,
  }
}

/// Hero vs random opponents (sampled) Monte Carlo.
/// hands_ptr: hero 2-card hand (string), example "AsKs"
/// board_ptr: 0-5 board cards (string), example "2c 3c 4c" or ""
/// trials: number of simulations
/// seed: u64 seed
/// out_ptr: buffer of u32, each record = 5 u32 [oppCard1, oppCard2, wins, ties, plays]
/// out_len: length of out_ptr (u32 slots). Must be >= records*5. Records written count is returned.
/// returns: number of records written (>=0) or negative error code.
#[no_mangle]
pub extern "C" fn simulate_vs_random_opponents(
  hero_ptr: *const u8,
  hero_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  if hero_ptr.is_null() || out_ptr.is_null() {
    return -1;
  }
  let hero_slice = unsafe { std::slice::from_raw_parts(hero_ptr, hero_len) };
  let board_slice = unsafe { std::slice::from_raw_parts(board_ptr, board_len) };
  let hero_str = match std::str::from_utf8(hero_slice) {
    Ok(s) => s,
    Err(_) => return -2,
  };
  let board_str = match std::str::from_utf8(board_slice) {
    Ok(s) => s,
    Err(_) => return -3,
  };

  let results = match simulate_vs_random_opponents_internal(hero_str, board_str, trials, seed) {
    Ok(v) => v,
    Err(_) => return -4,
  };

  let needed = (results.len() + 1) * 5; // +1 for hero aggregate
  if out_len < needed {
    return -5;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  let mut hero_wins = 0u32;
  let mut hero_ties = 0u32;
  let mut hero_plays = 0u32;
  let mut idx = 0usize;
  for (c1, c2, w, t, p) in &results {
    out[idx] = *c1;
    out[idx + 1] = *c2;
    out[idx + 2] = *w;
    out[idx + 3] = *t;
    out[idx + 4] = *p;
    idx += 5;
    hero_wins += *w;
    hero_ties += *t;
    hero_plays += *p;
  }

  // hero aggregate sentinel (card1=card2=u32::MAX)
  out[idx] = u32::MAX;
  out[idx + 1] = u32::MAX;
  out[idx + 2] = hero_wins;
  out[idx + 3] = hero_ties;
  out[idx + 4] = hero_plays;

  (results.len() + 1) as i32
}

/// Hero vs provided opponent list (heads-up) Monte Carlo.
/// hero_ptr: "As Ks" etc. (2 cards)
/// board_ptr: 0-5 cards string, can be empty
/// compare_ptr: opponents separated by ';', each 2 cards (space or no-space), e.g. "QhQd;JhTh"
/// trials: number of simulations
/// seed: u64 seed
/// out_ptr: buffer of u32, each record = 5 u32 [oppCard1, oppCard2, heroWins, ties, plays]
/// out_len: length of out_ptr (u32 slots). Must be >= records*5. Records written count is returned.
/// returns: number of records written (>=0) or negative error code.
#[no_mangle]
pub extern "C" fn simulate_vs_list(
  hero_ptr: *const u8,
  hero_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  compare_ptr: *const u8,
  compare_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  if hero_ptr.is_null() || out_ptr.is_null() || compare_ptr.is_null() {
    return -1;
  }
  let hero_slice = unsafe { std::slice::from_raw_parts(hero_ptr, hero_len) };
  let board_slice = unsafe { std::slice::from_raw_parts(board_ptr, board_len) };
  let compare_slice = unsafe { std::slice::from_raw_parts(compare_ptr, compare_len) };
  let hero_str = match std::str::from_utf8(hero_slice) {
    Ok(s) => s,
    Err(_) => return -2,
  };
  let board_str = match std::str::from_utf8(board_slice) {
    Ok(s) => s,
    Err(_) => return -3,
  };
  let compare_str = match std::str::from_utf8(compare_slice) {
    Ok(s) => s,
    Err(_) => return -4,
  };

  let results = match simulate_vs_list_internal(hero_str, board_str, compare_str, trials, seed) {
    Ok(v) => v,
    Err(_) => return -5,
  };

  let needed = (results.len() + 1) * 5; // +1 for hero aggregate
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  let mut hero_wins = 0u32;
  let mut hero_ties = 0u32;
  let mut hero_plays = 0u32;
  let mut idx = 0usize;
  for (c1, c2, w, t, p) in &results {
    out[idx] = *c1;
    out[idx + 1] = *c2;
    out[idx + 2] = *w;
    out[idx + 3] = *t;
    out[idx + 4] = *p;
    idx += 5;
    hero_wins += *w;
    hero_ties += *t;
    hero_plays += *p;
  }

  // hero aggregate sentinel (card1=card2=u32::MAX)
  out[idx] = u32::MAX;
  out[idx + 1] = u32::MAX;
  out[idx + 2] = hero_wins;
  out[idx + 3] = hero_ties;
  out[idx + 4] = hero_plays;

  (results.len() + 1) as i32
}

/// Hero vs provided opponent list (heads-up) Monte Carlo with rank distribution.
/// Output per record: [oppCard1, oppCard2, heroWins, ties, plays, rank0..rank8]
/// out_len must be >= records * 14 (compareCount * 14). Returns record count (compareCount) or negative error.
#[no_mangle]
pub extern "C" fn simulate_vs_list_with_ranks(
  hero_ptr: *const u8,
  hero_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  compare_ptr: *const u8,
  compare_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  if hero_ptr.is_null() || out_ptr.is_null() || compare_ptr.is_null() {
    return -1;
  }
  let hero_slice = unsafe { std::slice::from_raw_parts(hero_ptr, hero_len) };
  let board_slice = unsafe { std::slice::from_raw_parts(board_ptr, board_len) };
  let compare_slice = unsafe { std::slice::from_raw_parts(compare_ptr, compare_len) };
  let hero_str = match std::str::from_utf8(hero_slice) {
    Ok(s) => s,
    Err(_) => return -2,
  };
  let board_str = match std::str::from_utf8(board_slice) {
    Ok(s) => s,
    Err(_) => return -3,
  };
  let compare_str = match std::str::from_utf8(compare_slice) {
    Ok(s) => s,
    Err(_) => return -4,
  };

  let results = match simulate_vs_list_with_ranks_internal(
    hero_str,
    board_str,
    compare_str,
    trials,
    seed,
  ) {
    Ok(v) => v,
    Err(_) => return -5,
  };

  let needed = results.len() * 14;
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  let mut idx = 0usize;
  for (c1, c2, w, t, p, ranks) in &results {
    out[idx] = *c1;
    out[idx + 1] = *c2;
    out[idx + 2] = *w;
    out[idx + 3] = *t;
    out[idx + 4] = *p;
    for i in 0..9 {
      out[idx + 5 + i] = ranks[i];
    }
    idx += 14;
  }

  results.len() as i32
}

/// Monte Carlo シミュレーションで各ハンドの勝率/タイ率を計算する。
/// hands: "AsKs;QhQd;JhTh" のように ';' 区切りで複数ハンド（各 2 枚）を指定。
/// board: "2c 3c 4c" のように 0〜5 枚を指定（空文字可）。
/// trials: 試行回数（最低 1 回に丸める）。
/// seed: 疑似乱数シード（LCG、固定すると再現性あり）。
/// out_ptr: u32 配列へのポインタ。各ハンドについて [wins, ties] を順に書き込む。
/// out_len: out_ptr に確保されている u32 の長さ。2 * hands.len() 以上が必要。
/// 戻り値: 0 = 成功、負値 = エラー。
#[no_mangle]
pub extern "C" fn simulate_equity(
  hands_ptr: *const u8,
  hands_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  if hands_ptr.is_null() || out_ptr.is_null() {
    return -1;
  }
  let hands_slice = unsafe { std::slice::from_raw_parts(hands_ptr, hands_len) };
  let board_slice = unsafe { std::slice::from_raw_parts(board_ptr, board_len) };
  let hands_str = match std::str::from_utf8(hands_slice) {
    Ok(s) => s,
    Err(_) => return -2,
  };
  let board_str = match std::str::from_utf8(board_slice) {
    Ok(s) => s,
    Err(_) => return -3,
  };

  let pairs = match simulate_equity_internal(hands_str, board_str, trials, seed) {
    Ok(p) => p,
    Err(_) => return -4,
  };

  if out_len < pairs.len() * 2 {
    return -5;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  let mut idx = 0;
  for (w, t) in pairs {
    out[idx] = w;
    out[idx + 1] = t;
    idx += 2;
  }
  0
}

/// Rank distribution per hand.
/// hands: ';' 区切りの 2 枚ハンド群。
/// board: 0-5 枚。
/// out_ptr: 各ハンドについてランク0..8の出現回数（u32）を手番順に書き込む。長さは hands.len() * 9。
/// 戻り値: 0 = 成功、負値 = エラー。
#[no_mangle]
pub extern "C" fn simulate_rank_distribution(
  hands_ptr: *const u8,
  hands_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  if hands_ptr.is_null() || out_ptr.is_null() {
    return -1;
  }
  let hands_slice = unsafe { std::slice::from_raw_parts(hands_ptr, hands_len) };
  let board_slice = unsafe { std::slice::from_raw_parts(board_ptr, board_len) };
  let hands_str = match std::str::from_utf8(hands_slice) {
    Ok(s) => s,
    Err(_) => return -2,
  };
  let board_str = match std::str::from_utf8(board_slice) {
    Ok(s) => s,
    Err(_) => return -3,
  };

  let counts = match simulate_rank_distribution_internal(hands_str, board_str, trials, seed) {
    Ok(v) => v,
    Err(_) => return -4,
  };

  let needed = counts.len() * 9;
  if out_len < needed {
    return -5;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  let mut idx = 0usize;
  for c in counts {
    for v in c {
      out[idx] = v;
      idx += 1;
    }
  }
  0
}

#[no_mangle]
pub extern "C" fn compare_hands(
  a_ptr: *const u8,
  a_len: usize,
  b_ptr: *const u8,
  b_len: usize,
) -> i32 {
  if a_ptr.is_null() || b_ptr.is_null() || a_len == 0 || b_len == 0 {
    return i32::MIN;
  }

  let a_slice = unsafe { std::slice::from_raw_parts(a_ptr, a_len) };
  let b_slice = unsafe { std::slice::from_raw_parts(b_ptr, b_len) };
  let a_str = match std::str::from_utf8(a_slice) {
    Ok(s) => s,
    Err(_) => return i32::MIN,
  };
  let b_str = match std::str::from_utf8(b_slice) {
    Ok(s) => s,
    Err(_) => return i32::MIN,
  };

  match compare_hands_rs(a_str, b_str) {
    Ok(Ordering::Greater) => 1,
    Ok(Ordering::Equal) => 0,
    Ok(Ordering::Less) => -1,
    Err(_) => i32::MIN,
  }
}
