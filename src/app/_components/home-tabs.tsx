"use client";

import { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { FooterTablist } from "./footer-navigation";
import { IntroductionContent } from "./introduction/introduction-content";
import {
  HOME_SCROLL_CONTAINER_ID,
  HOME_TAB_KEY,
  RestoreHomeScroll,
} from "./restore-home-scroll";
import { SettingsContent } from "./settings/settings-content";
import { TipsContent } from "./tips/tips-content";
import { ToolsContent } from "./tools/tools-content";
import { TrainersContent } from "./trainers/trainers-content";

const DEFAULT_TAB = "introduction";

export const HomeTabs = () => {
  const [tabValue, setTabValue] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(HOME_TAB_KEY);

    setTabValue(stored ? stored : DEFAULT_TAB);
  }, []);

  return (
    <div
      id={HOME_SCROLL_CONTAINER_ID}
      className="h-dvh w-full overflow-scroll px-2 py-8"
    >
      <RestoreHomeScroll tabValue={tabValue} />
      <Tabs value={tabValue} onValueChange={setTabValue} className="pb-24">
        <IntroductionContent />
        <TrainersContent />
        <ToolsContent />
        <TipsContent />
        <SettingsContent />
        <FooterTablist className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2" />
      </Tabs>
    </div>
  );
};
