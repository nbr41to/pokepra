# WASM モジュール概要

このフォルダには、WASM のエントリーポイントが2系統あります。

## Worker 経由 API (`simulation/simulation.worker.ts` を `wasm-worker-client` から呼ぶ)

Equity / ranks:
- `simulateVsListEquity`: hero vs list の勝率（`onProgress` がある時のみ進捗 / `include.data: true` で詳細データ）
- `simulateVsListWithRanks`: hero vs list の役内訳つき（進捗なし）
- `simulateVsListWithRanksWithProgress`: hero vs list の役内訳つき（進捗あり）
- `simulateVsListWithRanksTrace`: hero vs list のトレース出力（モンテカルロ）
- `simulateRangeVsRangeEquity`: range vs range の勝率（進捗なし）
- `simulateRangeVsRangeEquityWithProgress`: range vs range の勝率（進捗あり）

Distribution:
- `simulateRankDistribution`: 複数ハンドの役分布（進捗なし）
- `simulateRankDistributionWithProgress`: 複数ハンドの役分布（進捗あり）

## Main-thread 直叩き API (`loadWasm` で直接呼ぶ)

Utilities:
- `evaluateHandsRanking`: ボードに対する複数ハンドの評価と順位付け
- `parseRangeToHands`: レンジ文字列を具体的なハンドへ展開

実装メモ:
- `simulation/*.ts` に worker API と worker エントリ
- `simulation/*-core.ts` は worker が使う WASM 直呼び
- `utils/*.ts` は worker を使わない WASM ユーティリティ
- エクスポートは `simulation.ts` に集約
