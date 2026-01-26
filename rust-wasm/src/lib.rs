//! WASM-friendly FFI that wraps `rs-poker` to evaluate hands and compare
//! winners. Returns simple integers so JavaScript/TypeScript can consume
//! without extra decoding.

mod rs_poker_native;
mod sim;

use rs_poker_native::{
  parse_range_to_hands as parse_range_to_hands_internal,
  simulate_multi_hand_equity as simulate_multi_hand_equity_internal,
  simulate_multi_hand_equity_with_progress as simulate_multi_hand_equity_with_progress_internal,
  simulate_open_ranges_monte_carlo as simulate_open_ranges_monte_carlo_internal,
  simulate_range_vs_range_equity as simulate_range_vs_range_equity_internal,
  simulate_range_vs_range_equity_with_progress as simulate_range_vs_range_equity_with_progress_internal,
  simulate_rank_distribution as simulate_rank_distribution_internal,
  simulate_rank_distribution_with_progress as simulate_rank_distribution_with_progress_internal,
  simulate_vs_list_equity as simulate_vs_list_equity_internal,
  simulate_vs_list_equity_with_progress as simulate_vs_list_equity_with_progress_internal,
  simulate_vs_list_with_ranks_monte_carlo as simulate_vs_list_with_ranks_monte_carlo_internal,
};
use sim::{
  eval::best_of,
  simulate_vs_list_with_ranks as simulate_vs_list_with_ranks_internal,
  simulate_vs_list_with_ranks_trace as simulate_vs_list_with_ranks_trace_internal,
  simulate_vs_list_with_ranks_with_progress as simulate_vs_list_with_ranks_with_progress_internal,
};
use sim::{parse_board, parse_hands_min1, Card as SimCard};

#[cfg(target_arch = "wasm32")]
#[link(wasm_import_module = "env")]
extern "C" {
  fn report_progress(progress: u32);
}

#[cfg(not(target_arch = "wasm32"))]
fn report_progress(_progress: u32) {}

fn emit_progress(progress: u32) {
  #[cfg(target_arch = "wasm32")]
  unsafe {
    report_progress(progress);
  }
  #[cfg(not(target_arch = "wasm32"))]
  {
    report_progress(progress);
  }
}

#[cfg(target_arch = "wasm32")]
mod wasm_getrandom {
  use getrandom::Error;

  #[link(wasm_import_module = "env")]
  extern "C" {
    fn getrandom_fill(dest: *mut u8, len: usize) -> i32;
  }

  #[no_mangle]
  pub unsafe extern "Rust" fn __getrandom_v03_custom(
    dest: *mut u8,
    len: usize,
  ) -> Result<(), Error> {
    let rc = getrandom_fill(dest, len);
    if rc == 0 {
      Ok(())
    } else {
      Err(Error::new_custom(1))
    }
  }
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
  ) -> Result<Vec<(u32, u32, u32, u32, u32, [u32; 9], [u32; 9], [u32; 9])>, i32>,
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

  let needed = results.len() * 32;
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  for ((c1, c2, w, t, p, rank_wins, rank_ties, rank_lose_counts), chunk) in
    results.iter().zip(out.chunks_exact_mut(32))
  {
    chunk[0] = *c1;
    chunk[1] = *c2;
    chunk[2] = *w;
    chunk[3] = *t;
    chunk[4] = *p;
    chunk[5..14].copy_from_slice(rank_wins);
    chunk[14..23].copy_from_slice(rank_ties);
    chunk[23..32].copy_from_slice(rank_lose_counts);
  }

  results.len() as i32
}

fn run_simulation_trace(
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
  mut runner: impl FnMut(&str, &str, &str) -> Result<Vec<[u32; 11]>, i32>,
) -> i32 {
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

  let needed = results.len() * 11;
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  for (row, chunk) in results.iter().zip(out.chunks_exact_mut(11)) {
    chunk.copy_from_slice(row);
  }

  results.len() as i32
}

fn run_rank_distribution(
  hands_ptr: *const u8,
  hands_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
  mut runner: impl FnMut(&str, &str) -> Result<Vec<[u32; 9]>, i32>,
) -> i32 {
  let _ = (trials, seed);
  if hands_ptr.is_null() || board_ptr.is_null() || out_ptr.is_null() {
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

  let results = match runner(hands_str, board_str) {
    Ok(v) => v,
    Err(code) => return code,
  };

  let needed = results.len() * 9;
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  for (counts, chunk) in results.iter().zip(out.chunks_exact_mut(9)) {
    chunk.copy_from_slice(counts);
  }

  results.len() as i32
}

fn run_equity(
  hero_ptr: *const u8,
  hero_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  compare_ptr: *const u8,
  compare_len: usize,
  opponents_count: u32,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
  mut runner: impl FnMut(&str, &str, &str, u32) -> Result<Vec<(u32, u32, u32, u32, u32)>, i32>,
) -> i32 {
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

  let results = match runner(hero_str, board_str, compare_str, opponents_count) {
    Ok(v) => v,
    Err(code) => return code,
  };

  let needed = results.len() * 5;
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  for ((c1, c2, w, t, p), chunk) in results.iter().zip(out.chunks_exact_mut(5)) {
    chunk[0] = *c1;
    chunk[1] = *c2;
    chunk[2] = *w;
    chunk[3] = *t;
    chunk[4] = *p;
  }

  results.len() as i32
}

fn run_multi_equity(
  hands_ptr: *const u8,
  hands_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
  mut runner: impl FnMut(&str, &str) -> Result<Vec<(u32, u32, u32)>, i32>,
) -> i32 {
  let _ = (trials, seed);
  if hands_ptr.is_null() || board_ptr.is_null() || out_ptr.is_null() {
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

  let results = match runner(hands_str, board_str) {
    Ok(v) => v,
    Err(code) => return code,
  };

  let needed = results.len() * 3;
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  for ((c1, c2, eq), chunk) in results.iter().zip(out.chunks_exact_mut(3)) {
    chunk[0] = *c1;
    chunk[1] = *c2;
    chunk[2] = *eq;
  }

  results.len() as i32
}

fn run_range_equity(
  hero_ptr: *const u8,
  hero_len: usize,
  villain_ptr: *const u8,
  villain_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
  mut runner: impl FnMut(&str, &str, &str) -> Result<Vec<(u32, u32, u32, u32)>, i32>,
) -> i32 {
  let _ = (trials, seed);
  if hero_ptr.is_null() || villain_ptr.is_null() || board_ptr.is_null() || out_ptr.is_null() {
    return -1;
  }
  let hero_slice = unsafe { std::slice::from_raw_parts(hero_ptr, hero_len) };
  let villain_slice = unsafe { std::slice::from_raw_parts(villain_ptr, villain_len) };
  let board_slice = unsafe { std::slice::from_raw_parts(board_ptr, board_len) };
  let hero_str = match std::str::from_utf8(hero_slice) {
    Ok(s) => s,
    Err(_) => return -2,
  };
  let villain_str = match std::str::from_utf8(villain_slice) {
    Ok(s) => s,
    Err(_) => return -3,
  };
  let board_str = match std::str::from_utf8(board_slice) {
    Ok(s) => s,
    Err(_) => return -4,
  };

  let results = match runner(hero_str, villain_str, board_str) {
    Ok(v) => v,
    Err(code) => return code,
  };

  let needed = results.len() * 4;
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  for ((c1, c2, equity, role), chunk) in results.iter().zip(out.chunks_exact_mut(4)) {
    chunk[0] = *c1;
    chunk[1] = *c2;
    chunk[2] = *equity;
    chunk[3] = *role;
  }

  results.len() as i32
}

fn run_parse_range(
  range_ptr: *const u8,
  range_len: usize,
  out_ptr: *mut u32,
  out_len: usize,
  mut runner: impl FnMut(&str) -> Result<Vec<(u32, u32)>, i32>,
) -> i32 {
  if range_ptr.is_null() || out_ptr.is_null() {
    return -1;
  }
  let range_slice = unsafe { std::slice::from_raw_parts(range_ptr, range_len) };
  let range_str = match std::str::from_utf8(range_slice) {
    Ok(s) => s,
    Err(_) => return -2,
  };

  let results = match runner(range_str) {
    Ok(v) => v,
    Err(code) => return code,
  };

  let needed = results.len() * 2;
  if out_len < needed {
    return -6;
  }

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  for ((c1, c2), chunk) in results.iter().zip(out.chunks_exact_mut(2)) {
    chunk[0] = *c1;
    chunk[1] = *c2;
  }

  results.len() as i32
}

fn validate_hand_board(hand: &[SimCard; 2], board: &[SimCard]) -> Result<(), i32> {
  let mut seen = Vec::new();
  for c in board {
    if seen.iter().any(|x: &SimCard| x.rank == c.rank && x.suit == c.suit) {
      return Err(-5);
    }
    seen.push(*c);
  }
  if hand[0].rank == hand[1].rank && hand[0].suit == hand[1].suit {
    return Err(-5);
  }
  for c in hand {
    if board.iter().any(|x| x.rank == c.rank && x.suit == c.suit) {
      return Err(-5);
    }
  }
  Ok(())
}

fn encode_sim_card(card: &SimCard) -> u32 {
  (card.rank as u32) << 2 | (card.suit as u32)
}

/// Evaluate and rank multiple hands for a given board.
/// Output per hand: [card1, card2, rankIndex, encoded, kicker1..kicker5] (9 u32s).
/// out_len must be >= hands_count * 9. Returns record count or negative error.
#[no_mangle]
pub extern "C" fn evaluate_hands_ranking(
  hands_ptr: *const u8,
  hands_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  if hands_ptr.is_null() || board_ptr.is_null() || out_ptr.is_null() {
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

  let hands = match parse_hands_min1(hands_str) {
    Some(hands) => hands,
    None => return -5,
  };
  let board = match parse_board(board_str) {
    Some(board) => board,
    None => return -5,
  };
  if board.len() < 3 || board.len() > 5 {
    return -5;
  }

  for hand in &hands {
    if validate_hand_board(hand, &board).is_err() {
      return -5;
    }
  }

  let needed = hands.len().saturating_mul(9);
  if out_len < needed {
    return -6;
  }

  let mut ranked: Vec<(u32, u32, u32, u32, [u8; 5])> = Vec::with_capacity(hands.len());
  for hand in &hands {
    let mut cards: Vec<SimCard> = Vec::with_capacity(board.len() + 2);
    cards.extend_from_slice(&board);
    cards.push(hand[0]);
    cards.push(hand[1]);
    let score = best_of(&cards);
    ranked.push((
      encode_sim_card(&hand[0]),
      encode_sim_card(&hand[1]),
      score.rank as u32,
      score.encoded,
      score.kickers,
    ));
  }

  ranked.sort_by(|a, b| b.3.cmp(&a.3).then_with(|| a.0.cmp(&b.0)).then_with(|| a.1.cmp(&b.1)));

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  for (row, chunk) in ranked.iter().zip(out.chunks_exact_mut(9)) {
    chunk[0] = row.0;
    chunk[1] = row.1;
    chunk[2] = row.2;
    chunk[3] = row.3;
    for i in 0..5 {
      chunk[4 + i] = row.4[i] as u32;
    }
  }

  ranked.len() as i32
}

/// Hero vs provided opponent list (heads-up) Monte Carlo with rank distribution.
/// Output per record: [oppCard1, oppCard2, heroWins, ties, plays, rankWin0..rankWin8, rankTie0..rankTie8, rankLose0..rankLose8]
/// out_len must be >= records * 32 (compareCount * 32). Returns record count (compareCount) or negative error.
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
      simulate_vs_list_with_ranks_with_progress_internal(
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

/// Hero vs provided opponent list, returning per-trial outcomes with winner ranks.
/// Output per record: [hero1, hero2, board1..board5, opp1, opp2, outcome, rankIndex]
/// out_len must be >= records * 11 (compareCount * trials * 11). Returns record count or negative error.
#[no_mangle]
pub extern "C" fn simulate_vs_list_with_ranks_trace(
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
  run_simulation_trace(
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
      simulate_vs_list_with_ranks_trace_internal(hero_str, board_str, compare_str, trials, seed)
        .map_err(|_| -5)
    },
  )
}

/// Hero vs provided opponent list (heads-up) Monte Carlo with rank distribution (winner ranks only).
/// Output per record: [oppCard1, oppCard2, heroWins, ties, plays, rankWin0..rankWin8, rankTie0..rankTie8, rankLose0..rankLose8]
/// out_len must be >= records * 32 (compareCount * 32). Returns record count or negative error.
#[no_mangle]
pub extern "C" fn simulate_vs_list_with_ranks_monte_carlo(
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
      simulate_vs_list_with_ranks_monte_carlo_internal(
        hero_str,
        board_str,
        compare_str,
        trials,
        seed,
      )
      .map_err(|_| -5)
    },
  )
}

/// Hero range vs 1-8 opponent ranges (semicolon-separated), Monte Carlo with hero win ranks.
/// Output layout: [wins, ties, plays, rankWin0..rankWin8].
/// out_len must be >= 12. Returns 1 on success or negative error.
#[no_mangle]
pub extern "C" fn simulate_open_ranges_monte_carlo(
  hero_ptr: *const u8,
  hero_len: usize,
  opponents_ptr: *const u8,
  opponents_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  if hero_ptr.is_null() || opponents_ptr.is_null() || out_ptr.is_null() {
    return -1;
  }
  let hero_slice = unsafe { std::slice::from_raw_parts(hero_ptr, hero_len) };
  let opponents_slice = unsafe { std::slice::from_raw_parts(opponents_ptr, opponents_len) };
  let hero_str = match std::str::from_utf8(hero_slice) {
    Ok(s) => s,
    Err(_) => return -2,
  };
  let opponents_str = match std::str::from_utf8(opponents_slice) {
    Ok(s) => s,
    Err(_) => return -3,
  };

  if out_len < 12 {
    return -6;
  }

  let result = match simulate_open_ranges_monte_carlo_internal(
    hero_str,
    opponents_str,
    trials,
    seed,
  ) {
    Ok(v) => v,
    Err(_) => return -5,
  };

  let out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
  out[0] = result.0;
  out[1] = result.1;
  out[2] = result.2;
  out[3..12].copy_from_slice(&result.3);
  1
}

/// Hero vs provided opponent list, returning equity-only stats (wins/ties/plays).
/// Output per record: [oppCard1, oppCard2, heroWins, ties, plays].
/// When include_data == 0, returns only the hero aggregate record.
/// out_len must be >= records * 5 (compareCount * 5 when include_data == 1).
/// Returns record count or negative error.
#[no_mangle]
pub extern "C" fn simulate_vs_list_equity(
  hero_ptr: *const u8,
  hero_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  compare_ptr: *const u8,
  compare_len: usize,
  opponents_count: u32,
  trials: u32,
  seed: u64,
  include_data: u32,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  run_equity(
    hero_ptr,
    hero_len,
    board_ptr,
    board_len,
    compare_ptr,
    compare_len,
    opponents_count,
    trials,
    seed,
    out_ptr,
    out_len,
    |hero_str, board_str, compare_str, opponents_count| {
      simulate_vs_list_equity_internal(
        hero_str,
        board_str,
        compare_str,
        opponents_count,
        trials,
        seed,
        include_data != 0,
      )
      .map_err(|_| -5)
    },
  )
}

/// Multi-hand equity (3-6 players), returning equity_scaled (1e6).
/// Output per record: [card1, card2, equity_scaled].
/// out_len must be >= hands_count * 3. Returns record count or negative error.
#[no_mangle]
pub extern "C" fn simulate_multi_hand_equity(
  hands_ptr: *const u8,
  hands_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  run_multi_equity(
    hands_ptr,
    hands_len,
    board_ptr,
    board_len,
    trials,
    seed,
    out_ptr,
    out_len,
    |hands_str, board_str| {
      simulate_multi_hand_equity_internal(hands_str, board_str, trials, seed).map_err(|_| -5)
    },
  )
}

/// Multi-hand equity with progress. Emits progress via `report_progress`.
#[no_mangle]
pub extern "C" fn simulate_multi_hand_equity_with_progress(
  hands_ptr: *const u8,
  hands_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  run_multi_equity(
    hands_ptr,
    hands_len,
    board_ptr,
    board_len,
    trials,
    seed,
    out_ptr,
    out_len,
    |hands_str, board_str| {
      simulate_multi_hand_equity_with_progress_internal(
        hands_str,
        board_str,
        trials,
        seed,
        Some(|p| emit_progress(p)),
      )
      .map_err(|_| -5)
    },
  )
}

/// Equity variant with progress. Emits progress via `report_progress`.
/// When include_data == 0, returns only the hero aggregate record.
#[no_mangle]
pub extern "C" fn simulate_vs_list_equity_with_progress(
  hero_ptr: *const u8,
  hero_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  compare_ptr: *const u8,
  compare_len: usize,
  opponents_count: u32,
  trials: u32,
  seed: u64,
  include_data: u32,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  run_equity(
    hero_ptr,
    hero_len,
    board_ptr,
    board_len,
    compare_ptr,
    compare_len,
    opponents_count,
    trials,
    seed,
    out_ptr,
    out_len,
    |hero_str, board_str, compare_str, opponents_count| {
      simulate_vs_list_equity_with_progress_internal(
        hero_str,
        board_str,
        compare_str,
        opponents_count,
        trials,
        seed,
        Some(|p| emit_progress(p)),
        include_data != 0,
      )
      .map_err(|_| -5)
    },
  )
}

/// Range vs range equity (per-hand wins/ties/plays for hero and villain).
/// Output per record: [card1, card2, wins, ties, plays, role].
#[no_mangle]
pub extern "C" fn simulate_range_vs_range_equity(
  hero_ptr: *const u8,
  hero_len: usize,
  villain_ptr: *const u8,
  villain_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  run_range_equity(
    hero_ptr,
    hero_len,
    villain_ptr,
    villain_len,
    board_ptr,
    board_len,
    trials,
    seed,
    out_ptr,
    out_len,
    |hero_str, villain_str, board_str| {
      simulate_range_vs_range_equity_internal(
        hero_str,
        villain_str,
        board_str,
        trials,
        seed,
      )
      .map_err(|_| -5)
    },
  )
}

/// Range vs range equity with progress. Emits progress via `report_progress`.
#[no_mangle]
pub extern "C" fn simulate_range_vs_range_equity_with_progress(
  hero_ptr: *const u8,
  hero_len: usize,
  villain_ptr: *const u8,
  villain_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  run_range_equity(
    hero_ptr,
    hero_len,
    villain_ptr,
    villain_len,
    board_ptr,
    board_len,
    trials,
    seed,
    out_ptr,
    out_len,
    |hero_str, villain_str, board_str| {
      simulate_range_vs_range_equity_with_progress_internal(
        hero_str,
        villain_str,
        board_str,
        trials,
        seed,
        Some(|p| emit_progress(p)),
      )
      .map_err(|_| -5)
    },
  )
}

/// Multiple hands rank distribution for a partial board (>=3 cards).
/// Output per hand: [rank0..rank8]. out_len must be >= hands_count * 9.
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
  run_rank_distribution(
    hands_ptr,
    hands_len,
    board_ptr,
    board_len,
    trials,
    seed,
    out_ptr,
    out_len,
    |hands_str, board_str| {
      simulate_rank_distribution_internal(hands_str, board_str, trials, seed).map_err(|_| -5)
    },
  )
}

/// Rank distribution with progress. Emits progress via `report_progress`.
#[no_mangle]
pub extern "C" fn simulate_rank_distribution_with_progress(
  hands_ptr: *const u8,
  hands_len: usize,
  board_ptr: *const u8,
  board_len: usize,
  trials: u32,
  seed: u64,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  run_rank_distribution(
    hands_ptr,
    hands_len,
    board_ptr,
    board_len,
    trials,
    seed,
    out_ptr,
    out_len,
    |hands_str, board_str| {
      simulate_rank_distribution_with_progress_internal(
        hands_str,
        board_str,
        trials,
        seed,
        Some(|p| emit_progress(p)),
      )
      .map_err(|_| -5)
    },
  )
}

/// Parse a range string into encoded hands.
/// Output per hand: [card1, card2]. out_len must be >= hands_count * 2.
#[no_mangle]
pub extern "C" fn parse_range_to_hands(
  range_ptr: *const u8,
  range_len: usize,
  out_ptr: *mut u32,
  out_len: usize,
) -> i32 {
  run_parse_range(range_ptr, range_len, out_ptr, out_len, |range_str| {
    parse_range_to_hands_internal(range_str).map_err(|_| -5)
  })
}
