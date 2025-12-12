"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { RiMoonClearFill } from "react-icons/ri";
import { PiSunHorizonBold } from "react-icons/pi";
import { setCookie } from "@/utils/cookie";
import { useState } from "react";

export const ChangeModeButton = () => {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setTheme(theme === "light" ? "dark" : "light");
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const themeColor = theme === "light" ? "#000000" : "#FFFFFF";
    metaThemeColor?.setAttribute("content", themeColor);
    await setCookie("theme", theme === "light" ? "dark" : "light");
    setIsLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group relative hover:bg-background/0"
      disabled={isLoading}
      onClick={handleOnClick}
    >
      <RiMoonClearFill className="block dark:hidden" size={24} />
      <PiSunHorizonBold className="hidden dark:block" size={24} />
    </Button>
  );
};
