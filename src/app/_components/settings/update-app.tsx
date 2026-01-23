"use client";

import { RefreshCcw } from "lucide-react";
import {
  HOME_SCROLL_KEY,
  HOME_TAB_KEY,
  HOME_WINDOW_SCROLL_KEY,
} from "@/app/_components/restore-home-scroll";
import { Button } from "@/components/ui/button";

export function UpdateApp() {
  const reloadApp = async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister()),
        );
      }

      sessionStorage.removeItem(HOME_TAB_KEY);
      sessionStorage.removeItem(HOME_SCROLL_KEY);
      sessionStorage.removeItem(HOME_WINDOW_SCROLL_KEY);
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="flex w-full items-center justify-between rounded-lg border p-4 shadow-sm backdrop-blur-xs">
      <div className="flex w-fit flex-col items-end gap-y-1.5">
        <div className="flex items-center gap-3">
          <span className="">アプリを最新版にする</span>
        </div>
        <p className="text-muted-foreground text-xs/[1]">
          現在のバージョン v{process.env.NEXT_PUBLIC_APP_VERSION}
        </p>
      </div>
      <Button className="font-bold" size="lg" onClick={reloadApp}>
        更新 <RefreshCcw />
      </Button>
    </div>
  );
}
