import { Heart } from "lucide-react";
import { TabsContent } from "@/components/shadcn/tabs";
import { PageTitle } from "@/components/ui/page-title";
import { InvitationLink } from "./invitation-link";
import { RangeSettingLink } from "./range-setting-link";
import { SwitchDarkMode } from "./switch-dark-mode";
import { UpdateApp } from "./update-app";

export function SettingsContent() {
  return (
    <TabsContent
      value="settings"
      className="flex w-full flex-col items-center gap-y-8"
    >
      <PageTitle title="Settings" description="設定用のページです。" />
      <Heart
        size={320}
        fill="currentColor"
        strokeWidth={3}
        className="fixed right-0 bottom-20 -z-10 translate-x-1/5 rotate-12 text-pink-400 dark:text-pink-950"
      />

      <div className="w-full space-y-3">
        <SwitchDarkMode />
        <RangeSettingLink />
        <UpdateApp />
        <InvitationLink />
      </div>
    </TabsContent>
  );
}
