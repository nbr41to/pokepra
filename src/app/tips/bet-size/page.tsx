"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function Page() {
  const [pot, setPot] = useState(100);
  const [betSize, setBetSize] = useState(10);

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="font-bold font-montserrat text-2xl">
          任意のポットに対するベット
        </h1>
      </header>
      <div className="space-y-2">
        <Label>ポットサイズ</Label>
        <Input
          type="number"
          value={pot}
          onChange={(e) => setPot(Number(e.target.value))}
          className="w-24"
        />
        <Label>ベットサイズ</Label>
        <div className="flex gap-x-2">
          <Slider
            value={[betSize]}
            onValueChange={(value) => setBetSize(value[0])}
            max={pot * 3}
            step={5}
            className="w-48"
          />
          <strong>{betSize}</strong>
        </div>
        <p>
          ポットサイズ: <strong>{pot + betSize}</strong>
        </p>

        <p>相手に要求するEV</p>
        <div className="flex gap-x-2">
          <Slider
            value={[(betSize / (pot + betSize)) * 100]}
            max={100}
            step={0.1}
            className="w-48"
          />
          <strong>{((betSize / (pot + betSize)) * 100).toFixed(1)}%</strong>
        </div>
        <p>
          ベットサイズ: <strong>{betSize}</strong> / ポットオッズ:{" "}
          <strong>{((betSize / (pot + betSize)) * 100).toFixed(1)}%</strong>
        </p>
      </div>
    </div>
  );
}
