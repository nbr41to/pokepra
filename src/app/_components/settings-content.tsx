import Link from "next/link";
import { HeaderTitle } from "@/components/header-title";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { SwitchDarkMode } from "./switch-dark-mode";

export function SettingsContent() {
  return (
    <TabsContent
      value="settings"
      className="flex w-full flex-col items-center gap-y-16"
    >
      <HeaderTitle title="Settings" description="設定用のページです。" />
      <SwitchDarkMode />

      <div className="flex w-full max-w-md items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-6 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <label
          htmlFor="range-table-setting"
          className="flex items-center gap-3 font-noto-sans-jp text-slate-700 text-sm dark:text-slate-200"
        >
          マイレンジ表
        </label>
        <Button asChild>
          <Link href="/settings/open-range">設定</Link>
        </Button>
      </div>
    </TabsContent>
  );
}
