import { HeaderTitle } from "@/components/header-title";

export default function Page() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-10">
      <HeaderTitle
        title="モンテカルロ法でポーカーを学ぶ"
        description="特定の状況以降のシミュレーションを大量に繰り返すことで勝率を算出するモンテカルロ法を体験してみましょう。"
      />
    </div>
  );
}
