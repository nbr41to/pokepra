"use client";

import { useEffect, useState } from "react";

import { Tabs } from "@/components/ui/tabs";

import { FooterTablist } from "./footer-navigation";
import { IntroductionContent } from "./introduction-content";
import {
  HOME_SCROLL_CONTAINER_ID,
  HOME_TAB_KEY,
  RestoreHomeScroll,
} from "./restore-home-scroll";
import { SettingsContent } from "./settings-content";
import { TipsContent } from "./tips-content";
import { ToolsContent } from "./tools-content";
import { TrainerContent } from "./trainer-content";

const DEFAULT_TAB = "introduction";

export const HomeTabs = () => {
  const [tabValue, setTabValue] = useState(DEFAULT_TAB);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(HOME_TAB_KEY);
    if (stored) {
      setTabValue(stored);
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <div
      id={HOME_SCROLL_CONTAINER_ID}
      className="h-dvh w-full overflow-scroll px-2 py-8"
    >
      <RestoreHomeScroll tabValue={tabValue} />
      <Tabs value={tabValue} onValueChange={setTabValue} className="pb-24">
        <IntroductionContent />
        <TrainerContent />
        <ToolsContent />
        <TipsContent />
        <SettingsContent />
        <FooterTablist className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2" />
      </Tabs>
    </div>
  );
};
