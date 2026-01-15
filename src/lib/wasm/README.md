# WASM module overview

This folder contains two kinds of WASM entry points:

- Worker-backed APIs (run in `simulation.worker.ts` via `wasm-worker-client`)
  - `simulateVsListEquity`
  - `simulateVsListEquityWithProgress`
  - `simulateVsListWithRanks`
  - `simulateVsListWithRanksWithProgress`
  - `simulateRankDistribution`
  - `simulateRankDistributionWithProgress`
- Main-thread APIs (run via `loadWasm` directly)
  - `evaluateHandsRanking`
  - `parseRangeToHands`

Implementation notes:
- `*-core.ts` files are the main-thread WASM callers.
- Worker requests are defined in `simulation.worker.ts`.
- Exports are centralized in `simulation.ts`.
