"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { GiWerewolf } from "react-icons/gi";
import { MdDoNotDisturb } from "react-icons/md";
import { RiMoonClearFill } from "react-icons/ri";
import { PiSunHorizonBold } from "react-icons/pi";

export const ChangeModeButton = () => {
  const { theme, setTheme } = useTheme();

  const handleOnClick = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group relative"
      onClick={handleOnClick}
    >
      <RiMoonClearFill className="block dark:hidden" size={24} />
      <PiSunHorizonBold className="hidden dark:block" size={24} />
    </Button>
  );
};
