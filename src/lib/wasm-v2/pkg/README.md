# pokepra wasm (v2)

[`rs_poker`](https://crates.io/crates/rs_poker) を使ったポーカー処理の WASM ビルド基盤。
バインディングは `wasm-bindgen` で生成し、成果物は `src/lib/wasm-v2/` に出力する。

## ビルド

プロジェクトルートで：

```sh
bun run build:wasm-v2
```

内部では以下を実行している：

```sh
cd rust
rustup target add wasm32-unknown-unknown
wasm-pack build --release --target web --out-dir ../src/lib/wasm-v2 --out-name pokepra_wasm
```

成果物：

- `src/lib/wasm-v2/pokepra_wasm.js` — ES module 形式のローダー
- `src/lib/wasm-v2/pokepra_wasm.d.ts` — 型定義
- `src/lib/wasm-v2/pokepra_wasm_bg.wasm` — WASM バイナリ

## TypeScript から使う例

```ts
import init, { version, evaluate_hand, compare_hands } from "@/lib/wasm-v2/pokepra_wasm";

await init(); // モジュールのインスタンス化
console.log(version());
console.log(evaluate_hand("AsKsQsJsTs"));
console.log(compare_hands("AsAhKsKhQs", "AsKsQsJsTs"));
```

## エクスポート

| 関数 | 概要 |
| --- | --- |
| `version()` | クレートのバージョン文字列 |
| `evaluate_hand(cards)` | 5 枚以上のカード列から最良ハンドの Rank を Debug 表現で返す |
| `compare_hands(a, b)` | `1` = a の勝ち / `-1` = b の勝ち / `0` = 引き分け |

カード文字列はランク（`2-9, T, J, Q, K, A`）とスート（`s, h, d, c`）の連結。
連結形（`AsKsQsJsTs`）、空白区切り（`As Ks Qs Js Ts`）どちらも受ける。

## 依存

- `wasm-bindgen`
- `rs_poker` (default features off)
- `getrandom` (`wasm_js` backend) — `.cargo/config.toml` で `getrandom_backend="wasm_js"` を設定

## 注意

- `wasm-opt` のバージョンが古いと bulk memory ops でエラーになるため、
  `Cargo.toml` の `[package.metadata.wasm-pack.profile.release]` で `--enable-bulk-memory` を渡している。
- `src/lib/wasm-v2/` 配下は `wasm-pack` 生成物。Git にはコミットせず、ビルド時に生成する想定。
