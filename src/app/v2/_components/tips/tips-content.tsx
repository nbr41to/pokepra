import { BookText, Club } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shadcn/button";
import { TabsContent } from "@/components/shadcn/tabs";
import { PageTitle } from "@/components/ui/page-title";
import { NavigationSection } from "../navigation-section";

export function TipsContent() {
  return (
    <TabsContent
      value="tips"
      className="relative flex w-full flex-col items-center gap-y-16"
    >
      <BookText
        size={160}
        className="fixed top-3 left-0 -z-10 -rotate-12 text-muted-foreground brightness-200 dark:brightness-20"
      />
      <Club
        size={320}
        fill="currentColor"
        strokeWidth={3}
        className="fixed right-0 bottom-20 -z-10 translate-x-1/5 rotate-12 text-green-400 dark:text-green-950"
      />
      <PageTitle
        title="Tips"
        description="このアプリとポーカーに関する知識をまとめました。"
      />

      <NavigationSection title="Guide" description="はじめて使う方へ">
        <div className="flex flex-col items-center justify-center gap-y-3">
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/v2">ポーカーのルール説明</Link>
          </Button>
        </div>
      </NavigationSection>

      <NavigationSection title="Knowledge" description="用語・基本知識">
        <div className="flex flex-col items-center justify-center gap-y-3">
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/v2">役一覧とキッカー</Link>
          </Button>
        </div>
      </NavigationSection>

      <NavigationSection title="やさしいゲーム理論" description="GTO">
        <div className="flex flex-col items-center justify-center gap-y-3">
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/v2">ナッシュ均衡を感じる</Link>
          </Button>
        </div>
      </NavigationSection>
    </TabsContent>
  );
}
