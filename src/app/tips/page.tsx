import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-y-8">
      <h1 className="font-bold font-montserrat text-2xl">POKER Tips</h1>
      <div className="flex flex-col items-center justify-center gap-y-3">
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/hand-probability">役が完成する確率</Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/starting-hand-winrate">
            スターティングハンドの勝率
          </Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/score-attack-scoring">
            スコアアタックの得点の計算方法
          </Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/bet-size">任意のポットに対するベットサイズ</Link>
        </Button>
      </div>
    </div>
  );
}
