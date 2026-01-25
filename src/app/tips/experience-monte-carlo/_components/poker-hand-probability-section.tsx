"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/shadcn/button";
import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";
import { CARD_RANK_ORDER, getAllCards } from "@/utils/card";

const TRIALS = 1_000_000;
const CHUNK_SIZE = 10_000;

const CATEGORY_ORDER = [
  "Royal Flush",
  "Straight Flush",
  "Four of a Kind",
  "Full House",
  "Flush",
  "Straight",
  "Three of a Kind",
  "Two Pair",
  "One Pair",
  "High Card",
] as const;

type Category = (typeof CATEGORY_ORDER)[number];

const THEORETICAL_PCT: Record<Category, number> = {
  "Royal Flush": 0.0032,
  "Straight Flush": 0.0279,
  "Four of a Kind": 0.168,
  "Full House": 2.6,
  Flush: 3.03,
  Straight: 4.62,
  "Three of a Kind": 4.83,
  "Two Pair": 23.5,
  "One Pair": 43.8,
  "High Card": 17.4,
};

const emptyCounts = () =>
  Object.fromEntries(CATEGORY_ORDER.map((name) => [name, 0])) as Record<
    Category,
    number
  >;

const suitIndex = (suit: string) => {
  switch (suit) {
    case "s":
      return 0;
    case "h":
      return 1;
    case "d":
      return 2;
    case "c":
      return 3;
    default:
      return 0;
  }
};

const straightHigh = (mask: number) => {
  for (let high = 12; high >= 4; high -= 1) {
    const window = ((1 << 5) - 1) << (high - 4);
    if ((mask & window) === window) return high + 2;
  }
  const wheel = (1 << 12) | 0b1111;
  if ((mask & wheel) === wheel) return 5;
  return null;
};

const evaluateCategory = (cards: string[]): Category => {
  const rankCounts = new Array(15).fill(0);
  const suitCounts = new Array(4).fill(0);
  const suitMasks = new Array(4).fill(0);
  let rankMask = 0;

  for (const card of cards) {
    const rankChar = card[0] ?? "";
    const suitChar = card[1] ?? "";
    const rankValue = CARD_RANK_ORDER[rankChar] ?? 0;
    const suit = suitIndex(suitChar);
    rankCounts[rankValue] += 1;
    suitCounts[suit] += 1;
    if (rankValue >= 2) {
      const bit = 1 << (rankValue - 2);
      rankMask |= bit;
      suitMasks[suit] |= bit;
    }
  }

  let straightFlushHigh: number | null = null;
  for (let i = 0; i < suitCounts.length; i += 1) {
    if (suitCounts[i] < 5) continue;
    const high = straightHigh(suitMasks[i]);
    if (
      high !== null &&
      (straightFlushHigh === null || high > straightFlushHigh)
    ) {
      straightFlushHigh = high;
    }
  }
  if (straightFlushHigh !== null) {
    return straightFlushHigh === 14 ? "Royal Flush" : "Straight Flush";
  }

  let threeCount = 0;
  let pairCount = 0;
  for (let rank = 2; rank <= 14; rank += 1) {
    const count = rankCounts[rank] ?? 0;
    if (count === 4) return "Four of a Kind";
    if (count === 3) threeCount += 1;
    if (count === 2) pairCount += 1;
  }

  if (threeCount >= 1 && (pairCount >= 1 || threeCount >= 2)) {
    return "Full House";
  }

  if (suitCounts.some((count) => count >= 5)) {
    return "Flush";
  }

  if (straightHigh(rankMask) !== null) {
    return "Straight";
  }

  if (threeCount >= 1) return "Three of a Kind";
  if (pairCount >= 2) return "Two Pair";
  if (pairCount === 1) return "One Pair";
  return "High Card";
};

export const PokerHandProbabilitySection = () => {
  const [counts, setCounts] = useState<Record<Category, number>>(emptyCounts);
  const [completed, setCompleted] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const stopRef = useRef(false);
  const deck = useMemo(() => getAllCards(), []);

  const reset = () => {
    setCounts(emptyCounts());
    setCompleted(0);
    setElapsedMs(0);
  };

  const run = () => {
    reset();
    setRunning(true);
    stopRef.current = false;
    const localCounts = emptyCounts();
    let localCompleted = 0;
    const start = performance.now();

    const step = () => {
      if (stopRef.current) {
        setRunning(false);
        return;
      }
      const loopStart = performance.now();
      for (let i = 0; i < CHUNK_SIZE && localCompleted < TRIALS; i += 1) {
        for (let j = deck.length - 1; j > 0; j -= 1) {
          const k = Math.floor(Math.random() * (j + 1));
          const tmp = deck[j];
          deck[j] = deck[k];
          deck[k] = tmp;
        }
        const category = evaluateCategory(deck.slice(0, 7));
        localCounts[category] += 1;
        localCompleted += 1;
      }
      setCounts({ ...localCounts });
      setCompleted(localCompleted);
      setElapsedMs(performance.now() - start);

      if (localCompleted < TRIALS) {
        const budget = performance.now() - loopStart;
        if (budget < 12) {
          requestAnimationFrame(step);
        } else {
          setTimeout(step, 0);
        }
      } else {
        setRunning(false);
      }
    };

    requestAnimationFrame(step);
  };

  const stop = () => {
    stopRef.current = true;
  };

  const rows = CATEGORY_ORDER.map((category) => {
    const count = counts[category] ?? 0;
    const pct = completed === 0 ? 0 : (count / completed) * 100;
    const theoretical = THEORETICAL_PCT[category] ?? 0;
    return { category, count, pct, theoretical };
  });

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <TipsText>
          試行回数を増やすほど、結果は「理論上の確率」に近づいていくことがわかりました。
          そして、回数が多いほど運の偏りが平均化され、確率通りに出来事が発生するようになるということもわかりました。
        </TipsText>
        <TipsText>
          試しにポーカーの7枚で完成する役の確率をモンテカルロ法で体験してみましょう。
        </TipsText>
      </div>
      <div className="space-y-6">
        <TipsCard size="sm">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={run} disabled={running}>
              100万回シミュレーションする
            </Button>
            <Button variant="outline" onClick={stop} disabled={!running}>
              停止
            </Button>
            <TipsText asChild>
              <div>
                進捗 {completed.toLocaleString()} / {TRIALS.toLocaleString()} (
                {completed === 0 ? 0 : Math.floor((completed / TRIALS) * 100)}%)
              </div>
            </TipsText>
            <TipsText asChild>
              <div>経過 {Math.floor(elapsedMs / 1000)}s</div>
            </TipsText>
          </div>
        </TipsCard>

        <TipsCard size="sm">
          <h2 className="mb-3 font-semibold">役の出現回数（強い順）</h2>
          <div className="grid gap-2 text-xs">
            <div className="grid grid-cols-[1fr_90px_70px_70px] items-center gap-2 border-b pb-2 text-[11px] text-muted-foreground">
              <span>役</span>
              <span className="text-right">実測回数</span>
              <span className="text-right">実測%</span>
              <span className="text-right">理論%</span>
            </div>
            {rows.map(({ category, count, pct, theoretical }) => (
              <div
                key={category}
                className="grid grid-cols-[1fr_90px_70px_70px] items-center gap-2"
              >
                <span className="font-medium">{category}</span>
                <span className="text-right">{count.toLocaleString()} 回</span>
                <span className="text-right">{pct.toFixed(3)}%</span>
                <span className="text-right">{theoretical.toFixed(3)}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-muted-foreground text-xs">
            ※ロイヤルフラッシュはストレートフラッシュの最上位として別枠で集計しています。
          </p>
        </TipsCard>
      </div>
      <div className="space-y-2">
        <TipsText>
          100万回のシミュレーションを実行すると、各役の出現確率が理論上の確率に非常に近い値になることがわかります。
        </TipsText>
        <TipsText>
          モンテカルロポーカー（MCPT）は、このようなシミュレーターを提供します。
          加えて、これを使ってポーカーの確率や期待値を計算して、ゲームをしたり分析をしたりする機能を提供します。
        </TipsText>
      </div>
      <div className="flex justify-end">
        <Button asChild variant="link" className="rounded-full underline">
          <Link href="/tips/experience-monte-carlo-poker">
            モンテカルロ法を体験する2
            <ChevronRight />
          </Link>
        </Button>
      </div>
    </section>
  );
};
