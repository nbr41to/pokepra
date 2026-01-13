# Pokepra


## Todo
- Tipsページ
    - 操作方法
    - スコアの計算方法
- 設定項目
    - カードの裏面
    - カードのめくり方
    - レンジ表
- モーダル系のボタンを下に
- レンジ全体のEVの算出を可能に
- 自分だけのレンジ表を設定可能に
- BET額で相手のハンドを絞り込むゲーム（FEの練習）

## Memo
- `@types/bun` は bun test用

## 用語の定義と規約
- Game関連
    - card(playCard): カード1枚
    - suit: スート（ハート、ダイヤ、クラブ、スペード）
    - rank(cardRank): カードのランク（2 ~ A）
    - hand: プレイヤーの手札（2枚）
    - rank: 役
    - hero: 自分のhand
    - villain: 相手のhand
    - board: 共有カード（3 ~ 5枚）
    - deck: 残りのカード群
    - street: ゲームの進行段階（preflop, flop, turn, river）
    - people: 対戦人数
    - position: 座席位置（1 ~ 9）
    - pot: ポット（賭け金の合計）
- Analytics関連
    - trial: シミュレーション1回分
    - result: シミュレーション結果
    - combo: hand の組み合わせパターン
    - eq(equity): 勝率
    - ev(expectValue): 期待値
    - handStrength: hand の強さ（rankの強さではない）

## パフォーマンス改善の Knowledge
なぜここまでパフォーマンスが変わるのか（調査まとめ）

評価ロジックの差
旧実装: 7枚から 5枚の全組み合わせ（21通り）を毎回評価して最大を求める
MonteCarloGame: Rankable::rank() の最適化済みロジック + bitset を使う（組み合わせ列挙なし）
デッキ/手札の扱い
旧実装: ループ毎にデッキの clone/shuffle/board 填充が発生
MonteCarloGame: FlatDeck を内部で再利用し、必要に応じてシャッフル（shuffle_if_needed）
メモリアロケーション
旧実装: trial 毎に Vec/配列の組み立てが多く、WASM だと相対的に重い
MonteCarloGame: 事前に Hand を作って reset() で再利用
キャッシュ効率
bitset ベースの Rank は CPU キャッシュに優しく、WASM で特に効く傾向
このため、rank 判定＋デッキ運用が軽量化されるほど MonteCarloGame が優位になります。

次のステップ案

UI 側で旧/新の結果が許容範囲か確認
progress 版も MonteCarloGame で欲しいなら設計相談