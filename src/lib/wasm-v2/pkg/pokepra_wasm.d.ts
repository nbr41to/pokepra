/* tslint:disable */
/* eslint-disable */

/**
 * ボードが確定している前提で、複数ハンドの役を評価し強い順に並べる。
 */
export function evaluate_hands_ranking(hands: string, board: string): any;

/**
 * レンジ式を全コンボに展開する。`excluded` に含まれるカードを使うコンボは弾く。
 */
export function parse_range_to_hands(range: string, excluded: string): any;

/**
 * hero レンジ vs villain レンジの MC シミュレーション。
 */
export function simulate_range_vs_range_equity(
  hero_range: string,
  villain_range: string,
  board: string,
  trials: number,
  seed: bigint,
): any;

/**
 * hero vs 相手リストの MC シミュレーション（役分布なし、equity のみ）。
 */
export function simulate_vs_list_equity(
  hero: string,
  board: string,
  compare: string,
  trials: number,
  seed: bigint,
  include_data: boolean,
): any;

/**
 * hero 1 ハンド vs 相手ハンドリストのヘッズアップ MC シミュレーション。
 */
export function simulate_vs_list_with_ranks(
  hero: string,
  board: string,
  compare: string,
  trials: number,
  seed: bigint,
): any;

/**
 * クレートのバージョン文字列。動作確認用。
 */
export function version(): string;

export type InitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly evaluate_hands_ranking: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly parse_range_to_hands: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly simulate_range_vs_range_equity: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: bigint,
  ) => void;
  readonly simulate_vs_list_equity: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: bigint,
    j: number,
  ) => void;
  readonly simulate_vs_list_with_ranks: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: bigint,
  ) => void;
  readonly version: (a: number) => void;
  readonly __wbindgen_export: (a: number, b: number) => number;
  readonly __wbindgen_export2: (
    a: number,
    b: number,
    c: number,
    d: number,
  ) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export3: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(
  module: { module: SyncInitInput } | SyncInitInput,
): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?:
    | { module_or_path: InitInput | Promise<InitInput> }
    | InitInput
    | Promise<InitInput>,
): Promise<InitOutput>;
