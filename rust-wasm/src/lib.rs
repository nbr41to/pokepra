//! WASM-friendly FFI that wraps `rs-poker` to evaluate hands and compare
//! winners. Returns simple integers so JavaScript/TypeScript can consume
//! without extra decoding.

mod rs_poker_native;
mod sim;

use sim::simulate_vs_list_with_ranks as simulate_vs_list_with_ranks_internal;

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

// keep only simulate_vs_list_with_ranks for WASM FFI
