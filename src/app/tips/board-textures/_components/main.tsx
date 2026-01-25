"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/shadcn/button";
import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";
import type { BoardCondition } from "@/utils/board";
import { generateBoardByConditions } from "@/utils/board";

type BoardType = {
  id: BoardCondition;
  title: string;
  texture: "ドライ" | "ウェット" | "中間";
  description: string;
  tip: string;
};

const BOARD_TYPES: BoardType[] = [
  {
    id: "pair",
    title: "ペア",
    texture: "ドライ",
    description: "ボードに同ランクがあり、トップペアの価値が下がる。",
    tip: "トリップス/フルハウスの可能性を意識して慎重に。",
  },
  {
    id: "monotone",
    title: "モノトーン",
    texture: "ウェット",
    description: "同じスートが3枚。フラッシュドローが完成しやすい。",
    tip: "強いフラッシュ/セットは大きく、ワンペアは慎重に。",
  },
  {
    id: "two-tone",
    title: "ツートーン",
    texture: "ウェット",
    description: "同じスートが2枚。フラッシュドローが残る。",
    tip: "ターンでのフラッシュ完成を意識してサイズ調整。",
  },
  {
    id: "rainbow",
    title: "レインボー",
    texture: "ドライ",
    description: "スートが全て異なる。フラッシュドローが存在しない。",
    tip: "ドローが少ないため、強いワンペアでも押せる場面が多い。",
  },
  {
    id: "connected",
    title: "コネクト",
    texture: "ウェット",
    description: "ストレートに繋がりやすい並び。",
    tip: "ストレート完成の可能性が多いので薄い勝ち目は警戒。",
  },
  {
    id: "high",
    title: "ハイボード",
    texture: "中間",
    description: "10以上が1〜3枚。ブロードウェイとの相性が高い。",
    tip: "強いトップペアが生まれやすい反面、強いキッカーに注意。",
  },
  {
    id: "low",
    title: "ローボード",
    texture: "ドライ",
    description: "3枚とも8以下。レンジ優位を活かせることが多い。",
    tip: "相手が当たりにくい一方で、ストレートドローには注意。",
  },
];

export const Main = () => {
  const buildBoardExample = (condition: BoardCondition) =>
    generateBoardByConditions({ conditions: condition, count: 3 });

  const [examples, setExamples] = useState<Record<string, string[]>>(() => {
    try {
      const next: Record<string, string[]> = {};
      for (const boardType of BOARD_TYPES) {
        next[boardType.id] = buildBoardExample(boardType.id);
      }
      return next;
    } catch (_caught) {
      return {};
    }
  });
  const [error, setError] = useState<string | null>(null);

  const reloadExample = (condition: BoardCondition) => {
    try {
      setExamples((prev) => ({
        ...prev,
        [condition]: buildBoardExample(condition),
      }));
    } catch (caught) {
      setError((caught as Error).message);
    }
  };

  const textureBadgeClass = (texture: BoardType["texture"]) => {
    switch (texture) {
      case "ウェット":
        return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200";
      case "ドライ":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/40 dark:bg-slate-500/10 dark:text-slate-100";
    }
  };

  return (
    <section className="space-y-4">
      <TipsCard size="sm" className="space-y-2 shadow-none">
        <TipsText>
          ドライはドローが少なく読みやすいボード、ウェットはドローが多く
          変化が起きやすいボードを指します。ウェットではサイズ管理や
          バリュー/ブラフのバランスが重要になります。
        </TipsText>
      </TipsCard>
      <TipsText>
        代表的なボードの種類をまとめました。ドライ/ウェットの目安と、
        簡単なプレイの意識ポイントも確認できます。
      </TipsText>
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        {BOARD_TYPES.map((boardType) => {
          const cards = examples[boardType.id] ?? [];
          return (
            <TipsCard key={boardType.id} size="sm" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{boardType.title}</h2>
                <span
                  className={`rounded-full border px-3 py-1 text-xs ${textureBadgeClass(
                    boardType.texture,
                  )}`}
                >
                  {boardType.texture}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                {boardType.description}
              </p>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex items-center gap-2">
                  {cards.length === 0 ? (
                    <span className="text-muted-foreground text-xs">
                      例を生成できませんでした
                    </span>
                  ) : (
                    cards.map((card) => (
                      <PlayCard key={card} rs={card} size="sm" />
                    ))
                  )}
                </div>
                <Button
                  className="rounded-full"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => reloadExample(boardType.id)}
                >
                  <RotateCcw />
                </Button>
              </div>
              <p className="text-sm">{boardType.tip}</p>
            </TipsCard>
          );
        })}
      </div>
    </section>
  );
};
