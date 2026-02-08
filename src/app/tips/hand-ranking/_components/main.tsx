import { PlayCard } from "@/components/play-card";
import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";
import { cn } from "@/lib/utils";

const HAND_RANKINGS: { name: string; cards: string[]; summary: string }[] = [
  {
    name: "1. ロイヤルフラッシュ",
    cards: ["As", "Ks", "Qs", "Js", "Ts"],
    summary: "A-K-Q-J-T の同じスート。最強。",
  },
  {
    name: "2. ストレートフラッシュ",
    cards: ["9h", "8h", "7h", "6h", "5h"],
    summary: "連続した5枚 + 同じスート。",
  },
  {
    name: "3. フォーカード",
    cards: ["Ac", "Ad", "Ah", "As", "7d"],
    summary: "同じ数字4枚 + 余り1枚。",
  },
  {
    name: "4. フルハウス",
    cards: ["Kh", "Kd", "Ks", "2c", "2d"],
    summary: "スリーカード + ワンペア。",
  },
  {
    name: "5. フラッシュ",
    cards: ["Ah", "Jh", "8h", "5h", "2h"],
    summary: "同じスート5枚（連続でなくてOK）。",
  },
  {
    name: "6. ストレート",
    cards: ["9c", "8d", "7s", "6h", "5c"],
    summary: "連続した5枚（スートは不問）。",
  },
  {
    name: "7. スリーカード",
    cards: ["Qh", "Qd", "Qs", "Ac", "4d"],
    summary: "同じ数字3枚 + 余り2枚。",
  },
  {
    name: "8. ツーペア",
    cards: ["Jh", "Jc", "4s", "4d", "Ac"],
    summary: "2つのワンペア + 余り1枚。",
  },
  {
    name: "9. ワンペア",
    cards: ["Th", "Td", "As", "8c", "4d"],
    summary: "同じ数字2枚 + 余り3枚。",
  },
  {
    name: "10. ハイカード",
    cards: ["As", "Jd", "9c", "5h", "3d"],
    summary: "どの役もできていない状態。",
  },
];

const KICKER_RULES = [
  "ワンペア: ペアが同じとき、残り3枚の高い順で比較。",
  "ツーペア: 上のペア→下のペア→残り1枚で比較。",
  "スリーカード: 3枚組が同じとき、残り2枚で比較。",
  "フォーカード: 4枚組が同じとき、残り1枚で比較。",
  "ストレート/ストレートフラッシュ: 先頭カードで比較（A2345は5ハイ）。",
  "フルハウス: 3枚組→ペアの順で比較（キッカーなし）。",
  "ロイヤルフラッシュ: 同じなら常に引き分け。",
  "ボード5枚が最強のとき: 手札に関係なく引き分け。",
] as const;

type ShowdownProps = {
  title: string;
  board: string[];
  hero: string[];
  villain: string[];
  result: string;
  winner: "hero" | "villain" | "split";
};

const CardRow = ({ cards }: { cards: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {cards.map((card) => (
      <PlayCard key={card} rs={card} size="sm" />
    ))}
  </div>
);

const ShowdownExample = ({
  title,
  board,
  hero,
  villain,
  result,
  winner,
}: ShowdownProps) => (
  <div className="rounded-md border bg-background/40 p-3">
    <p className="mb-2 font-medium text-sm">{title}</p>
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-16 text-muted-foreground">ボード</span>
        <CardRow cards={board} />
      </div>
      <div
        className={cn(
          "px-1.5",
          winner === "hero" &&
            "rounded border border-emerald-500/60 bg-emerald-50/60 p-1 dark:bg-emerald-950/30",
          winner === "split" &&
            "rounded border border-sky-500/60 bg-sky-50/60 p-1 dark:bg-sky-950/30",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-16 text-muted-foreground">あなた</span>
          <CardRow cards={hero} />
          {winner === "hero" && (
            <span className="rounded bg-emerald-600 px-2 py-0.5 font-semibold text-[10px] text-white">
              WIN
            </span>
          )}
          {winner === "split" && (
            <span className="rounded bg-sky-600 px-2 py-0.5 font-semibold text-[10px] text-white">
              SPLIT
            </span>
          )}
        </div>
      </div>
      <div
        className={cn(
          "px-1.5",
          winner === "villain" &&
            "rounded border border-rose-500/60 bg-rose-50/60 p-1 dark:bg-rose-950/30",
          winner === "split" &&
            "rounded border border-sky-500/60 bg-sky-50/60 p-1 dark:bg-sky-950/30",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-16 text-muted-foreground">相手</span>
          <CardRow cards={villain} />
          {winner === "villain" && (
            <span className="rounded bg-rose-600 px-2 py-0.5 font-semibold text-[10px] text-white">
              WIN
            </span>
          )}
          {winner === "split" && (
            <span className="rounded bg-sky-600 px-2 py-0.5 font-semibold text-[10px] text-white">
              SPLIT
            </span>
          )}
        </div>
      </div>
    </div>
    <p className="mt-2 text-sm">{result}</p>
  </div>
);

export const Main = () => {
  return (
    <section className="space-y-4">
      <TipsText>
        まずは「役の強さ」と「その役を作る5枚」をセットで覚えるのが近道です。
      </TipsText>

      <TipsCard className="space-y-4">
        <h2 className="font-semibold">役一覧（強い順）</h2>
        <div className="space-y-3">
          {HAND_RANKINGS.map((hand) => (
            <div
              key={hand.name}
              className="rounded-md border bg-background/40 p-3"
            >
              <p className="font-medium text-sm">{hand.name}</p>
              <p className="mt-1 text-muted-foreground text-xs">
                {hand.summary}
              </p>
              <div className="mt-2">
                <CardRow cards={hand.cards} />
              </div>
            </div>
          ))}
        </div>
      </TipsCard>

      <TipsCard className="space-y-3">
        <h2 className="font-semibold">同じ役になったらどうなる？</h2>
        <TipsText>
          相手と同じ役になった場合は、
          <strong className="mx-1 text-foreground">キッカー</strong>
          という概念で勝敗を決めることがあります。キッカーとは、役を構成する5枚のうち、役に使われなかった残りのカードのことです。
        </TipsText>
        <ShowdownExample
          title="実例: どちらもKと8のツーペア"
          board={["Kh", "8d", "8s", "2c", "4h"]}
          hero={["Kc", "Ad"]}
          villain={["Kd", "Qd"]}
          result="ペア部分が同じなので、最後の1枚（AとQ）を比べて、あなたの勝ちになります。"
          winner="hero"
        />
        <ShowdownExample
          title="実例: ボードで2と4のツーペア"
          board={["2c", "2d", "4s", "8h", "4c"]}
          hero={["Kc", "Qd"]}
          villain={["Ac", "Td"]}
          result="2と4のツーペアにそれぞれのハンドの強いカードがキッカーとなり、相手のAがキッカー勝ちになります。"
          winner="villain"
        />
      </TipsCard>

      <TipsCard className="space-y-3">
        <h2 className="font-semibold">キッカーの補足（混乱しやすい点）</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {KICKER_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </TipsCard>

      <TipsCard className="space-y-3">
        <h2 className="font-semibold">引き分けになる例</h2>
        <ShowdownExample
          title="実例: ボードがそのまま最強5枚"
          board={["Ah", "Kh", "Qh", "Jh", "Th"]}
          hero={["2c", "2d"]}
          villain={["9s", "9d"]}
          result="ボードだけでロイヤルフラッシュ。全員同じ5枚を使うため引き分け。"
          winner="split"
        />
      </TipsCard>
    </section>
  );
};
