# pokepra wasm (v2)

[`rs_poker`](https://crates.io/crates/rs_poker) を使ったポーカー処理の WASM 基盤。
バインディングは `wasm-bindgen` で生成し、生成物は `src/lib/wasm-v2/pkg/` 配下に出る。
フロントエンドからはその一段上 `src/lib/wasm-v2/simulation.ts` のラッパ経由で利用する。

## レイヤ構成

```
rust/                          ← Rust ソース（このディレクトリ）
src/lib/wasm-v2/
├── simulation.ts              ← フロントエンドが呼ぶ手書きラッパ（v1 互換 API）
└── pkg/                       ← wasm-pack 生成物（自動）
    ├── pokepra_wasm.js
    ├── pokepra_wasm.d.ts
    └── pokepra_wasm_bg.wasm
```

## ビルド

プロジェクトルートで:

```sh
bun run build:wasm-v2
```

内部で実行している処理:

```sh
cd rust
rustup target add wasm32-unknown-unknown
wasm-pack build --release --target web --out-dir ../src/lib/wasm-v2/pkg --out-name pokepra_wasm
rm -f ../src/lib/wasm-v2/pkg/.gitignore
```

## Rust 側の構成

```
rust/src/
├── lib.rs                # #[wasm_bindgen] エクスポートのみ
├── parser.rs             # 入力文字列のパース
├── cards.rs              # Card 表示・デッキ生成
├── rank.rs               # Rank → カテゴリ index/encoded/ラベル
├── rng.rs                # シード付き RNG
├── dto.rs                # JS 境界の Serialize 構造体
└── sim/
    ├── mod.rs            # evaluate_seven 共通ヘルパ
    ├── evaluate.rs       # evaluate_hands_ranking
    ├── vs_list.rs        # simulate_vs_list_with_ranks
    ├── vs_list_equity.rs # simulate_vs_list_equity
    ├── range_vs_range.rs # simulate_range_vs_range_equity
    └── parse_range.rs    # parse_range_to_hands
```

新しい機能を追加するときは「DTO を `dto.rs` に追加 → ロジックを `sim/foo.rs` に実装 →
`lib.rs` にエクスポート 1 行 → `simulation.ts` にラッパ追加」の流れ。

## エクスポート関数

| WASM 関数                               | フロントから呼ぶ場合                          |
| --------------------------------------- | --------------------------------------------- |
| `version()`                             | `version()`                                   |
| `evaluate_hands_ranking(hands, board)`  | `evaluateHandsRanking({ hands, board })`      |
| `simulate_vs_list_with_ranks(...)`      | `simulateVsListWithRanks({ ... })`            |
| `simulate_vs_list_equity(...)`          | `simulateVsListEquity({ ... })`               |
| `simulate_range_vs_range_equity(...)`   | `simulateRangeVsRangeEquity({ ... })`         |
| `parse_range_to_hands(range, excluded)` | `parseRangeToHands({ range, excludedCards })` |

カード文字列はランク (`2-9, T, J, Q, K, A`) とスート (`s, h, d, c`) の連結。
連結形 (`AsKsQsJsTs`)、空白区切り (`As Ks Qs Js Ts`) どちらも受ける。
ハンドのリストはセミコロン区切り (`"AsKs; QdJd; ..."`)。

## TypeScript から使う

直接 `pkg/` を import せず、必ずラッパ経由で呼ぶ。

```ts
import {
  evaluateHandsRanking,
  simulateVsListWithRanks,
} from "@/lib/wasm-v2/simulation";

const ranking = await evaluateHandsRanking({
  hands: [
    ["As", "Ks"],
    ["Qd", "Jd"],
  ],
  board: ["7s", "8h", "9d"],
});
```

## 依存

- `wasm-bindgen` / `serde-wasm-bindgen`
- `rs_poker` (default features off)
- `rand` 0.10 + `rand_chacha` 0.10（シード付き MC 用）
- `getrandom` 0.4 (`wasm_js` feature)

## 注意

- `wasm-opt` のバージョンが古いと bulk memory ops でエラーになるため、
  `Cargo.toml` の `[package.metadata.wasm-pack.profile.release]` で `--enable-bulk-memory` を渡している。
- `src/lib/wasm-v2/pkg/` 配下は `wasm-pack` 生成物。Git にはコミットせず、ビルド時に生成する想定。
