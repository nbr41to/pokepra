"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const Eq = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
    {children}
  </code>
);

const Block = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-2">
    <h3 className="font-bold text-sm">{title}</h3>
    <div className="space-y-1.5 text-muted-foreground text-xs leading-relaxed">
      {children}
    </div>
  </section>
);

/**
 * 各アクション評価で使用している計算式を一覧で示すTipsパネル。
 *
 * 内容:
 *  - Pot Odds / MDF / 必要エクイティの定義
 *  - 各アクションのEV計算式
 *  - villain応答の推定方法
 */
export const FormulaTips = ({ className }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1 text-xs", className)}
        >
          <Info className="size-3.5" />
          計算式
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>アクション評価に使われている計算式</SheetTitle>
          <SheetDescription>
            各アクションの推定EVは以下の数式で算出しています。chipsはBB単位ではなく
            生のchip値 (1BB = 100chips) で扱います。
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-5 px-1 pb-8">
          <Block title="記号">
            <div>
              <Eq>P</Eq> = 現在のポット（chip）　 <Eq>C</Eq> = toCall（chip）
            </div>
            <div>
              <Eq>S</Eq> = アクションの合計ベット額（chip） <Eq>E</Eq> = hero
              の対villain rangeエクイティ
            </div>
          </Block>

          <Block title="Pot Odds（コールの必要勝率）">
            <div>
              <Eq>PotOdds = C / (P + C)</Eq>
            </div>
            <div>
              コールに必要なchip C をpotで取り戻すために最低限必要な勝率。Eが
              PotOdds以上ならコール+EV。
            </div>
          </Block>

          <Block title="MDF（Minimum Defense Frequency）">
            <div>
              <Eq>MDF = P / (P + C)</Eq>
            </div>
            <div>
              villainのベットに対し、ブラフ均衡を成立させないために
              hero側が継続すべき頻度。
            </div>
          </Block>

          <Block title="Fold のEV">
            <div>
              <Eq>EV_fold = 0</Eq>
            </div>
            <div>既に投入したchipはsunk costなのでEV=0で正規化。</div>
          </Block>

          <Block title="Check のEV（postflop, C=0）">
            <div>
              <Eq>EV_check ≒ E · P</Eq>
            </div>
            <div>
              チェック時はベットフェーズがないため、概算として「ポット ×
              自分のエクイティ」をそのstreetの期待値とします。
            </div>
          </Block>

          <Block title="Call のEV（C &gt; 0）">
            <div>
              <Eq>EV_call = E · (P + C) − (1 − E) · C</Eq>
            </div>
            <div>
              勝ったとき (P+C) を獲得、負けたとき C を失う。 E ≥ PotOdds なら
              EV_call ≥ 0。
            </div>
          </Block>

          <Block title="Bet / Raise / All-in のEV">
            <div>
              villainの応答 (fold/call) はベットサイズに応じて per-hand
              エクイティから推定します。
            </div>
            <div className="rounded-md border bg-muted/40 p-2 font-mono text-[11px]">
              {`villainPotOdds = (S − C) / (P + 2S − C)
継続レンジ = { h ∈ villainRange | (1 − E_h) ≥ villainPotOdds }
foldFraction = 1 − |継続レンジ| / |villainRange|
E_called    = avg(E_h for h ∈ 継続レンジ)

EV_bet = foldFraction · P
       + (1 − foldFraction)
         · ( E_called · (P + 2S − C) − (1 − E_called) · (S − C) )`}
            </div>
            <div>
              villainは「自分のエクイティが必要勝率以上のhandだけcall」と仮定。
              ベットが大きいほどvillainの継続ハンドが厳選され、E_calledが下がります。
              これにより「ALL-INが常に最大EV」という偏りが解消され、
              ベットサイズに対する均衡解が現れます。
            </div>
          </Block>

          <Block title="グレード判定">
            <div>
              <Eq>EVloss = EV_best − EV_picked</Eq>
            </div>
            <div>
              ポット比 <Eq>EVloss / P</Eq> によって great (&lt;1%) / good
              (&lt;5%) / ok (&lt;15%) / bad (&lt;35%) / terrible (それ以上)
              に分類。
            </div>
          </Block>

          <Block title="エクイティ計算">
            <div>
              hero vs villainRange の各ハンドに対するエクイティは Rust + WASM
              のモンテカルロシミュレーション (<Eq>simulateVsListWithRanks</Eq>,
              デフォルトtrials=800) で算出しています。
            </div>
          </Block>

          <Block title="制約・前提">
            <div>
              ・villainは1人だけ存在するheads-upとしてモデル化（postflop）。
            </div>
            <div>
              ・villainはGTO風の「indifference
              call」をすると仮定（実プレイより少しタイト）。
            </div>
            <div>
              ・betがcallされた後の後続street
              EVは省略し、当該streetの期待値のみで評価。
            </div>
          </Block>
        </div>
      </SheetContent>
    </Sheet>
  );
};
