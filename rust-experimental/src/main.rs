use pokepra_rust_experimental::simulate_heads_up_example;

fn main() {
    // rust-experimental は WASM 化せず、Rust の関数を直接呼び出して挙動を試す場所です。
    // ここではサンプルとして、Player 2 が毎回 100BB all-in し、
    // Player 1 が rs-poker の CFR 系 API を使った簡略戦略で fold / all-in を選ぶ試行を
    // 100 回走らせ、勝敗数・fold 数・合計損益・各ハンドの詳細を標準出力に表示します。
    let result = simulate_heads_up_example();
    println!("{result}");
}
