"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { RiMoonClearFill } from "react-icons/ri";
import { PiSunHorizonBold } from "react-icons/pi";
import Head from "next/head";

export const ChangeModeButton = () => {
  const { theme, setTheme } = useTheme();

  const handleOnClick = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <>
      <Head>
        <meta
          name="theme-color"
          content={theme === "light" ? "#000000" : "#000000"}
        />
      </Head>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-background/0 group relative"
        onClick={handleOnClick}
      >
        <RiMoonClearFill className="block dark:hidden" size={24} />
        <PiSunHorizonBold className="hidden dark:block" size={24} />
      </Button>
    </>
  );
};
