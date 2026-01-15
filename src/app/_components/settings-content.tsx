import { HeaderTitle } from "@/components/header-title";
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
    </TabsContent>
  );
}
