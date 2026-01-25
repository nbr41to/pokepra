"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

export function SwitchDarkMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleOnClick = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="flex w-full items-center justify-between rounded-lg border p-4 shadow-sm backdrop-blur-xs">
      <div>ダークモード</div>

      <Button className="font-bold" size="lg" onClick={handleOnClick}>
        変更
        <Sun className={cn("dark:hidden")} />
        <Moon className={cn("hidden dark:block")} />
      </Button>
    </div>
  );
}
