"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpdateApp() {
  const reloadApp = () => {
    window.location.reload();
  };

  return (
    <div className="flex w-full items-center justify-between rounded-lg border p-4 shadow-sm backdrop-blur-xs">
      <div className="flex w-fit flex-col items-end gap-y-1.5">
        <div className="flex items-center gap-3">
          <span className="">アプリを最新版にする</span>
        </div>
        <p className="text-muted-foreground text-xs/[1]">
          現在のバージョン v0.02
        </p>
      </div>
      <Button className="font-bold" size="lg" onClick={reloadApp}>
        更新 <RefreshCcw />
      </Button>
    </div>
  );
}
