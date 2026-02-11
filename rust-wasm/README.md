# Rust → WASM sample

## エクスポートしている関数

FFI 安全な関数をいくつか用意しています（`wasm32-unknown-unknown` 向けの `cdylib`）。

```rust
// 足し算（動作確認用）
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32

// 5 枚ハンドの役判定。
// 例: "As Ks Qs Js Ts" のような空白区切り文字列を渡す。
// 正常ならエンコード済みスコアを返し、パースエラー時は u32::MAX を返す。
#[no_mangle]
pub extern "C" fn evaluate_hand(ptr: *const u8, len: usize) -> u32

// 5 枚ハンド同士の比較。
// 1 = a の勝ち, -1 = b の勝ち, 0 = 引き分け, エラー時は i32::MIN を返す。
#[no_mangle]
pub extern "C" fn compare_hands(
    a_ptr: *const u8, a_len: usize,
    b_ptr: *const u8, b_len: usize,
) -> i32
```

### 手札フォーマット
- 5 枚固定、空白区切り文字列（例: `"As Ks Qs Js Ts"`）。
- ランク: `2-9`, `T`, `J`, `Q`, `K`, `A`
- スート: `s`, `h`, `d`, `c`

### 戻り値
- 役種とキッカーを 32bit に詰めたスコアを返す設計です。大きい値ほど強いハンドです。
- パース失敗や枚数不正時は `u32::MAX` / `i32::MIN` を返すので、JS 側でエラーハンドリングしてください。

## ビルド手順（WASM）
1. ターゲット追加（初回のみ）: `rustup target add wasm32-unknown-unknown`
2. ビルド: `cargo build --release --target wasm32-unknown-unknown`
3. アーティファクトコピー:  
   `cp target/wasm32-unknown-unknown/release/rust_wasm_demo.wasm ../public/wasm-v1/rust_wasm_bg.wasm`

`public/` 配下に置くことで Next.js からそのまま `fetch` できます。

## rs-poker（ネイティブ専用、WASM には含めない）

`rs_poker` クレートを使った役判定/勝敗判定のアダプターを `src/rs_poker_native.rs` に追加しました。  
WASM ではなくネイティブ向け（`cfg(not(target_arch = "wasm32"))`）なので、ホスト環境で直接 Rust として利用できます。

関数:
- `evaluate_hand_rs(hand: &str) -> Result<String, String>`  
  例: `"As Ks Qs Js Ts"` → 役名（Debug 表示の文字列）
- `compare_hands_rs(a: &str, b: &str) -> Result<Ordering, String>`  
  例: `Greater` = a の勝ち, `Less` = b の勝ち, `Equal` = 引き分け

依存関係は `rust-wasm/Cargo.toml` の `rs-poker = "0.1"` で、WASM ターゲットではコンパイルされないようにしています。
