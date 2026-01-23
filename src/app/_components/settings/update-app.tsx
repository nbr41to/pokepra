"use client";

import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UpdateApp() {
  const [updating, setUpdating] = useState(false);

  const reloadApp = async () => {
    setUpdating(true);

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
      <Button
        className="font-bold"
        size="lg"
        onClick={reloadApp}
        disabled={updating}
      >
        {updating ? "更新中..." : "更新"} <RefreshCcw />
      </Button>
    </div>
  );
}
