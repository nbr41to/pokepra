import { Heart } from "lucide-react";
import { HeaderTitle } from "@/components/header-title";
import { TabsContent } from "@/components/ui/tabs";
import { RangeSettingLink } from "./range-setting-link";
import { SwitchDarkMode } from "./switch-dark-mode";
import { UpdateApp } from "./update-app";

export function SettingsContent() {
  return (
    <TabsContent
      value="settings"
      className="flex w-full flex-col items-center gap-y-8"
    >
      <HeaderTitle title="Settings" description="設定用のページです。" />
      <Heart
        size={320}
        fill="currentColor"
        strokeWidth={3}
        className="fixed bottom-20 left-2/5 -z-10 rotate-12 text-pink-400 dark:text-pink-950"
      />

      <div className="w-full space-y-3">
        <SwitchDarkMode />
        <RangeSettingLink />
        <UpdateApp />
      </div>
    </TabsContent>
  );
}
