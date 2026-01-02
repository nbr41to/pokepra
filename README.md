# Pokepra

## Memo
- `@types/bun` は bun test用

 ## Score

 OK。いまの iterateSimulations が返しているのは 「役カテゴリ（rank=1〜9）の回数分布」 なので、そこから作れる“正確な強さ”は基本的に カテゴリ粒度までです（＝ワンペア内の Aキッカー vs 9キッカーは区別できない）。
なので「キッカーをスターティングハンド勝率で補う」前提で、ランキング用途として破綻しにくいスコアを作るなら、次の3要素を混ぜるのが安定です。
	1.	その役になる確率（probability）
	2.	役カテゴリの強さ（rank）
	3.	**同役内の強弱（キッカー proxy）**としての preflop equity
	4.	（任意）**“その役が珍しいほど加点”**する正規化（ベースライン確率との対数比）

⸻

提案するスコア（実装しやすくて壊れにくい形）

役カテゴリのベースライン確率（正規化用）

7枚（ホール2＋ボード5）での役カテゴリ確率の例は Wizard of Odds にまとまっています。 ￼
（あなたの rank の割り当てが「1=ハイカード … 9=ストレートフラッシュ」だと仮定）
	•	High card: 0.17411920
	•	One pair: 0.43822546
	•	Two pair: 0.23495536
	•	Trips: 0.04829870
	•	Straight: 0.04619382
	•	Flush: 0.03025494
	•	Full house: 0.02596102
	•	Quads: 0.00168067
	•	Straight flush（royal含む）: 0.00031083 (= 0.00003232 + 0.00027851)  ￼

※もし rank の並びが逆（1が最強）なら、後述の BASELINE_BY_RANK を逆にしてください。

⸻

TypeScript の計算例（あなたの該当箇所にそのまま入れられる）

const EPS = 1e-9;

// rank: 1(High) ... 9(StraightFlush) を想定
const BASELINE_BY_RANK: Record<number, number> = {
  1: 0.17411920, // High card (Ace high or less)
  2: 0.43822546, // One pair
  3: 0.23495536, // Two pair
  4: 0.04829870, // Trips
  5: 0.04619382, // Straight
  6: 0.03025494, // Flush
  7: 0.02596102, // Full house
  8: 0.00168067, // Quads
  9: 0.00031083, // Straight flush (incl. royal)
};

// 係数：まずはこの辺から（後でランキングの見た目で微調整）
const ALPHA_EQUITY = 0.35; // キッカー(proxy)の効かせ具合
const BETA_RARITY = 0.12;  // “珍しさ”補正（大きくしすぎ注意）

// 0..1 に正規化
const probability = cur.count / ITERATE_COUNT;

// rank 1..9 を 0..1 に正規化（役カテゴリの強さ）
const rankStrength = (cur.rank - 1) / 8;

// preflop equity 0..100 を 0..1 に（無ければ 0.5 扱い）
const equity01 = ((handEquity?.equity ?? 50) / 100);

// 「同役内の強さ」扱いにするため 0.5 を中心に（強いほど +、弱いほど -）
const kickerProxy = equity01 - 0.5;

// その役が “平均より出やすい/出にくい” を対数比で補正（正規化）
const baseline = BASELINE_BY_RANK[cur.rank] ?? (1 / 9);
const rarityBonus = Math.log((probability + EPS) / (baseline + EPS));

// その役になった時の価値（カテゴリ + キッカーproxy）
// ※カテゴリ強度に確率を掛けて期待値にして足す
const valueWhenOccurs = rankStrength + ALPHA_EQUITY * kickerProxy + BETA_RARITY * rarityBonus;

// reduce の中で加算
return acc + probability * valueWhenOccurs;

これで何が良くなる？
	•	cur.count * cur.rank みたいに 試行回数に依存してスコアが暴れるのが止まります（確率で正規化するので）。
	•	同じ “ワンペア” でも、handEquity が高いハンドが上に来やすくなり、疑似的にキッカー差を反映できます。
	•	rarityBonus で「めったに起きない強役を、ちゃんと強く扱う」方向に寄せられます（ベースラインとの差で正規化）。 ￼

⸻

重要：これ以上“正確”にしたいなら、ここが限界点

この方法は **役カテゴリ分布 + preflop equity（proxy）**なので、次はどうしても頭打ちです：
	•	ボードが強烈なとき（例：ボードが AAKKQ みたいな状況）に 同役内の差が preflop equity とズレる
	•	相手レンジやブロッカーの影響（As持ち等）が直接は入らない

本当に正確にやるなら、スコアは 勝率（HS） にするのが王道で、フロップ/ターンなら EHS（将来の捲り/捲られ込み）にします。EHS の定義はこの形です：EHS = HS*(1-NPOT) + (1-HS)*PPOT  ￼
（ただしこれは iterateSimulations が「勝ち/負け/引き分け」を返す必要があるので、関数側の改修が必要）

⸻

必要なら次のステップとして、
	•	iterateSimulations の返り値に win/tie/lose を追加して HS を直接スコア化
	•	さらにフロップ/ターン用に PPOT/NPOT まで取って EHS 化

まで、あなたの既存コード構造（Next.js server action）に合わせて具体的にパッチ案を書きます。