# WASM モジュール概要

このフォルダには、WASM のエントリーポイントが2系統あります。

## Worker 経由 API (`simulation/simulation.worker.ts` を `wasm-worker-client` から呼ぶ)

Equity / ranks:
- `simulateVsListEquity`: hero vs list の勝率（`onProgress` がある時のみ進捗 / `include.data: true` で詳細データ）
- `simulateVsListWithRanks`: hero vs list の役内訳つき（`onProgress` がある時のみ進捗）
- `simulateVsListWithRanksTrace`: hero vs list のトレース出力（モンテカルロ）
- `simulateRangeVsRangeEquity`: range vs range の勝率（`onProgress` がある時のみ進捗）

Distribution:
- `simulateRankDistribution`: 複数ハンドの役分布（`onProgress` がある時のみ進捗）

## Main-thread 直叩き API (`loadWasm` で直接呼ぶ)

Utilities:
- `evaluateHandsRanking`: ボードに対する複数ハンドの評価と順位付け
- `parseRangeToHands`: レンジ文字列を具体的なハンドへ展開

実装メモ:
- `simulation/*.ts` に worker API と worker エントリ
- `simulation/*-core.ts` は worker が使う WASM 直呼び
- `utils/*.ts` は worker を使わない WASM ユーティリティ
- エクスポートは `simulation.ts` に集約
