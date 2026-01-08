//! WASM-friendly FFI that wraps `rs-poker` to evaluate hands and compare
//! winners. Returns simple integers so JavaScript/TypeScript can consume
//! without extra decoding.

mod rs_poker_native;
mod sim;

use sim::{
  simulate_vs_list_with_ranks as simulate_vs_list_with_ranks_internal,
  simulate_vs_list_with_ranks_with_progress as simulate_vs_list_with_progress_internal,
};

#[link(wasm_import_module = "env")]
extern "C" {
  fn report_progress(progress: u32);
}

fn run_simulation(
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
  mut runner: impl FnMut(
    &str,
    &str,
    &str,
  ) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9])>, i32>,
) -> i32 {
  // used by closures passed in via `runner`
  let _ = (trials, seed);
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

  let results = match runner(hero_str, board_str, compare_str) {
    Ok(v) => v,
    Err(code) => return code,
  };

  let needed = results.len() * 14;
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  for ((c1, c2, w, t, p, ranks), chunk) in results.iter().zip(out.chunks_exact_mut(14)) {
    chunk[0] = *c1;
    chunk[1] = *c2;
    chunk[2] = *w;
    chunk[3] = *t;
    chunk[4] = *p;
    chunk[5..14].copy_from_slice(ranks);
  }

  results.len() as i32
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
  run_simulation(
    hero_ptr,
    hero_len,
    board_ptr,
    board_len,
    compare_ptr,
    compare_len,
    trials,
    seed,
    out_ptr,
    out_len,
    |hero_str, board_str, compare_str| {
      simulate_vs_list_with_ranks_internal(hero_str, board_str, compare_str, trials, seed)
        .map_err(|_| -5)
    },
  )
}

/// Progress-reporting variant. Emits progress via imported `report_progress` callback (0-100),
/// and writes the same output layout as `simulate_vs_list_with_ranks`.
#[no_mangle]
pub extern "C" fn simulate_vs_list_with_ranks_with_progress(
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
  run_simulation(
    hero_ptr,
    hero_len,
    board_ptr,
    board_len,
    compare_ptr,
    compare_len,
    trials,
    seed,
    out_ptr,
    out_len,
    |hero_str, board_str, compare_str| {
      simulate_vs_list_with_progress_internal(
        hero_str,
        board_str,
        compare_str,
        trials,
        seed,
        Some(|p| unsafe {
          report_progress(p);
        }),
      )
      .map_err(|_| -5)
    },
  )
}
