import { Share, SquarePlus } from "lucide-react";
import Link from "next/link";
import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";

export const Main = () => {
  return (
    <div className="space-y-4">
      <TipsCard className="space-y-2">
        <h2 className="font-bold text-base">ホーム画面に追加して使う</h2>
        <TipsText className="text-slate-700 dark:text-slate-200">
          本ツールはブラウザで動作するのでダウンロード不要ですが、通常のブラウザだと狭くてUIが崩れることがあります。iPhoneであれば、Safariの
          共有ボタン（
          <Share size={16} className="mx-1 mb-1 inline-block" />
          のアイコン） を押して、「ホーム画面に追加
          <span>
            <SquarePlus size={16} className="mx-1 mb-1 inline-block" />
          </span>
          」でホームに追加してから開くことで、ネイティブアプリのように使用できます。
        </TipsText>
      </TipsCard>
      <TipsCard className="space-y-2">
        <h2 className="font-bold text-base">暗い場所ではダークモード</h2>
        <TipsText className="text-slate-700 dark:text-slate-200">
          アミューズメントポーカーなどの暗いところではダークモードにして使用することをおすすめします。右上の歯車のアイコンからいつでも切り替え可能です。
        </TipsText>
      </TipsCard>
      <TipsCard className="space-y-2">
        <h2 className="font-bold text-base">はじめの一歩</h2>
        <TipsText className="text-slate-700 dark:text-slate-200">
          はじめの一歩はモンテカルロ法の説明と体験のページから。
        </TipsText>
        <Link
          href="/tips/experience-monte-carlo-poker"
          className="inline-flex items-center text-slate-700 text-sm underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
        >
          モンテカルロ法の説明と体験へ
        </Link>
      </TipsCard>
    </div>
  );
};
