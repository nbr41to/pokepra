# rust-experimental

`rs_poker` を使ったアプリ向け機能を、WASM 化せず通常の Rust として直接試すための場所です。

```sh
cargo run --manifest-path rust-experimental/Cargo.toml
```

現在はサンプルとして、100BB ヘッズアップを 100 回実行した結果を出力します。

- 各ハンドでは `rs_poker::core::Deck::default()` から毎回異なる 2 人分のホールカードを配ります。
- Player 2 は毎回 100BB all-in します。
- Player 1 は `rs_poker` の `arena` / CFR 関連 API を使った簡略 fold/all-in 戦略で、fold するか call all-in するかを選びます。
- これは「Player 2 の 100BB shove に対して Player 1 が fold / all-in だけを選べる」実験用サブゲームです。NLHE 全体の完全な Nash 均衡ではありません。
