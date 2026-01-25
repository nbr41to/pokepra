"use client";

import { useState } from "react";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Separator } from "@/components/shadcn/separator";
import { Slider } from "@/components/shadcn/slider";
import { PageTitle } from "@/components/ui/page-title";

export default function Page() {
  const [pot, setPot] = useState(100);
  const [betSize, setBetSize] = useState(10);
  const [heroWinRate, setHeroWinRate] = useState(60);
  const [villainWinRate, setVillainWinRate] = useState(40);

  const toPct = (value: number) =>
    Number.isNaN(value) ? 0 : Math.max(0, Math.min(100, value));
  const heroPct = toPct(heroWinRate);
  const villainPct = toPct(villainWinRate);
  const ev = (heroPct / 100) * (pot + betSize) - (villainPct / 100) * betSize;

  return (
    <>
      <PageTitle
        title="ベットサイズと必要勝率"
        description="ポットに対してどれくらいのベットをしたときに、どれくらいの勝率が必要になるかを計算します。これは、相手のベットに対して自分の勝率が足りているかや、自分がベットするときに相手に突きつける必要勝率の計算に使用できます。また、ついでにそのときのEVも計算します。"
        hidable
      />

      <div className="space-y-2">
        <Label>ポットサイズ</Label>
        <Input
          type="number"
          value={pot}
          onChange={(e) => setPot(Number(e.target.value))}
          className="w-24"
        />

        <Label>ベットサイズ</Label>
        <div className="flex items-center gap-x-2">
          <strong>{betSize}</strong>
          <Slider
            value={[betSize]}
            onValueChange={(value) => setBetSize(value[0])}
            max={pot * 3}
            step={5}
            className="w-full max-w-xs sm:w-48"
          />
        </div>
      </div>

      <div className="text-sm">
        ポットサイズ:{" "}
        <strong>
          {pot + betSize}（{pot} + {betSize}）
        </strong>
      </div>

      <div className="space-y-2">
        <Label>要求する勝率</Label>
        <div className="flex items-center gap-x-2">
          <strong>{((betSize / (pot + betSize)) * 100).toFixed(1)}%</strong>
          <Slider
            value={[(betSize / (pot + betSize)) * 100]}
            max={100}
            step={0.1}
            className="w-full max-w-xs sm:w-48"
          />
        </div>
        <p className="text-sm">必要勝率 = ベット / (ポット + ベット)</p>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>ついでにEVも計算</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>自分の勝率（%）</Label>
            <Input
              type="number"
              value={heroWinRate}
              onChange={(e) => setHeroWinRate(Number(e.target.value))}
              className="w-28"
            />
          </div>
          <div className="space-y-2">
            <Label>相手の勝率（%）</Label>
            <Input
              type="number"
              value={villainWinRate}
              onChange={(e) => setVillainWinRate(Number(e.target.value))}
              className="w-28"
            />
          </div>
        </div>
        <div className="text-sm">
          EV: <strong>{ev.toFixed(2)}</strong>
        </div>
        <p className="text-muted-foreground text-xs">
          EV = 自分の勝率 × (ポット + ベット) - 相手の勝率 × ベット
        </p>
      </div>
    </>
  );
}
