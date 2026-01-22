"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function SwitchDarkMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex w-full items-center justify-between rounded-lg border p-4 shadow-sm backdrop-blur-xs">
      <label htmlFor="dark-mode-switch" className="flex items-center gap-3">
        <span className="">ダークモード</span>
        <span className="flex items-center gap-2">
          <Sun
            className={cn(
              "size-5 transition",
              mounted && !isDark ? "text-orange-500" : "text-slate-400/60",
            )}
          />
          <Moon
            className={cn(
              "size-5 transition",
              mounted && isDark ? "text-yellow-400" : "text-slate-400/60",
            )}
          />
        </span>
      </label>
      <Switch
        id="dark-mode-switch"
        checked={mounted && isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
